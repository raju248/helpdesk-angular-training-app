import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
} from 'rxjs';

import { ApiError } from '../../../../core/interceptors/api-error';
import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { Ticket, TicketFilters } from '../../../../shared/models/ticket.model';
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
  private readonly searchChanges = new Subject<string>();
  private readonly ticketRequests = new Subject<TicketFilters>();
  private searchSubscription?: Subscription;
  private queryParamSubscription?: Subscription;
  private ticketSubscription?: Subscription;
  private searchQuery = '';

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
  protected searchTerm = '';
  protected tickets: Ticket[] = [];
  protected loading = true;
  protected errorMessage = '';

  ngOnInit(): void {
    this.ticketSubscription = this.ticketRequests
      .pipe(
        switchMap((filters) => {
          this.loading = true;
          this.errorMessage = '';
          this.tickets = [];
          this.changeDetectorRef.markForCheck();

          return this.ticketService.getTickets(filters).pipe(
            catchError((error: unknown) => {
              this.errorMessage = error instanceof ApiError
                ? error.message
                : 'Tickets could not be loaded. Please try again.';
              // Complete this failed request while keeping future searches active.
              return new Observable<Ticket[]>((subscriber) => subscriber.complete());
            }),
            finalize(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
            }),
          );
        }),
      )
      .subscribe((tickets) => {
        this.tickets = tickets;
      });

    this.searchSubscription = this.searchChanges
      .pipe(map((term) => term.trim()), distinctUntilChanged(), debounceTime(300))
      .subscribe((term) => {
        if (term !== this.searchQuery) {
          this.searchTerm = term;
          this.updateFilters();
        }
      });

    this.queryParamSubscription = this.route.queryParamMap.subscribe((params) => {
      const status = params.get('status');
      const priority = params.get('priority');
      const search = params.get('q');
      this.statusFilter = this.statusOptions.find((option) => option.value === status)?.value ?? '';
      this.priorityFilter = this.priorityOptions.find((option) => option.value === priority)?.value ?? '';
      this.searchQuery = search?.trim() ?? '';
      this.searchTerm = this.searchQuery;
      this.searchChanges.next(this.searchQuery);

      if (
        (status !== null && status !== this.statusFilter) ||
        (priority !== null && priority !== this.priorityFilter) ||
        (search !== null && search !== this.searchQuery)
      ) {
        this.updateFilters(true);
        return;
      }

      this.loadTickets();
    });
  }

  ngOnDestroy(): void {
    this.queryParamSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.ticketSubscription?.unsubscribe();
    this.searchChanges.complete();
    this.ticketRequests.complete();
  }

  protected search(term: string): void {
    this.searchTerm = term;
    this.searchChanges.next(term);
  }

  protected updateFilters(replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.statusFilter || null,
        priority: this.priorityFilter || null,
        q: this.searchTerm.trim() || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  protected clearFilters(): void {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.searchTerm = '';
    this.searchChanges.next('');
    this.updateFilters();
  }

  protected loadTickets(): void {
    this.ticketRequests.next({
      status: this.statusFilter || undefined,
      priority: this.priorityFilter || undefined,
      search: this.searchQuery || undefined,
    });
  }
}
