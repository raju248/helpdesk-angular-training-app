import { ValidatorFn } from '@angular/forms';

export const httpUrlValidator: ValidatorFn = (control) => {
  const value: unknown = control.value;

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return { httpUrl: true };
  }

  try {
    const link = value.trim();
    const url = new URL(link);
    return /^https?:\/\//i.test(link) && (url.protocol === 'http:' || url.protocol === 'https:')
      ? null
      : { httpUrl: true };
  } catch {
    return { httpUrl: true };
  }
};
