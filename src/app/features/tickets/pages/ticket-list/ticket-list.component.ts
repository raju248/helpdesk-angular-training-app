import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { Ticket } from '../../../../shared/models/ticket.model';
import { TicketPriority, TicketStatus } from '../../../../shared/models/ticket.types';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { TicketService } from '../../services/ticket.service';

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [FormsModule, NgFor, NgIf, RouterLink, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit, OnDestroy {
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private queryParamSubscription?: Subscription;
  private ticketSubscription?: Subscription;

  protected readonly statusOptions: readonly { value: TicketStatus; label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];
  protected readonly priorityOptions: readonly { value: TicketPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  protected statusFilter: TicketStatus | '' = '';
  protected priorityFilter: TicketPriority | '' = '';
  protected tickets: Ticket[] = [];
  protected loading = true;
  protected errorMessage = '';

  ngOnInit(): void {
    this.queryParamSubscription = this.route.queryParamMap.subscribe((params) => {
      const status = params.get('status');
      const priority = params.get('priority');
      this.statusFilter = this.statusOptions.find((option) => option.value === status)?.value ?? '';
      this.priorityFilter = this.priorityOptions.find((option) => option.value === priority)?.value ?? '';

      if (
        (status !== null && status !== this.statusFilter) ||
        (priority !== null && priority !== this.priorityFilter)
      ) {
        this.updateFilters(true);
        return;
      }

      this.loadTickets();
    });
  }

  ngOnDestroy(): void {
    this.queryParamSubscription?.unsubscribe();
    this.ticketSubscription?.unsubscribe();
  }

  protected updateFilters(replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.statusFilter || null,
        priority: this.priorityFilter || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  protected clearFilters(): void {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.updateFilters();
  }

  protected loadTickets(): void {
    this.ticketSubscription?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';
    this.tickets = [];
    this.changeDetectorRef.markForCheck();

    this.ticketSubscription = this.ticketService
      .getTickets({
        status: this.statusFilter || undefined,
        priority: this.priorityFilter || undefined,
      })
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
