import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-ticket-detail',
  imports: [RouterLink],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent {}
