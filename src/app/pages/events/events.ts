import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_BASE } from '../../core/api.config';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
}

interface EventSummary {
  id: number;
  event_type: string;
  event_datetime: string;
  number_of_guests: number;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, TitleCasePipe],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  // form state
  eventType = signal<string>('birthday');
  eventDatetime = signal<string>(''); // datetime-local
  numberOfGuests = signal<number>(30);
  selectedMenuIds = signal<Set<number>>(new Set());

  submitting = signal(false);
  error = signal('');
  success = signal('');

  // data
  menu = signal<MenuItem[]>([]);
  myEvents = signal<EventSummary[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setDefaultDateTime();
    this.loadMenu();
    this.loadMyEvents();
  }

  private setDefaultDateTime() {
    // default to 6pm a week from now
    const dt = new Date();
    dt.setDate(dt.getDate() + 7);
    dt.setHours(18, 0, 0, 0);
    const iso = dt.toISOString();
    this.eventDatetime.set(iso.slice(0, 16)); // yyyy-MM-ddTHH:mm
  }

  loadMenu() {
    this.http.get<MenuItem[]>(`${API_BASE}/menu`).subscribe({
      next: (data) => this.menu.set(data),
      error: (err) => {
        console.error('[Events] loadMenu error', err);
        // non-blocking
      },
    });
  }

  loadMyEvents() {
    this.http.get<EventSummary[]>(`${API_BASE}/events/my`).subscribe({
      next: (data) => this.myEvents.set(data),
      error: (err) => {
        console.error('[Events] loadMyEvents error', err);
      },
    });
  }

  toggleMenuSelection(id: number, checked: boolean) {
    const set = new Set(this.selectedMenuIds());
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    this.selectedMenuIds.set(set);
  }

  submitEventRequest() {
    this.error.set('');
    this.success.set('');

    const datetime = this.eventDatetime();
    const guests = this.numberOfGuests();

    if (!datetime) {
      this.error.set('Please choose a date and time.');
      return;
    }
    if (!guests || guests < 5) {
      this.error.set('Number of guests should be at least 5 for events.');
      return;
    }

    const menuSelection = Array.from(this.selectedMenuIds());

    const body = {
      type: this.eventType(),
      eventDatetime: datetime,
      numberOfGuests: guests,
      menuSelection, // can be empty []
    };

    this.submitting.set(true);

    this.http.post(`${API_BASE}/events`, body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Event request submitted.');
        // keep selections so they can tweak and re-send if needed
        this.loadMyEvents();
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('[Events] submitEventRequest error', err);
        this.error.set(
          err.error?.message ||
            'Failed to submit event request. Please try again.'
        );
      },
    });
  }
}
