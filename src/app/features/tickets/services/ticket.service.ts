import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { DemoUser } from '../../../core/auth/user.model';
import { Category } from '../../../shared/models/category.model';
import { Comment } from '../../../shared/models/comment.model';
import { Ticket, TicketFilters } from '../../../shared/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly ticketsUrl = `${environment.apiUrl}/tickets`;

  getTickets(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();

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
    return this.http.get<Ticket>(`${this.ticketsUrl}/${id}`);
  }

  getComments(ticketId: number): Observable<Comment[]> {
    const params = new HttpParams().set('ticketId', ticketId);
    return this.http.get<Comment[]>(`${environment.apiUrl}/comments`, { params });
  }

  getUsers(): Observable<DemoUser[]> {
    return this.http.get<DemoUser[]>(`${environment.apiUrl}/users`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }
}
