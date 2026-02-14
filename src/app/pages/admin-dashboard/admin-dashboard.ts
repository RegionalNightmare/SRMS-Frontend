import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { API_BASE } from '../../core/api.config';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalReservations: number;
  totalEvents: number;
  totalCustomers: number;
  pendingReservations: number;
  pendingEvents: number;
}

interface AdminOrder {
  id: number;
  customer_name: string;
  total_price: number;
  type: string;
  status: string;
  created_at: string;
}

interface AdminReservation {
  id: number;
  customer_name: string;
  reservation_datetime: string;
  number_of_guests: number;
  status: string;
}

interface AdminEvent {
  id: number;
  customer_name: string;
  event_type: string;
  event_datetime: string;
  number_of_guests: number;
  status: string;
}

interface TopMenuItem {
  id: number;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

interface AdminDashboardResponse {
  stats: AdminStats;
  recentOrders: AdminOrder[];
  upcomingReservations: AdminReservation[];
  upcomingEvents: AdminEvent[];
  topMenuItems: TopMenuItem[];
}

// adjust this if your backend path is different:
const ADMIN_DASHBOARD_URL = `${API_BASE}/admin/stats`;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  loading = signal(true);
  error = signal('');

  stats = signal<AdminStats | null>(null);
  recentOrders = signal<AdminOrder[]>([]);
  upcomingReservations = signal<AdminReservation[]>([]);
  upcomingEvents = signal<AdminEvent[]>([]);
  topMenuItems = signal<TopMenuItem[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard() {
  this.loading.set(true);
  this.error.set('');

  this.http.get<any>(ADMIN_DASHBOARD_URL).subscribe({
    next: (data) => {
      console.log('[AdminDashboard] raw response:', data);
      this.loading.set(false);

      let s: AdminStats | null = null;
      let recentOrders: AdminOrder[] = [];
      let upcomingReservations: AdminReservation[] = [];
      let upcomingEvents: AdminEvent[] = [];
      let topMenuItems: TopMenuItem[] = [];

      // CASE 1: expected shape { stats, recentOrders, ... }
      if (data && data.stats) {
        s = data.stats as AdminStats;
        recentOrders = data.recentOrders ?? data.orders ?? [];
        upcomingReservations = data.upcomingReservations ?? [];
        upcomingEvents = data.upcomingEvents ?? [];
        topMenuItems = data.topMenuItems ?? [];
      }
      // CASE 2: flat stats on the root object
      else if (data && 'totalOrders' in data) {
        s = {
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          totalReservations: data.totalReservations ?? 0,
          totalEvents: data.totalEvents ?? 0,
          totalCustomers: data.totalCustomers ?? 0,
          pendingReservations: data.pendingReservations ?? 0,
          pendingEvents: data.pendingEvents ?? 0,
        };

        recentOrders = data.recentOrders ?? data.orders ?? [];
        upcomingReservations = data.upcomingReservations ?? [];
        upcomingEvents = data.upcomingEvents ?? [];
        topMenuItems = data.topMenuItems ?? [];
      }
      // CASE 3: nested under "data"
      else if (data && data.data && data.data.stats) {
        const d = data.data;
        s = d.stats as AdminStats;
        recentOrders = d.recentOrders ?? d.orders ?? [];
        upcomingReservations = d.upcomingReservations ?? [];
        upcomingEvents = d.upcomingEvents ?? [];
        topMenuItems = d.topMenuItems ?? [];
      }

      if (!s) {
        // we got *something* but not in a shape we understand
        console.warn('[AdminDashboard] Unexpected response shape', data);
        this.error.set('Unexpected dashboard response shape from server.');
        // set empty stats so the layout still appears with zeros
        this.stats.set({
          totalOrders: 0,
          totalRevenue: 0,
          totalReservations: 0,
          totalEvents: 0,
          totalCustomers: 0,
          pendingReservations: 0,
          pendingEvents: 0,
        });
        this.recentOrders.set([]);
        this.upcomingReservations.set([]);
        this.upcomingEvents.set([]);
        this.topMenuItems.set([]);
        return;
      }

      // happy path
      this.stats.set(s);
      this.recentOrders.set(recentOrders);
      this.upcomingReservations.set(upcomingReservations);
      this.upcomingEvents.set(upcomingEvents);
      this.topMenuItems.set(topMenuItems);
    },
    error: (err) => {
      this.loading.set(false);
      console.error('[AdminDashboard] loadDashboard error', err);
      this.error.set(
        err.error?.message || 'Failed to load admin dashboard data.'
      );
    },
  });

  }
}
