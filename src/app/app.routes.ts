import { Routes } from '@angular/router';

import { AgentGuard } from './core/auth/agent.guard';
import { AuthGuard } from './core/auth/auth.guard';
import { GuestGuard } from './core/auth/guest.guard';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { TicketDetailComponent } from './features/tickets/pages/ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './features/tickets/pages/ticket-form/ticket-form.component';
import { TicketListComponent } from './features/tickets/pages/ticket-list/ticket-list.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tickets',
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    component: LoginComponent,
    title: 'Login | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets',
    canActivate: [AuthGuard],
    component: TicketListComponent,
    title: 'Tickets | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets/new',
    canActivate: [AuthGuard],
    component: TicketFormComponent,
    title: 'Create ticket | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets/:id/edit',
    canActivate: [AuthGuard],
    component: TicketFormComponent,
    title: 'Edit ticket | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets/:id',
    canActivate: [AuthGuard],
    component: TicketDetailComponent,
    title: 'Ticket details | Helpdesk Ticket Manager',
  },
  {
    path: 'admin',
    canActivate: [AgentGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
];
