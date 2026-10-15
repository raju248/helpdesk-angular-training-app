import { test as base, expect, type Page } from '@playwright/test';

import { environment } from '../../src/environments/environment.development';
import { DEMO_USERS } from '../../src/app/core/auth/demo-users';
import type { Category } from '../../src/app/shared/models/category.model';
import type { Comment, CreateCommentRequest } from '../../src/app/shared/models/comment.model';
import type { CreateTicketRequest, Ticket, UpdateTicketRequest } from '../../src/app/shared/models/ticket.model';

interface ApiWrite {
  method: string;
  path: string;
  body: Record<string, unknown>;
  authorization: string | undefined;
}

async function mockHelpdeskApi(page: Page) {
  // Each test owns these records, including writes and reloads. No request reaches json-server.
  const api = {
    users: DEMO_USERS.map((user) => ({ ...user })),
    categories: [
      { id: 1, name: 'Account' },
      { id: 2, name: 'Billing' },
    ] satisfies Category[],
    tickets: [
      {
        id: 1,
        title: 'Account access problem',
        description: 'Unable to open the account settings.',
        priority: 'high',
        status: 'open',
        categoryId: 1,
        customerId: 1,
        assigneeId: null,
        links: [],
        createdAt: '2026-01-01T09:00:00.000Z',
        updatedAt: '2026-01-01T09:00:00.000Z',
      },
      {
        id: 2,
        title: 'Another customer ticket',
        description: 'A different customer needs help.',
        priority: 'low',
        status: 'open',
        categoryId: 2,
        customerId: 99,
        assigneeId: null,
        links: [],
        createdAt: '2026-01-02T09:00:00.000Z',
        updatedAt: '2026-01-02T09:00:00.000Z',
      },
    ] as Ticket[],
    comments: [
      { id: 1, ticketId: 1, userId: 2, body: 'Please share the error details.', createdAt: '2026-01-02T10:00:00.000Z' },
    ] as Comment[],
    writes: [] as ApiWrite[],
    failNextComment: false,
  };

  await page.route(`${environment.apiUrl}/**`, async (route) => {
    const request = route.request();
    const { pathname, searchParams } = new URL(request.url());
    const method = request.method();
    const respond = (data: unknown, status = 200) => route.fulfill({
      status,
      json: data,
      headers: { 'access-control-allow-origin': '*' },
    });

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
          'access-control-allow-headers': 'authorization, content-type',
        },
      });
      return;
    }

    if (method === 'POST' || method === 'PATCH') {
      api.writes.push({
        method,
        path: pathname,
        body: request.postDataJSON() as Record<string, unknown>,
        authorization: request.headers()['authorization'],
      });
    }

    if (method === 'GET' && pathname === '/users') {
      await respond(api.users);
      return;
    }
    if (method === 'GET' && pathname === '/categories') {
      await respond(api.categories);
      return;
    }
    if (method === 'GET' && pathname === '/tickets') {
      const tickets = api.tickets.filter((ticket) => {
        for (const key of ['id', 'customerId', 'status', 'priority'] as const) {
          const value = searchParams.get(key);
          if (value !== null && String(ticket[key]) !== value) {
            return false;
          }
        }
        const search = searchParams.get('q')?.toLowerCase() ?? '';
        return `${ticket.title} ${ticket.description}`.toLowerCase().includes(search);
      });
      await respond(tickets);
      return;
    }
    if (method === 'POST' && pathname === '/tickets') {
      const payload = request.postDataJSON() as CreateTicketRequest;
      const ticket: Ticket = { ...payload, id: Math.max(...api.tickets.map((item) => item.id)) + 1 };
      api.tickets.push(ticket);
      await respond(ticket, 201);
      return;
    }

    const ticketMatch = /^\/tickets\/(\d+)$/.exec(pathname);
    if (ticketMatch && (method === 'GET' || method === 'PATCH')) {
      const ticket = api.tickets.find((item) => item.id === Number(ticketMatch[1]));
      if (!ticket) {
        await respond({}, 404);
        return;
      }
      if (method === 'PATCH') {
        Object.assign(ticket, request.postDataJSON() as UpdateTicketRequest);
      }
      await respond(ticket);
      return;
    }
    if (method === 'GET' && pathname === '/comments') {
      await respond(api.comments.filter((comment) => comment.ticketId === Number(searchParams.get('ticketId'))));
      return;
    }
    if (method === 'POST' && pathname === '/comments') {
      if (api.failNextComment) {
        api.failNextComment = false;
        await respond({}, 503);
        return;
      }
      const payload = request.postDataJSON() as CreateCommentRequest;
      const comment: Comment = { ...payload, id: Math.max(...api.comments.map((item) => item.id)) + 1 };
      api.comments.push(comment);
      await respond(comment, 201);
      return;
    }

    throw new Error(`Unhandled mock API request: ${method} ${request.url()}`);
  });

  return api;
}

export const test = base.extend<{ api: Awaited<ReturnType<typeof mockHelpdeskApi>> }>({
  api: async ({ page }, use) => {
    await use(await mockHelpdeskApi(page));
  },
});

export { expect };
