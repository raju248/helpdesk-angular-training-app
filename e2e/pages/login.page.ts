import { expect, type Page } from '@playwright/test';

import type { UserRole } from '../../src/app/core/auth/user.model';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async loginAs(role: UserRole, locale: string): Promise<void> {
    await this.page.goto('/login');
    const language = locale.startsWith('bn') ? 'bn' : 'en';
    await expect(this.page.getByTestId('language-select')).toHaveValue(language);
    await expect(this.page.getByTestId('language-select')).toBeEnabled();
    await expect(this.page.locator('html')).toHaveAttribute('lang', language);
    await this.page.getByTestId(`demo-account-${role}`).click();
    await this.page.getByTestId('login-submit').click();
    await expect(this.page).toHaveURL(/\/tickets$/);
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('logout').click();
    await expect(this.page).toHaveURL(/\/login$/);
  }
}
