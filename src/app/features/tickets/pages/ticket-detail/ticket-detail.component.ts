import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, finalize, forkJoin } from 'rxjs';

import { User } from '../../../../core/auth/user.model';
import { ApiError } from '../../../../core/interceptors/api-error';
import { CommentComponent } from '../../../../shared/components/comment/comment.component';
import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { Category } from '../../../../shared/models/category.model';
import { Comment } from '../../../../shared/models/comment.model';
import { Ticket } from '../../../../shared/models/ticket.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { TicketService } from '../../services/ticket.service';

@Component({
  standalone: true,
  selector: 'app-ticket-detail',
  imports: [DatePipe, NgFor, NgIf, RouterLink, CommentComponent, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private routeSubscription?: Subscription;
  private ticketSubscription?: Subscription;
  private ticketId: number | null = null;
  private users: User[] = [];
  private categories: Category[] = [];

  protected ticket: Ticket | null = null;
  protected comments: Comment[] = [];
  protected loading = true;
  protected notFound = false;
  protected errorMessage = '';

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.ticketId = Number.isSafeInteger(id) && id > 0 ? id : null;
      this.loadTicket();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.ticketSubscription?.unsubscribe();
  }

  protected loadTicket(): void {
    this.ticketSubscription?.unsubscribe();
    this.ticket = null;
    this.comments = [];
    this.users = [];
    this.categories = [];
    this.errorMessage = '';
    this.notFound = false;

    if (this.ticketId === null) {
      this.loading = false;
      this.notFound = true;
      this.errorMessage = 'This ticket could not be found.';
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.loading = true;
    this.changeDetectorRef.markForCheck();
    this.ticketSubscription = forkJoin({
      ticket: this.ticketService.getTicket(this.ticketId),
      comments: this.ticketService.getComments(this.ticketId),
      users: this.ticketService.getUsers(),
      categories: this.ticketService.getCategories(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: ({ ticket, comments, users, categories }) => {
          this.ticket = ticket;
          this.comments = comments;
          this.users = users;
          this.categories = categories;
        },
        error: (error: unknown) => {
          this.notFound = error instanceof ApiError
            && error.status === 404
            && !!error.url?.endsWith(`/tickets/${this.ticketId}`);
          this.errorMessage = this.notFound
            ? 'This ticket could not be found.'
            : error instanceof ApiError
              ? error.message
              : 'Ticket details could not be loaded. Please try again.';
        },
      });
  }

  protected userName(id: number | null): string {
    if (id === null) {
      return 'Unassigned';
    }

    return this.users.find((user) => user.id === id)?.name ?? 'Unknown user';
  }

  protected categoryName(id: number): string {
    return this.categories.find((category) => category.id === id)?.name ?? 'Unknown category';
  }
}
