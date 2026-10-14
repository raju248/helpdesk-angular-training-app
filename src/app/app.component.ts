import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from './core/auth/auth.service';
import { User } from './core/auth/user.model';

@Component({
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private currentUserSubscription?: Subscription;

  protected readonly title = 'Helpdesk Ticket Manager';
  protected currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
