import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const agentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return user.role === 'agent' ? true : router.createUrlTree(['/tickets']);
};
