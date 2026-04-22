import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { StorageService } from './storage.service';

export type UserRole = 'admin' | 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly STORAGE_KEY = 'userRole';

  // Default to user role for safety
  userRole = signal<UserRole>('user');

  constructor() {
    // Load role from localStorage after first render
    afterNextRender(() => {
      this.loadFromStorage();
    });
  }

  private loadFromStorage(): void {
    const stored = this.storage.getItem(this.STORAGE_KEY);
    if (stored === 'admin' || stored === 'user') {
      this.userRole.set(stored);
    }
  }

  private saveToStorage(): void {
    this.storage.setItem(this.STORAGE_KEY, this.userRole());
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

  isUser(): boolean {
    return this.userRole() === 'user';
  }

  setRole(role: UserRole): void {
    this.userRole.set(role);
    this.saveToStorage();
  }

  toggleRole(): void {
    const newRole: UserRole = this.userRole() === 'admin' ? 'user' : 'admin';
    this.setRole(newRole);
  }
}
