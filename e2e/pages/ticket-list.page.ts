import type { Page } from '@playwright/test';

export class TicketListPage {
  constructor(private readonly page: Page) {}

  card(id: number) {
    return this.page.getByTestId(`ticket-card-${id}`);
  }

  async createTicket(): Promise<void> {
    await this.page.getByTestId('create-ticket').click();
  }

  async openTicket(id: number): Promise<void> {
    await this.card(id).getByTestId('open-ticket').click();
  }
}
