import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CurrencyPipe, TitleCasePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_BASE } from '../../core/api.config';

export interface AdminMenuItem {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  available: boolean;
  dietary_tags?: string | null;
}

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CurrencyPipe, TitleCasePipe],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css',
})
export class AdminMenuComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  success = signal('');

  items = signal<AdminMenuItem[]>([]);

  // create form
  createForm = signal({
    name: '',
    category: 'main',
    price: 0,
    description: '',
    dietary_tags: '',
    available: true,
  });
  creating = signal(false);

  // edit state
  editingId = signal<number | null>(null);
  editForm = signal({
    name: '',
    category: '',
    price: 0,
    description: '',
    dietary_tags: '',
    available: true,
  });
  savingEdit = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  /* ---------- LOAD ---------- */

  loadMenu() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.get<any[]>(`${API_BASE}/menu`).subscribe({
      next: (rows) => {
        const mapped: AdminMenuItem[] = (rows || []).map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          price: row.price,
          available: row.available === 1 || row.available === true,
          dietary_tags: row.dietary_tags ?? null,
        }));
        this.items.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[AdminMenu] loadMenu error', err);
        this.loading.set(false);
        this.error.set('Failed to load menu items.');
      },
    });
  }

  /* ---------- CREATE ---------- */

  updateCreate<K extends keyof ReturnType<typeof this.createForm>>(
    key: K,
    value: ReturnType<typeof this.createForm>[K]
  ) {
    this.createForm.set({ ...this.createForm(), [key]: value });
  }

  createItem() {
    this.error.set('');
    this.success.set('');

    const f = this.createForm();

    if (!f.name.trim()) {
      this.error.set('Name is required.');
      return;
    }
    if (!f.category.trim()) {
      this.error.set('Category is required.');
      return;
    }
    if (f.price <= 0) {
      this.error.set('Price must be greater than 0.');
      return;
    }

    const body = {
      name: f.name.trim(),
      category: f.category.trim(),
      price: f.price,
      description: f.description.trim() || null,
      dietary_tags: f.dietary_tags.trim() || null,
      available: f.available ? 1 : 0,
    };

    this.creating.set(true);

    this.http.post(`${API_BASE}/menu`, body).subscribe({
      next: () => {
        this.creating.set(false);
        this.success.set('Menu item created.');
        this.createForm.set({
          name: '',
          category: f.category, // keep last category
          price: 0,
          description: '',
          dietary_tags: '',
          available: true,
        });
        this.loadMenu();
      },
      error: (err) => {
        console.error('[AdminMenu] createItem error', err);
        this.creating.set(false);
        this.error.set(err.error?.message || 'Failed to create menu item.');
      },
    });
  }

  /* ---------- EDIT ---------- */

  startEdit(item: AdminMenuItem) {
    this.editingId.set(item.id);
    this.editForm.set({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      dietary_tags: item.dietary_tags || '',
      available: item.available,
    });
    this.success.set('');
    this.error.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  updateEdit<K extends keyof ReturnType<typeof this.editForm>>(
    key: K,
    value: ReturnType<typeof this.editForm>[K]
  ) {
    this.editForm.set({ ...this.editForm(), [key]: value });
  }

  saveEdit() {
    const id = this.editingId();
    if (!id) return;

    const f = this.editForm();

    if (!f.name.trim()) {
      this.error.set('Name is required.');
      return;
    }
    if (!f.category.trim()) {
      this.error.set('Category is required.');
      return;
    }
    if (f.price <= 0) {
      this.error.set('Price must be greater than 0.');
      return;
    }

    const body = {
      name: f.name.trim(),
      category: f.category.trim(),
      price: f.price,
      description: f.description.trim() || null,
      dietary_tags: f.dietary_tags.trim() || null,
      available: f.available ? 1 : 0,
    };

    this.savingEdit.set(true);

    this.http.put(`${API_BASE}/menu/${id}`, body).subscribe({
      next: () => {
        this.savingEdit.set(false);
        this.success.set('Menu item updated.');
        this.editingId.set(null);
        this.loadMenu();
      },
      error: (err) => {
        console.error('[AdminMenu] saveEdit error', err);
        this.savingEdit.set(false);
        this.error.set(err.error?.message || 'Failed to update menu item.');
      },
    });
  }

  /* ---------- QUICK TOGGLE ---------- */

  toggleAvailability(item: AdminMenuItem) {
    const newAvailable = !item.available;

    this.http
      .put(`${API_BASE}/menu/${item.id}`, {
        available: newAvailable ? 1 : 0,
      })
      .subscribe({
        next: () => {
          this.items.set(
            this.items().map((m) =>
              m.id === item.id ? { ...m, available: newAvailable } : m
            )
          );
        },
        error: (err) => {
          console.error('[AdminMenu] toggleAvailability error', err);
          this.error.set('Failed to update availability.');
        },
      });
  }

  /* ---------- DELETE ---------- */

  deleteItem(item: AdminMenuItem) {
    const ok = window.confirm(
      `Delete "${item.name}" from the menu? This cannot be undone.`
    );
    if (!ok) return;

    this.http.delete(`${API_BASE}/menu/${item.id}`).subscribe({
      next: () => {
        this.success.set('Menu item deleted.');
        this.items.set(this.items().filter((m) => m.id !== item.id));
      },
      error: (err) => {
        console.error('[AdminMenu] deleteItem error', err);
        this.error.set(err.error?.message || 'Failed to delete menu item.');
      },
    });
  }
}
