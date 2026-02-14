import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  constructor(private http: HttpClient) {}

  createIntent(orderId: number) {
    return this.http.post<any>(`${API_BASE}/payments/intent`, { orderId });
  }

  confirm(paymentId: number, cardNumber: string) {
    return this.http.post<any>(`${API_BASE}/payments/confirm`, { paymentId, cardNumber });
  }

  getStatus(paymentId: number) {
    return this.http.get<any>(`${API_BASE}/payments/${paymentId}`);
  }
}
