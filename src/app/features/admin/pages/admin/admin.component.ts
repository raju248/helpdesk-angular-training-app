import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
})
export class AdminComponent {}
