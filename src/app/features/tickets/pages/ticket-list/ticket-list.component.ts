import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { Ticket } from '../../../../shared/models/ticket.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { TicketService } from '../../services/ticket.service';

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [NgFor, NgIf, RouterLink, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit, OnDestroy {
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private ticketSubscription?: Subscription;

  protected tickets: Ticket[] = [];
  protected loading = true;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.ticketSubscription?.unsubscribe();
  }

  protected loadTickets(): void {
    this.ticketSubscription?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';
    this.tickets = [];

    this.ticketSubscription = this.ticketService
      .getTickets()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
        },
        error: () => {
          this.errorMessage = 'Tickets could not be loaded. Please try again.';
        },
      });
  }
}
