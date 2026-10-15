import { TranslatePipe } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subscription, finalize, forkJoin, map } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/user.model';
import { ApiError } from '../../../../core/interceptors/api-error';
import { Category } from '../../../../shared/models/category.model';
import { Ticket, UpdateTicketRequest } from '../../../../shared/models/ticket.model';
import { TicketPriority, TicketStatus } from '../../../../shared/models/ticket.types';
import { TicketService } from '../../services/ticket.service';
import { httpUrlValidator } from '../../validators/http-url.validator';

@Component({
  standalone: true,
  selector: 'app-ticket-form',
  imports: [TranslatePipe, NgFor, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.component.html',
})
export class TicketFormComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private routeSubscription?: Subscription;
  private loadSubscription?: Subscription;
  private saveSubscription?: Subscription;

  protected readonly form = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(/\S/)]),
    description: this.formBuilder.nonNullable.control(''),
    priority: this.formBuilder.nonNullable.control<TicketPriority>('medium', Validators.required),
    categoryId: this.formBuilder.control<number | null>(null, Validators.required),
    links: this.formBuilder.array<FormControl<string>>([]),
    status: this.formBuilder.nonNullable.control<TicketStatus>('open', Validators.required),
    assigneeId: this.formBuilder.control<number | null>(null),
  });
  protected readonly priorityOptions: readonly { value: TicketPriority; label: string }[] = [
    { value: 'low', label: 'priorities.low' },
    { value: 'medium', label: 'priorities.medium' },
    { value: 'high', label: 'priorities.high' },
  ];
  protected readonly statusOptions: readonly { value: TicketStatus; label: string }[] = [
    { value: 'open', label: 'statuses.open' },
    { value: 'in-progress', label: 'statuses.in-progress' },
    { value: 'resolved', label: 'statuses.resolved' },
    { value: 'closed', label: 'statuses.closed' },
  ];
  protected ticketId: number | null = null;
  protected editMode = false;
  protected categories: Category[] = [];
  protected agents: User[] = [];
  protected loading = true;
  protected saving = false;
  protected notFound = false;
  protected loadError = '';
  protected saveError = '';

  protected get links(): FormArray<FormControl<string>> {
    return this.form.controls.links;
  }

  protected get isAgent(): boolean {
    return this.authService.currentUser?.role === 'agent';
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const rawId = params.get('id');
      const id = Number(rawId);
      this.editMode = rawId !== null;
      this.ticketId = this.editMode && Number.isSafeInteger(id) && id > 0 ? id : null;
      this.loadForm();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.loadSubscription?.unsubscribe();
    this.saveSubscription?.unsubscribe();
  }

  protected loadForm(): void {
    this.loadSubscription?.unsubscribe();
    this.saveSubscription?.unsubscribe();
    this.categories = [];
    this.agents = [];
    this.loadError = '';
    this.saveError = '';
    this.notFound = false;
    this.links.clear();
    this.form.reset({ title: '', description: '', priority: 'medium', categoryId: null, status: 'open', assigneeId: null });

    if (this.editMode && this.ticketId === null) {
      this.loading = false;
      this.notFound = true;
      this.loadError = 'errors.ticketNotFound';
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.loading = true;
    this.changeDetectorRef.markForCheck();
    const request: Observable<{ categories: Category[]; ticket: Ticket | null }> = this.ticketId !== null
      ? forkJoin({
          categories: this.ticketService.getCategories(),
          ticket: this.ticketService.getTicket(this.ticketId),
        })
      : this.ticketService.getCategories().pipe(map((categories) => ({ categories, ticket: null })));

    const formData = this.isAgent
      ? forkJoin({ data: request, users: this.ticketService.getUsers() }).pipe(
          map(({ data, users }) => ({ ...data, agents: users.filter((user) => user.role === 'agent') })),
        )
      : request.pipe(map((data) => ({ ...data, agents: [] })));

    this.loadSubscription = formData
      .pipe(finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: ({ categories, ticket, agents }) => {
          this.categories = categories;
          this.agents = agents;

          if (ticket) {
            this.form.patchValue({
              title: ticket.title,
              description: ticket.description,
              priority: ticket.priority,
              categoryId: categories.some((category) => category.id === ticket.categoryId) ? ticket.categoryId : null,
              status: ticket.status,
              assigneeId: ticket.assigneeId,
            });
            for (const link of ticket.links) {
              this.addLink(link);
            }
          }
        },
        error: (error: unknown) => {
          this.notFound = error instanceof ApiError
            && error.status === 404
            && !!error.url?.endsWith(`/tickets/${this.ticketId}`);
          this.loadError = this.notFound
            ? 'errors.ticketNotFound'
            : error instanceof ApiError
              ? error.message
              : 'errors.ticketFormLoad';
        },
      });
  }

  protected addLink(value = ''): void {
    if (this.saving) {
      return;
    }

    this.links.push(this.formBuilder.nonNullable.control(value, [Validators.required, httpUrlValidator]));
  }

  protected removeLink(index: number): void {
    if (!this.saving) {
      this.links.removeAt(index);
    }
  }

  protected save(): void {
    if (this.loading || this.saving || this.loadError || this.categories.length === 0) {
      return;
    }

    this.saveError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      void this.router.navigate(['/login']);
      return;
    }

    const value = this.form.getRawValue();
    if (value.categoryId === null) {
      return;
    }

    if (this.isAgent && value.assigneeId !== null && !this.agents.some((agent) => agent.id === value.assigneeId)) {
      this.saveError = 'validation.assignee';
      return;
    }

    const changes: UpdateTicketRequest = {
      title: value.title.trim(),
      description: value.description.trim(),
      priority: value.priority,
      categoryId: value.categoryId,
      links: value.links.map((link) => link.trim()),
      updatedAt: new Date().toISOString(),
    };
    if (this.isAgent) {
      changes.status = value.status;
      changes.assigneeId = value.assigneeId;
    }
    const request = this.editMode && this.ticketId !== null
      ? this.ticketService.updateTicket(this.ticketId, changes)
      : this.ticketService.createTicket({
          ...changes,
          status: this.isAgent ? value.status : 'open',
          customerId: user.id,
          assigneeId: this.isAgent ? value.assigneeId : null,
          createdAt: changes.updatedAt,
        });

    this.saving = true;
    this.form.disable();
    this.saveSubscription = request
      .pipe(finalize(() => {
        this.saving = false;
        this.form.enable();
        this.changeDetectorRef.markForCheck();
      }))
      .subscribe({
        next: (ticket) => {
          void this.router.navigate(['/tickets', ticket.id], { queryParamsHandling: 'preserve' });
        },
        error: (error: unknown) => {
          this.saveError = error instanceof ApiError
            ? error.message
            : 'errors.ticketSave';
        },
      });
  }
}
