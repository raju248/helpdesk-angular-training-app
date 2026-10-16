import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { DEMO_USERS } from '../../../../core/auth/demo-users';
import { DemoUser } from '../../../../core/auth/user.model';

@Component({
  standalone: true,
  imports: [TranslatePipe, FormsModule],
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
    ? 'errors.sessionExpired'
    : '';

  protected login(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      return;
    }

    const result = this.authService.login(this.email, this.password);

    if (result === 'invalid-credentials') {
      this.errorMessage = 'errors.invalidCredentials';
      return;
    }

    if (result === 'storage-unavailable') {
      this.errorMessage = 'errors.storage';
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
