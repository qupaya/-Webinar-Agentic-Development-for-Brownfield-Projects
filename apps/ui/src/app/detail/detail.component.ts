import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TodoService, Todo } from '../services/todo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  protected readonly todoService = inject(TodoService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  isLoading = signal(true);
  isSaving = signal(false);
  todo = signal<Todo | undefined>(undefined);
  isAddMode = signal(false);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    processedReason: [''],
  });

  ngOnInit(): void {
    // Get todo ID from route
    const idParam = this.route.snapshot.paramMap.get('id');

    // If no ID, we're in add mode
    if (!idParam) {
      // Prevent non-admins from accessing add mode
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/list']);
        return;
      }
      this.isAddMode.set(true);
      this.isLoading.set(false);
      return;
    }

    const todoId = parseInt(idParam, 10);
    if (isNaN(todoId)) {
      this.isLoading.set(false);
      return;
    }

    // Edit mode - wait for hydration, then load todo
    if (this.todoService.isHydrated()) {
      this.loadTodo(todoId);
    } else {
      // Poll for hydration
      const interval = setInterval(() => {
        if (this.todoService.isHydrated()) {
          clearInterval(interval);
          this.loadTodo(todoId);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (!this.todoService.isHydrated()) {
          this.isLoading.set(false);
        }
      }, 5000);
    }
  }

  private loadTodo(id: number): void {
    const foundTodo = this.todoService.getTodoById(id);
    this.todo.set(foundTodo);

    if (foundTodo) {
      this.form.patchValue({
        title: foundTodo.title,
        description: foundTodo.description,
        processedReason: foundTodo.processedReason || '',
      });
    }

    this.isLoading.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.value;

    if (this.isAddMode()) {
      // Add new petition (always starts as pending)
      this.todoService.addTodo(formValue.title.trim(), formValue.description.trim());
    } else {
      // Update existing petition (only title and description)
      if (!this.todo()) {
        return;
      }
      this.todoService.updateTodo(this.todo()!.id, {
        title: formValue.title.trim(),
        description: formValue.description.trim(),
      });
    }

    // Simulate async operation for better UX
    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/list']);
    }, 300);
  }

  acceptPetition(): void {
    if (!this.todo()) {
      return;
    }

    const reason = this.form.value.processedReason?.trim() || '';
    if (!reason) {
      alert('Please provide a reason for accepting this petition.');
      return;
    }

    this.isSaving.set(true);
    this.todoService.acceptPetition(this.todo()!.id, reason);

    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/list']);
    }, 300);
  }

  rejectPetition(): void {
    if (!this.todo()) {
      return;
    }

    const reason = this.form.value.processedReason?.trim() || '';
    if (!reason) {
      alert('Please provide a reason for rejecting this petition.');
      return;
    }

    this.isSaving.set(true);
    this.todoService.rejectPetition(this.todo()!.id, reason);

    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/list']);
    }, 300);
  }

  setPending(): void {
    if (!this.todo()) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to revert this petition to pending status? This will remove the processed reason and date.',
    );

    if (confirmed) {
      this.isSaving.set(true);
      this.todoService.setPetitionPending(this.todo()!.id);
      // Clear the processedReason field in the form
      this.form.patchValue({ processedReason: '' });

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigate(['/list']);
      }, 300);
    }
  }

  cancel(): void {
    this.router.navigate(['/list']);
  }

  delete(): void {
    if (!this.todo()) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete this petition "${this.todo()!.title}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.todoService.deleteTodo(this.todo()!.id);
      this.router.navigate(['/list']);
    }
  }
}
