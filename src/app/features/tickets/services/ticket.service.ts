import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Ticket } from '../../../shared/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly ticketsUrl = `${environment.apiUrl}/tickets`;

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.ticketsUrl);
  }
}
