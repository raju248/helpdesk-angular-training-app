import { test, expect } from './fixtures/helpdesk-api';
import { LoginPage } from './pages/login.page';
import { TicketDetailPage } from './pages/ticket-detail.page';
import { TicketListPage } from './pages/ticket-list.page';

test('customer validates a comment, retries a failed save, and sees the saved comment after reload', async ({ page, api }, testInfo) => {
  const detail = new TicketDetailPage(page);
  await new LoginPage(page).loginAs('customer', testInfo.project.use.locale!);
  await new TicketListPage(page).openTicket(1);
  await expect(detail.comment(1)).toBeVisible();

  await detail.commentInput.fill('   ');
  await detail.submitComment();
  await expect(detail.commentInputError).toBeVisible();
  expect(api.writes).toHaveLength(0);

  const body = 'The error appears after selecting account settings.';
  const draft = `  ${body}  `;
  api.failNextComment = true;
  await detail.commentInput.fill(draft);
  await detail.submitComment();
  await expect(detail.commentSaveError).toBeVisible();
  await expect(detail.commentSaveError).toHaveAttribute('data-error-key', 'errors.server');
  await expect(detail.commentInput).toHaveValue(draft);
  await expect(detail.comment(2)).toHaveCount(0);
  expect(api.comments).toHaveLength(1);

  await detail.submitComment();
  const newComment = detail.comment(2);
  await expect(newComment.getByTestId('comment-body')).toHaveText(body);
  await expect(newComment.getByTestId('comment-user-name')).toHaveText(api.users[0].name);
  await expect(detail.commentInput).toHaveValue('');
  await expect(detail.commentInputError).toHaveCount(0);
  await expect(detail.commentSaveError).toHaveCount(0);
  expect(api.writes).toHaveLength(2);
  expect(api.writes[1]).toMatchObject({
    method: 'POST', path: '/comments', authorization: 'Bearer demo-token-1',
    body: { ticketId: 1, userId: 1, body },
  });
  expect(api.comments[1]).toMatchObject({ id: 2, ticketId: 1, userId: 1, body });

  await page.reload();
  await expect(newComment.getByTestId('comment-body')).toHaveText(body);
  await expect(detail.comment(1)).toBeVisible();
  expect(api.comments).toHaveLength(2);
});
