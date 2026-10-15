import type { Page } from '@playwright/test';

export class TicketDetailPage {
  readonly detail;
  readonly title;
  readonly status;
  readonly assignee;
  readonly links;
  readonly commentInput;
  readonly commentInputError;
  readonly commentSaveError;

  constructor(private readonly page: Page) {
    this.detail = page.getByTestId('ticket-detail');
    this.title = this.detail.getByTestId('ticket-detail-title');
    this.status = this.detail.getByTestId('ticket-status-badge');
    this.assignee = this.detail.getByTestId('ticket-detail-assignee');
    this.links = this.detail.getByTestId('ticket-detail-link');
    this.commentInput = this.detail.getByTestId('comment-input');
    this.commentInputError = this.detail.getByTestId('comment-input-error');
    this.commentSaveError = this.detail.getByTestId('comment-save-error');
  }

  comment(id: number) {
    return this.detail.getByTestId(`comment-${id}`);
  }

  async edit(): Promise<void> {
    await this.detail.getByTestId('edit-ticket').click();
  }

  async submitComment(): Promise<void> {
    await this.detail.getByTestId('comment-submit').click();
  }
}
