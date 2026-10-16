import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { Ticket } from '../../../../shared/models/ticket.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  standalone: true,
  selector: 'app-ticket-list-view',
  imports: [AsyncPipe, TranslatePipe, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-list-view.component.html',
})
export class TicketListViewComponent {
  @Input() tickets: readonly Ticket[] = [];
  @Input() loading = false;
  @Input() errorMessage = '';
  @Input() hasFilters = false;

  @Output() readonly retry = new EventEmitter<void>();
  @Output() readonly openTicket = new EventEmitter<number>();
}
