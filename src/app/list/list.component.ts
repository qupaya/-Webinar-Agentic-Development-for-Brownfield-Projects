import { Component, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.component.html',
})
export class ListComponent {
  protected readonly todoService = inject(TodoService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Debug click tracking
  private debugClickCount = 0;
  private debugClickTimeout: any = null;

  // Computed signals for filtered petitions by status
  pendingPetitions = computed(() =>
    this.todoService.filteredTodos().filter((todo) => todo.status === 'pending'),
  );

  acceptedPetitions = computed(() =>
    this.todoService
      .filteredTodos()
      .filter((todo) => todo.status === 'accepted')
      .sort((a, b) => {
        const dateA = a.processedDate ? new Date(a.processedDate).getTime() : 0;
        const dateB = b.processedDate ? new Date(b.processedDate).getTime() : 0;
        return dateB - dateA; // Most recent first
      }),
  );

  rejectedPetitions = computed(() =>
    this.todoService
      .filteredTodos()
      .filter((todo) => todo.status === 'rejected')
      .sort((a, b) => {
        const dateA = a.processedDate ? new Date(a.processedDate).getTime() : 0;
        const dateB = b.processedDate ? new Date(b.processedDate).getTime() : 0;
        return dateB - dateA; // Most recent first
      }),
  );

  // Dynamic skeleton count based on viewport height
  skeletons = computed(() => {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const height = window.innerHeight;
      const skeletonCount = Math.max(3, Math.floor(height / 120));
      return Array(skeletonCount).fill(0);
    }
    return Array(5).fill(0); // Default for SSR
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.todoService.setSearchQuery(input.value);
  }

  toggleStatus(id: number, event: Event): void {
    event.stopPropagation(); // Prevent navigation when clicking the button
    this.todoService.toggleStatus(id);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/detail', id]);
  }

  onTitleClick(): void {
    // Clear existing timeout
    if (this.debugClickTimeout) {
      clearTimeout(this.debugClickTimeout);
    }

    // Increment click count
    this.debugClickCount++;

    // Check if 7 clicks reached
    if (this.debugClickCount === 7) {
      this.todoService.populateDebugData();
      this.debugClickCount = 0;
      console.log('🐛 Debug mode activated: 15 example petitions added');
      return;
    }

    // Reset counter after 800ms of no clicks
    this.debugClickTimeout = setTimeout(() => {
      this.debugClickCount = 0;
    }, 800);
  }
}
