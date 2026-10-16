import { TranslatePipe } from '@ngx-translate/core';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
} from 'rxjs';

import { ApiError } from '../../../../core/interceptors/api-error';
import { Ticket, TicketFilters } from '../../../../shared/models/ticket.model';
import { TicketPriority, TicketStatus } from '../../../../shared/models/ticket.types';
import { TicketListViewComponent } from '../../components/ticket-list-view/ticket-list-view.component';
import { TicketService } from '../../services/ticket.service';

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [TranslatePipe, FormsModule, RouterLink, TicketListViewComponent],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchChanges = new Subject<string>();
  private readonly ticketRequests = new Subject<TicketFilters>();
  private searchQuery = '';

  protected readonly statusOptions: readonly { value: TicketStatus; label: string }[] = [
    { value: 'open', label: 'statuses.open' },
    { value: 'in-progress', label: 'statuses.in-progress' },
    { value: 'resolved', label: 'statuses.resolved' },
    { value: 'closed', label: 'statuses.closed' },
  ];
  protected readonly priorityOptions: readonly { value: TicketPriority; label: string }[] = [
    { value: 'low', label: 'priorities.low' },
    { value: 'medium', label: 'priorities.medium' },
    { value: 'high', label: 'priorities.high' },
  ];
  protected statusFilter: TicketStatus | '' = '';
  protected priorityFilter: TicketPriority | '' = '';
  protected searchTerm = '';
  protected tickets: Ticket[] = [];
  protected loading = true;
  protected errorMessage = '';

  ngOnInit(): void {
    this.ticketRequests
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
                : 'errors.ticketListLoad';
              // Complete this failed request while keeping future searches active.
              return new Observable<Ticket[]>((subscriber) => subscriber.complete());
            }),
            finalize(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tickets) => {
        this.tickets = tickets;
      });

    this.searchChanges
      .pipe(
        map((term) => term.trim()),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        if (term !== this.searchQuery) {
          this.searchTerm = term;
          this.updateFilters();
        }
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
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

  protected openTicket(id: number): void {
    void this.router.navigate(['/tickets', id], { queryParamsHandling: 'preserve' });
  }
}
