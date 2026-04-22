import { Injectable, signal, computed, inject, afterNextRender } from '@angular/core';
import { TodoApiService } from './todo-api.service';
import { Todo } from '@webinar/shared-models';

export type { Todo } from '@webinar/shared-models';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly api = inject(TodoApiService);

  // State signals
  todos = signal<Todo[]>([]);
  searchQuery = signal<string>('');
  isHydrated = signal(false);

  // Computed filtered todos
  filteredTodos = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.todos();
    }
    return this.todos().filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) || todo.description.toLowerCase().includes(query),
    );
  });

  constructor() {
    afterNextRender(() => {
      this.loadFromApi();
    });
  }

  private loadFromApi(): void {
    this.api.getAll().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isHydrated.set(true);
      },
      error: () => {
        this.isHydrated.set(true);
      },
    });
  }

  addTodo(title: string, description: string): void {
    this.api.create({ title, description }).subscribe({
      next: (todo) => {
        this.todos.update((todos) => [todo, ...todos]);
      },
    });
  }

  updateTodo(id: number, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
    this.api.update(id, updates).subscribe({
      next: (updated) => {
        this.todos.update((todos) =>
          todos.map((todo) => (todo.id === id ? updated : todo)),
        );
      },
    });
  }

  deleteTodo(id: number): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
      },
    });
  }

  toggleStatus(id: number): void {
    const todo = this.getTodoById(id);
    if (!todo) return;
    if (todo.status === 'pending') {
      this.acceptPetition(id, 'Toggled to accepted');
    } else {
      this.setPetitionPending(id);
    }
  }

  acceptPetition(id: number, reason: string): void {
    this.api.accept(id, { reason }).subscribe({
      next: (updated) => {
        this.todos.update((todos) =>
          todos.map((todo) => (todo.id === id ? updated : todo)),
        );
      },
    });
  }

  rejectPetition(id: number, reason: string): void {
    this.api.reject(id, { reason }).subscribe({
      next: (updated) => {
        this.todos.update((todos) =>
          todos.map((todo) => (todo.id === id ? updated : todo)),
        );
      },
    });
  }

  setPetitionPending(id: number): void {
    this.api.setPending(id).subscribe({
      next: (updated) => {
        this.todos.update((todos) =>
          todos.map((todo) => (todo.id === id ? updated : todo)),
        );
      },
    });
  }

  getTodoById(id: number): Todo | undefined {
    return this.todos().find((todo) => todo.id === id);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  populateDebugData(): void {
    this.api.seed().subscribe({
      next: (todos) => {
        this.todos.set(todos);
      },
    });
  }
}
