import { Routes } from '@angular/router';

import { agentGuard } from './core/auth/agent.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
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
    canActivate: [guestGuard],
    component: LoginComponent,
    data: { titleKey: 'pageTitles.login' },
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    component: TicketListComponent,
    data: { titleKey: 'pageTitles.tickets' },
  },
  {
    path: 'tickets/new',
    canActivate: [authGuard],
    component: TicketFormComponent,
    data: { titleKey: 'pageTitles.create' },
  },
  {
    path: 'tickets/:id/edit',
    canActivate: [authGuard],
    component: TicketFormComponent,
    data: { titleKey: 'pageTitles.edit' },
  },
  {
    path: 'tickets/:id',
    canActivate: [authGuard],
    component: TicketDetailComponent,
    data: { titleKey: 'pageTitles.detail' },
  },
  {
    path: 'admin',
    canActivate: [agentGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
];
