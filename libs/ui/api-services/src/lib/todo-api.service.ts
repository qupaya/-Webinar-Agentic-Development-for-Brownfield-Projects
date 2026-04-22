import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, CreateTodoDto, UpdateTodoDto, ProcessPetitionDto } from '@webinar/shared-models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = '/api/todos';

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Role': this.auth.userRole() });
  }

  getAll(search?: string): Observable<Todo[]> {
    const options: { headers: HttpHeaders; params?: Record<string, string> } = {
      headers: this.headers(),
    };
    if (search) {
      options.params = { search };
    }
    return this.http.get<Todo[]>(this.baseUrl, options);
  }

  getById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`, { headers: this.headers() });
  }

  create(dto: CreateTodoDto): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, dto, { headers: this.headers() });
  }

  update(id: number, dto: UpdateTodoDto): Observable<Todo> {
    return this.http.put<Todo>(`${this.baseUrl}/${id}`, dto, { headers: this.headers() });
  }

  accept(id: number, dto: ProcessPetitionDto): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}/accept`, dto, {
      headers: this.headers(),
    });
  }

  reject(id: number, dto: ProcessPetitionDto): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}/reject`, dto, {
      headers: this.headers(),
    });
  }

  setPending(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}/pending`, {}, {
      headers: this.headers(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers() });
  }

  seed(): Observable<Todo[]> {
    return this.http.post<Todo[]>(`${this.baseUrl}/seed`, {}, { headers: this.headers() });
  }
}
