import { Routes } from '@angular/router';

import { AdminComponent } from './pages/admin/admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    data: { titleKey: 'pageTitles.admin' },
  },
];
