import { expect, type Page } from '@playwright/test';

import type { TicketPriority } from '../../src/app/shared/models/ticket.types';

export class TicketFormPage {
  readonly form;
  readonly title;
  readonly titleError;
  readonly description;
  readonly priority;
  readonly category;
  readonly categoryError;
  readonly links;
  readonly linkErrors;
  readonly status;
  readonly assignee;

  constructor(private readonly page: Page) {
    this.form = page.getByTestId('ticket-form');
    this.title = this.form.getByTestId('ticket-title');
    this.titleError = this.form.getByTestId('ticket-title-error');
    this.description = this.form.getByTestId('ticket-description');
    this.priority = this.form.getByTestId('ticket-priority');
    this.category = this.form.getByTestId('ticket-category');
    this.categoryError = this.form.getByTestId('ticket-category-error');
    this.links = this.form.getByTestId('ticket-link');
    this.linkErrors = this.form.getByTestId('ticket-link-error');
    this.status = this.form.getByTestId('ticket-status');
    this.assignee = this.form.getByTestId('ticket-assignee');
  }

  async fill(details: { title: string; description: string; priority: TicketPriority; categoryName: string }): Promise<void> {
    await this.title.fill(details.title);
    await this.description.fill(details.description);
    await this.priority.selectOption(details.priority);
    // Category names come from API records and stay the same in both UI languages.
    await this.category.selectOption({ label: details.categoryName });
  }

  async addLink(url: string): Promise<void> {
    const count = await this.links.count();
    await this.form.getByTestId('add-link').click();
    await expect(this.links).toHaveCount(count + 1);
    await this.links.nth(count).fill(url);
  }

  async removeLink(index: number): Promise<void> {
    const count = await this.links.count();
    await this.form.getByTestId('remove-link').nth(index).click();
    await expect(this.links).toHaveCount(count - 1);
  }

  async save(): Promise<void> {
    await this.form.getByTestId('ticket-save').click();
  }
}
