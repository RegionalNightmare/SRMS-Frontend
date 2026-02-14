import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { API_BASE } from '../../core/api.config';

export interface AdminEvent {
  id: number;
  user_name?: string;
  user_email?: string;
  event_type: string;
  event_datetime: string;
  number_of_guests: number;
  status: 'pending' | 'approved' | 'cancelled';
  created_at: string;
}

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe],
  templateUrl: './admin-events.component.html',
  styleUrl: './admin-events.component.css',
})
export class AdminEventsComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');
  events = signal<AdminEvent[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.get<AdminEvent[]>(`${API_BASE}/admin/events`).subscribe({
      next: (rows) => {
        this.events.set(rows || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[AdminEvents] loadEvents error', err);
        this.loading.set(false);
        this.error.set('Failed to load events.');
      },
    });
  }

  updateStatus(ev: AdminEvent, newStatus: AdminEvent['status']) {
    if (ev.status === newStatus) return;

    this.http
      .put(`${API_BASE}/admin/events/${ev.id}`, { status: newStatus })
      .subscribe({
        next: () => {
          this.success.set(`Event #${ev.id} updated.`);
          this.error.set('');
          this.events.set(
            this.events().map((e) =>
              e.id === ev.id ? { ...e, status: newStatus } : e
            )
          );
        },
        error: (err) => {
          console.error('[AdminEvents] updateStatus error', err);
          this.error.set('Failed to update event status.');
        },
      });
  }
}
