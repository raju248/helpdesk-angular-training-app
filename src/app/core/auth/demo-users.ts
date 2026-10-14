import { DemoUser } from './user.model';

export const DEMO_USERS: readonly DemoUser[] = [
  {
    id: 1,
    name: 'Demo Customer',
    email: 'customer@helpdesk.test',
    password: 'customer123',
    role: 'customer',
  },
  {
    id: 2,
    name: 'Demo Agent',
    email: 'agent@helpdesk.test',
    password: 'agent123',
    role: 'agent',
  },
];
