import { test, expect } from './fixtures/helpdesk-api';
import { LoginPage } from './pages/login.page';
import { TicketDetailPage } from './pages/ticket-detail.page';
import { TicketFormPage } from './pages/ticket-form.page';
import { TicketListPage } from './pages/ticket-list.page';

test('customer creates a validated ticket with links and can reload it', async ({ page, api }, testInfo) => {
  const list = new TicketListPage(page);
  const form = new TicketFormPage(page);
  const detail = new TicketDetailPage(page);
  await new LoginPage(page).loginAs('customer', testInfo.project.use.locale!);
  await list.createTicket();

  await form.save();
  await expect(form.titleError).toBeVisible();
  await expect(form.categoryError).toBeVisible();
  expect(api.writes).toHaveLength(0);

  const title = 'Invoice download fails';
  const description = 'The invoice download returns an error.';
  await form.fill({ title: `  ${title}  `, description: ` ${description} `, priority: 'high', categoryName: api.categories[1].name });
  await form.addLink('ftp://example.test/invoice');
  await form.save();
  await expect(form.linkErrors).toBeVisible();
  expect(api.writes).toHaveLength(0);

  const links = ['https://example.test/invoice', 'https://example.test/screenshot'];
  await form.links.first().fill(links[0]);
  await form.addLink('https://example.test/remove-me');
  await form.removeLink(1);
  await form.addLink(links[1]);
  await expect(form.links).toHaveCount(2);
  await expect(form.links.nth(0)).toHaveValue(links[0]);
  await expect(form.links.nth(1)).toHaveValue(links[1]);
  await expect(form.linkErrors).toHaveCount(0);
  await form.save();

  await expect(detail.title).toHaveText(title);
  const saved = api.tickets.find((ticket) => ticket.title === title)!;
  await expect(page).toHaveURL(new RegExp(`/tickets/${saved.id}$`));
  await expect(detail.detail).toHaveAttribute('data-ticket-id', String(saved.id));
  await expect(detail.status).toHaveAttribute('data-status', 'open');
  await expect(detail.links).toHaveCount(2);
  for (const [index, link] of links.entries()) {
    await expect(detail.links.nth(index)).toHaveAttribute('href', link);
  }
  expect(api.writes).toHaveLength(1);
  expect(api.writes[0]).toMatchObject({
    method: 'POST', path: '/tickets', authorization: 'Bearer demo-token-1',
    body: { title, description, priority: 'high', categoryId: 2, links, status: 'open', customerId: 1, assigneeId: null },
  });
  expect(api.writes[0].body).not.toHaveProperty('id');
  expect(Number.isNaN(Date.parse(saved.createdAt))).toBe(false);

  await page.reload();
  await expect(detail.title).toHaveText(title);
  await expect(detail.links).toHaveCount(2);
  expect(api.tickets.filter((ticket) => ticket.title === title)).toHaveLength(1);
});
