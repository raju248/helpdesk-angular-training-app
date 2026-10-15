import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import english from '../../../../public/i18n/en.json';
import bangla from '../../../../public/i18n/bn.json';
import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const now = Date.parse('2026-10-15T12:00:00.000Z');
  let pipe: TimeAgoPipe;
  let translate: TranslateService;
  let subscription: Subscription | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeAgoPipe, provideTranslateService()],
    });
    pipe = TestBed.inject(TimeAgoPipe);
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', english);
    translate.setTranslation('bn', bangla);
    translate.use('en');
    vi.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.restoreAllMocks();
  });

  it('returns null for missing or invalid dates', () => {
    for (const value of [null, undefined, '', 'not-a-date']) {
      expect(pipe.transform(value)).toBeNull();
    }
  });

  it.each([
    [-59, 'Just now'],
    [-60, '1 minute ago'],
    [-120, '2 minutes ago'],
    [-3600, '1 hour ago'],
    [-86400, '1 day ago'],
    [-604800, '1 week ago'],
    [-2592000, '1 month ago'],
    [-31536000, '1 year ago'],
    [120, 'in 2 minutes'],
  ] as const)('formats a date %i seconds from now as "%s"', (seconds, expected) => {
    let result: string | undefined;
    const date = new Date(now + seconds * 1000).toISOString();
    subscription = pipe.transform(date)!.subscribe((value) => { result = value; });

    expect(result).toBe(expected);
  });

  it('updates the existing result when the language changes', () => {
    let result: string | undefined;
    const date = new Date(now - 120000).toISOString();
    subscription = pipe.transform(date)!.subscribe((value) => { result = value; });
    expect(result).toBe('2 minutes ago');

    translate.use('bn');

    expect(result).toBe('2 মিনিট আগে');
  });
});
