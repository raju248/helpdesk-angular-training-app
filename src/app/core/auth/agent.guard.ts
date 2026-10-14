import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AgentGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.currentUser;

    if (!user) {
      void this.router.navigate(['/login']);
      return false;
    }

    if (user.role === 'agent') {
      return true;
    }

    void this.router.navigate(['/tickets']);
    return false;
  }
}
