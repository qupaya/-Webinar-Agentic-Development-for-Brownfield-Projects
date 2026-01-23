import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () => import('./list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./detail/detail.component').then((m) => m.DetailComponent),
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./detail/detail.component').then((m) => m.DetailComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
