import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
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
  imports: [AsyncPipe, TranslatePipe, DatePipe, FormsModule, NgFor, NgIf, RouterLink, CommentComponent, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  protected readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private routeSubscription?: Subscription;
  private ticketSubscription?: Subscription;
  private commentSubscription?: Subscription;
  private ticketId: number | null = null;
  private users: User[] = [];
  private categories: Category[] = [];

  protected ticket: Ticket | null = null;
  protected comments: Comment[] = [];
  protected loading = true;
  protected notFound = false;
  protected errorMessage = '';
  protected readonly commentPattern = /\S/;
  protected commentBody = '';
  protected savingComment = false;
  protected commentError = '';

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
    this.ticket = null;
    this.comments = [];
    this.users = [];
    this.categories = [];
    this.errorMessage = '';
    this.notFound = false;
    this.commentBody = '';
    this.commentError = '';

    if (this.ticketId === null) {
      this.loading = false;
      this.notFound = true;
      this.errorMessage = 'errors.ticketNotFound';
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
            ? 'errors.ticketNotFound'
            : error instanceof ApiError
              ? error.message
              : 'errors.ticketDetailsLoad';
        },
      });
  }

  protected addComment(form: NgForm): void {
    if (!this.ticket || this.loading || this.savingComment) {
      return;
    }

    this.commentError = '';
    form.form.markAllAsTouched();
    const body = this.commentBody.trim();

    if (form.invalid || !body) {
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      void this.router.navigate(['/login']);
      return;
    }

    this.savingComment = true;
    this.commentSubscription = this.ticketService.addComment({
      ticketId: this.ticket.id,
      userId: user.id,
      body,
      createdAt: new Date().toISOString(),
    })
      .pipe(finalize(() => {
        this.savingComment = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];
          this.commentBody = '';
          form.resetForm({ body: '' });
        },
        error: (error: unknown) => {
          this.commentError = error instanceof ApiError
            ? error.message
            : 'errors.commentSave';
        },
      });
  }

  protected userName(id: number | null): string | null {
    if (id === null) {
      return null;
    }

    return this.users.find((user) => user.id === id)?.name ?? null;
  }

  protected categoryName(id: number): string | null {
    return this.categories.find((category) => category.id === id)?.name ?? null;
  }
}
