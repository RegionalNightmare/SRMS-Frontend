import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [

  { path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },

  { path: 'menu',
    loadComponent: () =>
      import('./pages/menu/menu').then((m) => m.Menu),
  },

  { path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },

  { path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },

 {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reservations/reservations').then((m) => m.Reservations),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/events/events').then((m) => m.Events),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'admin/menu',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-menu/admin-menu.component').then((m) => m.AdminMenuComponent),
  },
   {
    path: 'admin/orders',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-orders/admin-orders.component').then((m) => m.AdminOrdersComponent),
  },
  {
    path: 'admin/reservations',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-reservations/admin-reservations.component').then((m) => m.AdminReservationsComponent),
  },
  {
    path: 'admin/events',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-events/admin-events.component').then((m) => m.AdminEventsComponent),
  },

  { path: '**', redirectTo: '' },
];
