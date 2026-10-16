import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription, catchError, filter, finalize } from 'rxjs';

import { AuthService } from './core/auth/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly pageTitle = inject(Title);
  private languageLoadSubscription?: Subscription;

  protected readonly currentUser = this.authService.currentUser;
  protected readonly language = signal('en');
  protected readonly loadingLanguage = signal(false);
  protected readonly languageError = signal('');

  ngOnInit(): void {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ lang }) => {
        this.language.set(lang);
        this.document.documentElement.lang = lang;
        this.updatePageTitle();
        try {
          localStorage.setItem('helpdesk.language', lang);
        } catch {
          // Language switching still works when browser storage is unavailable.
        }
      });
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updatePageTitle());
    this.switchLanguage(this.initialLanguage());
  }

  protected switchLanguage(language: string): void {
    if (language !== 'en' && language !== 'bn') {
      return;
    }

    this.languageLoadSubscription?.unsubscribe();
    this.language.set(language);
    this.languageError.set('');
    this.loadingLanguage.set(true);
    this.languageLoadSubscription = this.translate.use(language)
      .pipe(
        catchError((error: unknown) => {
          if (!this.translate.getCurrentLang() && language !== 'en') {
            this.language.set('en');
            return this.translate.use('en');
          }
          throw error;
        }),
        finalize(() => this.loadingLanguage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => {
          this.language.set(this.translate.getCurrentLang() ?? 'en');
          this.languageError.set('errors.languageLoad');
        },
      });
  }

  private initialLanguage(): string {
    try {
      const savedLanguage = localStorage.getItem('helpdesk.language');
      if (savedLanguage === 'en' || savedLanguage === 'bn') {
        return savedLanguage;
      }
    } catch {
      // Use the browser language when a preference cannot be read.
    }
    return this.translate.getBrowserLang() === 'bn' ? 'bn' : 'en';
  }

  private updatePageTitle(): void {
    if (!this.translate.getCurrentLang()) {
      return;
    }
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.pageTitle.setTitle(this.translate.instant(route.data['titleKey'] ?? 'app.title'));
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
