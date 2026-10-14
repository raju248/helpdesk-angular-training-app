import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { DemoUser } from '../../../core/auth/user.model';
import { ApiError } from '../../../core/interceptors/api-error';
import { Category } from '../../../shared/models/category.model';
import { Comment, CreateCommentRequest } from '../../../shared/models/comment.model';
import { CreateTicketRequest, Ticket, TicketFilters, UpdateTicketRequest } from '../../../shared/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly ticketsUrl = `${environment.apiUrl}/tickets`;

  getTickets(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();
    const user = this.authService.currentUser;

    if (user?.role === 'customer') {
      params = params.set('customerId', user.id);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }

    const search = filters.search?.trim();

    if (search) {
      params = params.set('q', search);
    }

    return this.http.get<Ticket[]>(this.ticketsUrl, { params });
  }

  getTicket(id: number): Observable<Ticket> {
    const user = this.authService.currentUser;

    if (user?.role === 'customer') {
      const params = new HttpParams().set('id', id).set('customerId', user.id);
      return this.http.get<Ticket[]>(this.ticketsUrl, { params }).pipe(
        map((tickets) => {
          const ticket = tickets[0];
          if (!ticket) {
            throw new ApiError('This ticket could not be found.', 404, `${this.ticketsUrl}/${id}`);
          }
          return ticket;
        }),
      );
    }

    return this.http.get<Ticket>(`${this.ticketsUrl}/${id}`);
  }

  createTicket(ticket: CreateTicketRequest): Observable<Ticket> {
    const user = this.authService.currentUser;
    return this.http.post<Ticket>(this.ticketsUrl, {
      ...ticket,
      customerId: user?.id ?? ticket.customerId,
      status: user?.role === 'agent' ? ticket.status : 'open',
      assigneeId: user?.role === 'agent' ? ticket.assigneeId : null,
    });
  }

  updateTicket(id: number, changes: UpdateTicketRequest): Observable<Ticket> {
    if (
      this.authService.currentUser?.role !== 'agent'
      && (changes.status !== undefined || changes.assigneeId !== undefined)
    ) {
      return new Observable<Ticket>((subscriber) => {
        subscriber.error(new ApiError('Only agents can change ticket status or assignee.', 403, `${this.ticketsUrl}/${id}`));
      });
    }

    const updates: UpdateTicketRequest = {
      title: changes.title,
      description: changes.description,
      priority: changes.priority,
      categoryId: changes.categoryId,
      links: changes.links,
      updatedAt: changes.updatedAt,
    };
    if (changes.status !== undefined) {
      updates.status = changes.status;
    }
    if (changes.assigneeId !== undefined) {
      updates.assigneeId = changes.assigneeId;
    }

    return this.getTicket(id).pipe(
      switchMap(() => this.http.patch<Ticket>(`${this.ticketsUrl}/${id}`, updates)),
    );
  }

  getComments(ticketId: number): Observable<Comment[]> {
    const params = new HttpParams().set('ticketId', ticketId);
    return this.getTicket(ticketId).pipe(
      switchMap(() => this.http.get<Comment[]>(`${environment.apiUrl}/comments`, { params })),
    );
  }

  addComment(comment: CreateCommentRequest): Observable<Comment> {
    return this.getTicket(comment.ticketId).pipe(
      switchMap(() => this.http.post<Comment>(`${environment.apiUrl}/comments`, {
        ...comment,
        userId: this.authService.currentUser?.id ?? comment.userId,
      })),
    );
  }

  getUsers(): Observable<DemoUser[]> {
    return this.http.get<DemoUser[]>(`${environment.apiUrl}/users`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }
}
