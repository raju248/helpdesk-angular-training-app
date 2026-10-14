export type UserRole = 'customer' | 'agent';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface DemoUser extends User {
  password: string;
}
