import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_BASE } from '../../core/api.config';

interface ReservationSummary {
  id: number;
  reservation_datetime: string;
  number_of_guests: number;
  status: string;
  notes?: string;
  created_at: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, TitleCasePipe],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  // form state
  reservationDatetime = signal<string>(''); // bound to datetime-local
  numberOfGuests = signal<number>(2);
  notes = signal<string>('');

  submitting = signal(false);
  error = signal('');
  success = signal('');

  // list of user's reservations
  myReservations = signal<ReservationSummary[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setDefaultDateTime();
    this.loadMyReservations();
  }

  private setDefaultDateTime() {
    // default to 7pm today or tomorrow if it's already past 7pm
    const now = new Date();
    const dt = new Date();
    dt.setHours(19, 0, 0, 0); // 19:00

    if (now.getTime() > dt.getTime()) {
      dt.setDate(dt.getDate() + 1);
    }

    const iso = dt.toISOString();
    // convert ISO to 'yyyy-MM-ddTHH:mm' for datetime-local
    this.reservationDatetime.set(iso.slice(0, 16));
  }

  loadMyReservations() {
    this.http
      .get<ReservationSummary[]>(`${API_BASE}/reservations/my`)
      .subscribe({
        next: (data) => this.myReservations.set(data),
        error: (err) => {
          console.error('[Reservations] loadMyReservations error', err);
          // don't hard-error the page, just log it
        },
      });
  }

  submitReservation() {
    this.error.set('');
    this.success.set('');

    const datetime = this.reservationDatetime();
    const guests = this.numberOfGuests();

    if (!datetime) {
      this.error.set('Please select a date and time.');
      return;
    }

    if (!guests || guests < 1) {
      this.error.set('Number of guests must be at least 1.');
      return;
    }

    const body = {
      // match the JSON contract we used in Postman
      reservationDatetime: datetime,
      numberOfGuests: guests,
      notes: this.notes() || undefined,
    };

    this.submitting.set(true);

    this.http.post(`${API_BASE}/reservations`, body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Reservation request submitted.');
        // reset notes, keep datetime + guests
        this.notes.set('');
        this.loadMyReservations();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('[Reservations] submitReservation error', err);
        this.error.set(
          err.error?.message ||
            'Failed to submit reservation. Please try again.'
        );
      },
    });
  }
}
