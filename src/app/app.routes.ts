import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { TicketDetailComponent } from './features/tickets/pages/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './features/tickets/pages/ticket-list/ticket-list.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tickets',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets',
    component: TicketListComponent,
    title: 'Tickets | Helpdesk Ticket Manager',
  },
  {
    path: 'tickets/:id',
    component: TicketDetailComponent,
    title: 'Ticket details | Helpdesk Ticket Manager',
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
];
