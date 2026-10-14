import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { DEMO_USERS } from '../../../../core/auth/demo-users';
import { DemoUser } from '../../../../core/auth/user.model';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly demoUsers = DEMO_USERS;
  protected email = '';
  protected password = '';
  protected errorMessage = this.route.snapshot.queryParamMap.get('reason') === 'session-expired'
    ? 'Your session has expired. Please sign in again.'
    : '';

  protected login(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    const result = this.authService.login(this.email, this.password);

    if (result === 'invalid-credentials') {
      this.errorMessage = 'Email or password is incorrect. Use one of the demo accounts below.';
      return;
    }

    if (result === 'storage-unavailable') {
      this.errorMessage = 'Your browser could not save the session. Enable browser storage and try again.';
      return;
    }

    this.password = '';
    void this.router.navigate(['/tickets']);
  }

  protected useDemoUser(user: DemoUser, form: NgForm): void {
    form.resetForm({ email: user.email, password: user.password });
    this.errorMessage = '';
  }
}
