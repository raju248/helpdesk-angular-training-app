import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TicketStatusBadgeComponent } from '../../../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { PriorityHighlightDirective } from '../../../../shared/directives/priority-highlight.directive';
import { TicketPriority, TicketStatus } from '../../../../shared/models/ticket.types';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

interface TicketPreview {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  updatedAt: string;
}

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [NgFor, RouterLink, TicketStatusBadgeComponent, PriorityHighlightDirective, TimeAgoPipe],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent {
  protected readonly sampleTickets: readonly TicketPreview[] = [
    {
      id: 1,
      title: 'Cannot sign in to my account',
      description: 'The password reset link expires before I can use it.',
      priority: 'high',
      status: 'open',
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'Email notifications arrive late',
      description: 'Support notifications take several hours to reach my inbox.',
      priority: 'medium',
      status: 'in-progress',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: 'Profile picture was not updating',
      description: 'The updated picture now appears correctly on my profile.',
      priority: 'low',
      status: 'resolved',
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: 'Request a copy of my receipt',
      description: 'The receipt has been sent and the request is complete.',
      priority: 'medium',
      status: 'closed',
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
