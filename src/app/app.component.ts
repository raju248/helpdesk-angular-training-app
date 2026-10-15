import { DOCUMENT, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription, filter, finalize } from 'rxjs';

import { AuthService } from './core/auth/auth.service';
import { User } from './core/auth/user.model';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly pageTitle = inject(Title);
  private currentUserSubscription?: Subscription;
  private languageSubscription?: Subscription;
  private languageLoadSubscription?: Subscription;
  private navigationSubscription?: Subscription;

  protected currentUser: User | null = null;
  protected language = 'en';
  protected loadingLanguage = false;
  protected languageError = '';

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.changeDetectorRef.markForCheck();
    });

    this.languageSubscription = this.translate.onLangChange.subscribe(({ lang }) => {
      this.language = lang;
      this.document.documentElement.lang = lang;
      this.updatePageTitle();
      try {
        localStorage.setItem('helpdesk.language', lang);
      } catch {
        // Language switching still works when browser storage is unavailable.
      }
      this.changeDetectorRef.markForCheck();
    });
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updatePageTitle());
    this.switchLanguage(this.initialLanguage());
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
    this.languageLoadSubscription?.unsubscribe();
    this.navigationSubscription?.unsubscribe();
  }

  protected switchLanguage(language: string): void {
    if (language !== 'en' && language !== 'bn') {
      return;
    }

    this.languageLoadSubscription?.unsubscribe();
    this.language = language;
    this.languageError = '';
    this.loadingLanguage = true;
    this.languageLoadSubscription = this.translate.use(language)
      .pipe(finalize(() => {
        this.loadingLanguage = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        error: () => {
          if (!this.translate.getCurrentLang() && language !== 'en') {
            this.switchLanguage('en');
          }
          this.language = this.translate.getCurrentLang() ?? 'en';
          this.languageError = 'errors.languageLoad';
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
