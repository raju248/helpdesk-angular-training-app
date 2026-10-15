import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  private readonly units = [
    { seconds: 31536000, label: 'year' },
    { seconds: 2592000, label: 'month' },
    { seconds: 604800, label: 'week' },
    { seconds: 86400, label: 'day' },
    { seconds: 3600, label: 'hour' },
    { seconds: 60, label: 'minute' },
  ];

  transform(value: string | null | undefined): Observable<string> | null {
    if (!value) {
      return null;
    }

    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    const now = Date.now();
    const seconds = Math.floor(Math.abs(now - timestamp) / 1000);

    if (seconds < 60) {
      return this.translate.stream('time.justNow');
    }

    for (const unit of this.units) {
      if (seconds >= unit.seconds) {
        const count = Math.floor(seconds / unit.seconds);
        const unitKey = `time.${unit.label}.${count === 1 ? 'one' : 'other'}`;
        return this.translate.stream(unitKey, { count }).pipe(
          map((duration) => this.translate.instant(timestamp > now ? 'time.future' : 'time.past', { duration })),
        );
      }
    }

    return null;
  }
}
