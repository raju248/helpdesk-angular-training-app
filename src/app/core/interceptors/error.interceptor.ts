import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiError } from './api-error';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = request.url === environment.apiUrl || request.url.startsWith(`${environment.apiUrl}/`);

  if (!isApiRequest) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        throw error;
      }

      if (error.status === 401) {
        authService.logout();
        void router.navigate(['/login'], {
          queryParams: { reason: 'session-expired' },
          replaceUrl: true,
        });
      }

      throw new ApiError(errorMessage(error.status), error.status, error.url);
    }),
  );
};

function errorMessage(status: number): string {
  switch (status) {
    case 0:
      return 'errors.network';
    case 400:
      return 'errors.badRequest';
    case 401:
      return 'errors.sessionExpired';
    case 403:
      return 'errors.forbidden';
    case 404:
      return 'errors.notFound';
    case 429:
      return 'errors.rateLimit';
    default:
      return status >= 500
        ? 'errors.server'
        : 'errors.unexpected';
  }
}
