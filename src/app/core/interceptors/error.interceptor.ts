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
      return 'Unable to reach the server. Check your connection and try again.';
    case 400:
      return 'The request could not be completed. Check the details and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested item could not be found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'The server is temporarily unavailable. Please try again.'
        : 'Something went wrong. Please try again.';
  }
}
