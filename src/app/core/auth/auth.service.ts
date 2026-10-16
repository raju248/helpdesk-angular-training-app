import { Injectable, signal } from '@angular/core';

import { DEMO_USERS } from './demo-users';
import { DemoUser, User } from './user.model';

interface AuthSession {
  token: string;
  userId: number;
}

export type LoginResult = 'success' | 'invalid-credentials' | 'storage-unavailable';

const SESSION_STORAGE_KEY = 'helpdesk.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private session: AuthSession | null = this.restoreSession();
  private readonly currentUserState = signal<User | null>(null);

  readonly currentUser = this.currentUserState.asReadonly();

  constructor() {
    const user = DEMO_USERS.find((demoUser) => demoUser.id === this.session?.userId);

    if (user) {
      this.currentUserState.set(this.toUser(user));
    }
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  login(email: string, password: string): LoginResult {
    const user = DEMO_USERS.find(
      (demoUser) =>
        demoUser.email === email.trim().toLowerCase() && demoUser.password === password,
    );

    if (!user) {
      return 'invalid-credentials';
    }

    const session: AuthSession = { token: `demo-token-${user.id}`, userId: user.id };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      return 'storage-unavailable';
    }

    this.session = session;
    this.currentUserState.set(this.toUser(user));
    return 'success';
  }

  logout(): void {
    this.clearStoredSession();
    this.session = null;
    this.currentUserState.set(null);
  }

  private restoreSession(): AuthSession | null {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!storedSession) {
        return null;
      }

      const session: unknown = JSON.parse(storedSession);

      if (
        typeof session === 'object' &&
        session !== null &&
        'userId' in session &&
        'token' in session &&
        typeof session.userId === 'number' &&
        typeof session.token === 'string' &&
        DEMO_USERS.some((user) => user.id === session.userId) &&
        session.token === `demo-token-${session.userId}`
      ) {
        return { userId: session.userId, token: session.token };
      }
    } catch {
      // Invalid JSON or unavailable browser storage should leave the user signed out.
    }

    this.clearStoredSession();
    return null;
  }

  private clearStoredSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Logout still clears in-memory state when browser storage is unavailable.
    }
  }

  private toUser(user: DemoUser): User {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
