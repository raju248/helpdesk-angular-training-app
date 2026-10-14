import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [RouterLink],
  templateUrl: './ticket-list.component.html',
})
export class TicketListComponent {}
