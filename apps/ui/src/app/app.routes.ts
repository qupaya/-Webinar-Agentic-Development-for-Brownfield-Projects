import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () => import('@webinar/ui-feature-list').then((m) => m.ListComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('@webinar/ui-feature-detail').then((m) => m.DetailComponent),
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('@webinar/ui-feature-detail').then((m) => m.DetailComponent),
  },
  {
    path: '**',
    loadComponent: () => import('@webinar/ui-feature-not-found').then((m) => m.NotFoundComponent),
  },
];
