import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_USERS } from '../../../core/auth/demo-users';
import { User } from '../../../core/auth/user.model';
import { CreateTicketRequest, Ticket, UpdateTicketRequest } from '../../../shared/models/ticket.model';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  const ticketsUrl = `${environment.apiUrl}/tickets`;
  const ticket: Ticket = {
    id: 1,
    title: 'Invoice download fails',
    description: 'The download returns an error.',
    priority: 'high',
    status: 'open',
    categoryId: 1,
    customerId: 1,
    assigneeId: null,
    links: [],
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  };
  let service: TicketService;
  let http: HttpTestingController;
  let auth: { currentUser: User };
  let subscription: Subscription | undefined;

  beforeEach(() => {
    auth = { currentUser: DEMO_USERS[0] };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    service = TestBed.inject(TicketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    subscription?.unsubscribe();
    http.verify();
  });

  it('loads filtered tickets belonging to the current customer', () => {
    let result: Ticket[] | undefined;
    subscription = service.getTickets({ status: 'open', priority: 'high', search: ' invoice ' })
      .subscribe((tickets) => { result = tickets; });

    const request = http.expectOne(`${ticketsUrl}?customerId=1&status=open&priority=high&q=invoice`);
    expect(request.request.method).toBe('GET');
    request.flush([ticket]);

    expect(result).toEqual([ticket]);
  });

  it('loads a ticket by its URL for an agent', () => {
    auth.currentUser = DEMO_USERS[1];
    let result: Ticket | undefined;
    subscription = service.getTicket(ticket.id).subscribe((value) => { result = value; });

    const request = http.expectOne(`${ticketsUrl}/${ticket.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(ticket);

    expect(result).toEqual(ticket);
  });

  it('creates a ticket using the current customer and customer-safe status and assignee', () => {
    const payload: CreateTicketRequest = {
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: 'closed',
      categoryId: ticket.categoryId,
      customerId: 99,
      assigneeId: 2,
      links: ticket.links,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
    let result: Ticket | undefined;
    subscription = service.createTicket(payload).subscribe((value) => { result = value; });

    const request = http.expectOne(ticketsUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ...payload, customerId: 1, status: 'open', assigneeId: null });
    request.flush(ticket);

    expect(result).toEqual(ticket);
  });

  it('checks ticket access before patching an agent update', () => {
    auth.currentUser = DEMO_USERS[1];
    const changes: UpdateTicketRequest = {
      title: 'Updated invoice ticket',
      description: ticket.description,
      priority: 'medium',
      categoryId: ticket.categoryId,
      links: ['https://example.com/invoice'],
      updatedAt: '2026-10-15T11:00:00.000Z',
      status: 'in-progress',
      assigneeId: 2,
    };
    let result: Ticket | undefined;
    subscription = service.updateTicket(ticket.id, changes).subscribe((value) => { result = value; });

    const accessRequest = http.expectOne(`${ticketsUrl}/${ticket.id}`);
    expect(accessRequest.request.method).toBe('GET');
    http.expectNone((request) => request.method === 'PATCH');
    accessRequest.flush(ticket);

    const updateRequest = http.expectOne(`${ticketsUrl}/${ticket.id}`);
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual(changes);
    const updatedTicket: Ticket = { ...ticket, ...changes };
    updateRequest.flush(updatedTicket);

    expect(result).toEqual(updatedTicket);
  });
});
