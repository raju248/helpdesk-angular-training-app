import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
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
  imports: [AsyncPipe, TranslatePipe, DatePipe, FormsModule, RouterLink, CommentComponent, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  protected readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private routeSubscription?: Subscription;
  private ticketSubscription?: Subscription;
  private commentSubscription?: Subscription;
  private ticketId: number | null = null;
  private readonly users = signal<User[]>([]);
  private readonly categories = signal<Category[]>([]);

  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly comments = signal<Comment[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly commentPattern = /\S/;
  protected readonly commentBody = signal('');
  protected readonly savingComment = signal(false);
  protected readonly commentError = signal('');
  protected readonly categoryName = computed(() => {
    const categoryId = this.ticket()?.categoryId;
    return this.categories().find((category) => category.id === categoryId)?.name ?? null;
  });
  protected readonly customerName = computed(() => this.userName(this.ticket()?.customerId ?? null));
  protected readonly assigneeName = computed(() => this.userName(this.ticket()?.assigneeId ?? null));

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
    this.commentSubscription?.unsubscribe();
  }

  protected loadTicket(): void {
    this.ticketSubscription?.unsubscribe();
    this.commentSubscription?.unsubscribe();
    this.ticket.set(null);
    this.comments.set([]);
    this.users.set([]);
    this.categories.set([]);
    this.errorMessage.set('');
    this.notFound.set(false);
    this.commentBody.set('');
    this.commentError.set('');

    if (this.ticketId === null) {
      this.loading.set(false);
      this.notFound.set(true);
      this.errorMessage.set('errors.ticketNotFound');
      return;
    }

    this.loading.set(true);
    this.ticketSubscription = forkJoin({
      ticket: this.ticketService.getTicket(this.ticketId),
      comments: this.ticketService.getComments(this.ticketId),
      users: this.ticketService.getUsers(),
      categories: this.ticketService.getCategories(),
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: ({ ticket, comments, users, categories }) => {
          this.ticket.set(ticket);
          this.comments.set(comments);
          this.users.set(users);
          this.categories.set(categories);
        },
        error: (error: unknown) => {
          const notFound = error instanceof ApiError
            && error.status === 404
            && !!error.url?.endsWith(`/tickets/${this.ticketId}`);
          this.notFound.set(notFound);
          this.errorMessage.set(notFound
            ? 'errors.ticketNotFound'
            : error instanceof ApiError
              ? error.message
              : 'errors.ticketDetailsLoad');
        },
      });
  }

  protected addComment(form: NgForm): void {
    const ticket = this.ticket();
    if (!ticket || this.loading() || this.savingComment()) {
      return;
    }

    this.commentError.set('');
    form.form.markAllAsTouched();
    const body = this.commentBody().trim();

    if (form.invalid || !body) {
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      void this.router.navigate(['/login']);
      return;
    }

    this.savingComment.set(true);
    this.commentSubscription = this.ticketService.addComment({
      ticketId: ticket.id,
      userId: user.id,
      body,
      createdAt: new Date().toISOString(),
    })
      .pipe(finalize(() => {
        this.savingComment.set(false);
      }))
      .subscribe({
        next: (comment) => {
          this.comments.update((comments) => [...comments, comment]);
          this.commentBody.set('');
          form.resetForm({ body: '' });
        },
        error: (error: unknown) => {
          this.commentError.set(error instanceof ApiError
            ? error.message
            : 'errors.commentSave');
        },
      });
  }

  protected userName(id: number | null): string | null {
    if (id === null) {
      return null;
    }

    return this.users().find((user) => user.id === id)?.name ?? null;
  }
}
