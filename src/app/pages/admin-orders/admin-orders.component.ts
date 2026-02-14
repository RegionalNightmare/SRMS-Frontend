import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_BASE } from '../../core/api.config';

export interface AdminOrder {
  id: number;
  user_name?: string;
  user_email?: string;
  total_price: number;
  type: 'pickup' | 'delivery';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, DatePipe, TitleCasePipe, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');
  orders = signal<AdminOrder[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.get<AdminOrder[]>(`${API_BASE}/admin/orders`).subscribe({
      next: (rows) => {
        this.orders.set(rows || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[AdminOrders] loadOrders error', err);
        this.loading.set(false);
        this.error.set('Failed to load orders.');
      },
    });
  }

  updateStatus(order: AdminOrder, newStatus: AdminOrder['status']) {
    if (order.status === newStatus) return;

    this.http
      .put(`${API_BASE}/admin/orders/${order.id}`, { status: newStatus })
      .subscribe({
        next: () => {
          this.success.set(`Order #${order.id} updated.`);
          this.error.set('');
          this.orders.set(
            this.orders().map((o) =>
              o.id === order.id ? { ...o, status: newStatus } : o
            )
          );
        },
        error: (err) => {
          console.error('[AdminOrders] updateStatus error', err);
          this.error.set('Failed to update order status.');
        },
      });
  }
}
