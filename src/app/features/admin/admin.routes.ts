import { Routes } from '@angular/router';

import { AdminComponent } from './pages/admin/admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    title: 'Admin | Helpdesk Ticket Manager',
  },
];
