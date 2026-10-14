import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  private readonly units = [
    { seconds: 31536000, label: 'year' },
    { seconds: 2592000, label: 'month' },
    { seconds: 604800, label: 'week' },
    { seconds: 86400, label: 'day' },
    { seconds: 3600, label: 'hour' },
    { seconds: 60, label: 'minute' },
  ];

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      return '';
    }

    const now = Date.now();
    const seconds = Math.floor(Math.abs(now - timestamp) / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    for (const unit of this.units) {
      if (seconds >= unit.seconds) {
        const count = Math.floor(seconds / unit.seconds);
        const duration = `${count} ${unit.label}${count === 1 ? '' : 's'}`;
        return timestamp > now ? `in ${duration}` : `${duration} ago`;
      }
    }

    return '';
  }
}
