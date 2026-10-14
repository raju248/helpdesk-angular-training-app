import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly title = 'Helpdesk Ticket Manager';
}
