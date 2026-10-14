import { TicketPriority, TicketStatus } from './ticket.types';

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  categoryId: number;
  customerId: number;
  assigneeId: number | null;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateTicketRequest = Omit<Ticket, 'id'>;

export type UpdateTicketRequest = Pick<
  Ticket,
  'title' | 'description' | 'priority' | 'categoryId' | 'links' | 'updatedAt'
>;
