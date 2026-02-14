import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe, TitleCasePipe} from '@angular/common';
import { API_BASE } from '../../core/api.config';

export interface AdminReservation {
  id: number;
  user_name?: string;
  user_email?: string;
  reservation_datetime: string;
  number_of_guests: number;
  notes?: string | null;
  status: 'pending' | 'approved' | 'cancelled';
  created_at: string;
}

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe],
  templateUrl: './admin-reservations.component.html',
  styleUrl: './admin-reservations.component.css',
})
export class AdminReservationsComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');
  reservations = signal<AdminReservation[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http
      .get<AdminReservation[]>(`${API_BASE}/admin/reservations`)
      .subscribe({
        next: (rows) => {
          this.reservations.set(rows || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AdminReservations] loadReservations error', err);
          this.loading.set(false);
          this.error.set('Failed to load reservations.');
        },
      });
  }

  updateStatus(
    res: AdminReservation,
    newStatus: AdminReservation['status']
  ) {
    if (res.status === newStatus) return;

    this.http
      .put(`${API_BASE}/admin/reservations/${res.id}`, { status: newStatus })
      .subscribe({
        next: () => {
          this.success.set(`Reservation #${res.id} updated.`);
          this.error.set('');
          this.reservations.set(
            this.reservations().map((r) =>
              r.id === res.id ? { ...r, status: newStatus } : r
            )
          );
        },
        error: (err) => {
          console.error('[AdminReservations] updateStatus error', err);
          this.error.set('Failed to update reservation status.');
        },
      });
  }
}
