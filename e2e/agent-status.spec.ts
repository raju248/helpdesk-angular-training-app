import { test, expect } from './fixtures/helpdesk-api';
import { LoginPage } from './pages/login.page';
import { TicketDetailPage } from './pages/ticket-detail.page';
import { TicketFormPage } from './pages/ticket-form.page';
import { TicketListPage } from './pages/ticket-list.page';

test('only an agent sees status and assignee controls and can persist their changes', async ({ page, api }, testInfo) => {
  const login = new LoginPage(page);
  const list = new TicketListPage(page);
  const detail = new TicketDetailPage(page);
  const form = new TicketFormPage(page);
  const locale = testInfo.project.use.locale!;
  await login.loginAs('customer', locale);
  await expect(list.card(1)).toBeVisible();
  await expect(list.card(2)).toHaveCount(0);
  await list.openTicket(1);
  await detail.edit();
  await expect(form.title).toHaveValue(api.tickets[0].title);
  await expect(form.status).toHaveCount(0);
  await expect(form.assignee).toHaveCount(0);
  await login.logout();

  await login.loginAs('agent', locale);
  await expect(list.card(2)).toBeVisible();
  await list.openTicket(1);
  await detail.edit();
  await expect(form.status).toHaveValue('open');
  await form.status.selectOption('resolved');
  await form.assignee.selectOption({ label: api.users[1].name });
  await form.save();

  await expect(page).toHaveURL(/\/tickets\/1$/);
  await expect(detail.status).toHaveAttribute('data-status', 'resolved');
  await expect(detail.assignee).toHaveText(api.users[1].name);
  expect(api.writes).toHaveLength(1);
  expect(api.writes[0]).toMatchObject({
    method: 'PATCH', path: '/tickets/1', authorization: 'Bearer demo-token-2',
    body: { status: 'resolved', assigneeId: 2 },
  });
  expect(api.writes[0].body).not.toHaveProperty('customerId');
  expect(api.writes[0].body).not.toHaveProperty('createdAt');
  expect(api.tickets[0]).toMatchObject({ status: 'resolved', assigneeId: 2, customerId: 1, createdAt: '2026-01-01T09:00:00.000Z' });

  await page.reload();
  await expect(detail.status).toHaveAttribute('data-status', 'resolved');
  await expect(detail.assignee).toHaveText(api.users[1].name);
});
