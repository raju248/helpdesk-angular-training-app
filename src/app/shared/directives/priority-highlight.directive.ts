import { Directive, Input } from '@angular/core';

import { TicketPriority } from '../models/ticket.types';

@Directive({
  standalone: true,
  selector: '[appPriorityHighlight]',
  host: {
    '[class]': 'priorityClasses[appPriorityHighlight]',
  },
})
export class PriorityHighlightDirective {
  @Input() appPriorityHighlight: TicketPriority = 'low';

  protected readonly priorityClasses: Record<TicketPriority, string> = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-amber-500',
    low: 'border-l-4 border-l-emerald-500',
  };
}
