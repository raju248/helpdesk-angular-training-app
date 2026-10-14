import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (!this.authService.currentUser) {
      return true;
    }

    void this.router.navigate(['/tickets']);
    return false;
  }
}
