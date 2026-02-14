import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common'

const API_BASE = 'http://localhost:5000/api';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  image_url?: string;
}

interface OrderItemPayload {
  menuItemId: number;
  quantity: number;
}

interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  id: number;
  total_price: number;
  type: 'pickup' | 'delivery';
  status: string;
  created_at: string;
  items?: OrderItemSummary[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  menu = signal<MenuItem[]>([]);
  quantities = signal<Record<number, number>>({});
  orderType = signal<'pickup' | 'delivery'>('pickup');
   deliveryAddress = signal('');
  notes = signal('');
  submitting = signal(false);
  error = signal('');
  success = signal('');

  // Checkout / Demo Payments
checkoutOpen = signal(false);
paymentId = signal<number | null>(null);
lastOrderId = signal<number | null>(null);

cardNumber = signal('4111 1111 1111 4242');
payError = signal('');
paySuccess = signal('');
creatingPayment = signal(false);

  myOrders = signal<OrderSummary[]>([]);

  readonly imageBase = API_BASE.replace(/\/api\/?$/, '');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMenu();
    this.loadMyOrders();
  }

  loadMenu() {
    this.error.set('');
    this.http.get<MenuItem[]>(`${API_BASE}/menu`).subscribe({
      next: (data) => this.menu.set(data),
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load menu.');
      },
    });
  }

  loadMyOrders() {
    this.http.get<OrderSummary[]>(`${API_BASE}/orders/my`).subscribe({
      next: (data) => this.myOrders.set(data),
      error: (err) => {
        console.error(err);
        // don't hard error the page if this fails
      },
    });
  }

  imageUrl(item: MenuItem): string | null {
    return item.image_url ? `${this.imageBase}${item.image_url}` : null;
  }

  updateQuantity(itemId: number, value: string) {
    const qty = Math.max(0, Number.parseInt(value || '0', 10) || 0);
    const current = { ...this.quantities() };
    if (qty === 0) {
      delete current[itemId];
    } else {
      current[itemId] = qty;
    }
    this.quantities.set(current);
  }

  cartItems = computed(() => {
    const map = this.quantities();
    return this.menu()
      .filter((item) => map[item.id] && map[item.id] > 0)
      .map((item) => ({
        item,
        quantity: map[item.id],
        lineTotal: item.price * map[item.id],
      }));
  });

  cartTotal = computed(() =>
    this.cartItems().reduce((sum, ci) => sum + ci.lineTotal, 0)
  );

    get canSubmit(): boolean {
    if (this.cartItems().length === 0 || this.submitting()) return false;

    // if delivery, require a reasonable address
    if (this.orderType() === 'delivery') {
      return this.deliveryAddress().trim().length >= 5;
    }

    return true;
  }

  startCheckout() {
  this.error.set('');
  this.success.set('');
  this.payError.set('');
  this.paySuccess.set('');

  const cart = this.cartItems();
  if (cart.length === 0) {
    this.error.set('Add at least one item to your order.');
    return;
  }

  // UI already enforces this, but keep it safe
  if (this.orderType() === 'delivery' && this.deliveryAddress().trim().length < 5) {
    this.error.set('Please enter a delivery address for delivery orders.');
    return;
  }

  // 1) Create the order first
  const items: OrderItemPayload[] = cart.map((ci) => ({
    menuItemId: ci.item.id,
    quantity: ci.quantity,
  }));

  const type = this.orderType();

  const body: any = {
    items,
    type,
    notes: this.notes().trim() || null,
    deliveryAddress: type === 'delivery' ? this.deliveryAddress().trim() : null,
  };

  this.submitting.set(true);

  this.http.post<{ orderId: number }>(`${API_BASE}/orders`, body).subscribe({
    next: (res: any) => {
      this.submitting.set(false);
      const orderId = res.orderId ?? res.id; // supports either response style
      this.lastOrderId.set(orderId);

      // 2) Open checkout + create payment intent
      this.openCheckout();
      this.createPaymentIntent(orderId);
    },
    error: (err) => {
      this.submitting.set(false);
      console.error(err);
      this.error.set(err.error?.message || 'Failed to place order. Please try again.');
    },
  });
}

createPaymentIntent(orderId: number) {
  this.creatingPayment.set(true);
  this.payError.set('');
  this.paymentId.set(null);

  this.http.post<any>(`${API_BASE}/payments/intent`, { orderId }).subscribe({
    next: (res) => {
      this.creatingPayment.set(false);
      this.paymentId.set(res.paymentId);
    },
    error: (err) => {
      this.creatingPayment.set(false);
      console.error(err);
      this.payError.set(err.error?.message || 'Failed to start Demo Payments checkout.');
    },
  });
}

confirmPayment() {
  const pid = this.paymentId();
  if (!pid) {
    this.payError.set('No payment session created yet.');
    return;
  }

  this.creatingPayment.set(true);
  this.payError.set('');
  this.paySuccess.set('');

  this.http
    .post<any>(`${API_BASE}/payments/confirm`, {
      paymentId: pid,
      cardNumber: this.cardNumber(),
    })
    .subscribe({
      next: () => {
        this.creatingPayment.set(false);
        this.paySuccess.set('Payment successful ✅ Your order is confirmed.');

        // clear cart + reset form
        this.quantities.set({});
        this.deliveryAddress.set('');
        this.notes.set('');

        // refresh orders
        this.loadMyOrders();
      },
      error: (err) => {
        this.creatingPayment.set(false);
        console.error(err);
        this.payError.set(err.error?.message || 'Payment failed.');
      },
    });
}

  openCheckout() {
    this.payError.set('');
    this.paySuccess.set('');
    this.checkoutOpen.set(true);
  }

  closeCheckout() {
    this.checkoutOpen.set(false);
    this.paymentId.set(null);
    this.lastOrderId.set(null);
    this.creatingPayment.set(false);
    this.payError.set('');
    this.paySuccess.set('');
  }
}
