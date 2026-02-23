import { API_BASE } from './../../core/api.config';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CurrencyPipe, UpperCasePipe} from '@angular/common';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  dietary_tags?: string | null;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, UpperCasePipe],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  loading: boolean = false;
  menuItems: MenuItem[] = [];;
  error = '';

  readonly imageBase = API_BASE.replace(/\/api\/?$/, '');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  loadMenu() {
    this.loading = true;
    this.error = '';

    this.http.get<any[]>(`${API_BASE}/menu`).subscribe({
      next: (rows) => {
        console.log('[Menu] raw response:', rows);

        // map DB rows -> MenuItem[]
        this.menuItems = (rows || []).map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          price: row.price,
          // DB uses tinyint(1) 0/1; convert to boolean
          available: row.available === 1 || row.available === true,
          dietary_tags: row.dietary_tags ?? null,
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('[Menu] loadMenu error', err);
        this.loading = false;
        this.error = err.error?.message || 'Failed to load menu.';
      },
    });
  }
  imageUrl(item: MenuItem): string | null {
  return item.image_url ? `${this.imageBase}${item.image_url}` : null;
}

handleImageError(event: any) {
  // Hide broken images
  event.target.style.display = 'none';
}
}
