import { TranslatePipe } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';

import { TicketStatus } from '../../models/ticket.types';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  selector: 'app-ticket-status-badge',
  templateUrl: './ticket-status-badge.component.html',
})
export class TicketStatusBadgeComponent {
  @Input() status: TicketStatus = 'open';


  protected readonly statusClasses: Record<TicketStatus, string> = {
    open: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    'in-progress': 'bg-amber-50 text-amber-800 ring-amber-600/20',
    resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    closed: 'bg-slate-100 text-slate-600 ring-slate-400/20',
  };
}
