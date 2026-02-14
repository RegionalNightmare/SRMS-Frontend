import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([
    {
      from: 'bot',
      text: 'Hi! I’m your SRMS assistant. I can explain how to view the menu, place orders, book reservations, or request events.',
    },
  ]);
  input = signal('');

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  sendQuick(topic: 'overview' | 'order' | 'reservation' | 'event' | 'admin') {
    const userText =
      topic === 'overview'
        ? 'What can I do on this website?'
        : topic === 'order'
        ? 'How do I place an order?'
        : topic === 'reservation'
        ? 'How do I make a reservation?'
        : topic === 'event'
        ? 'How do events work?'
        : 'What can admins do?';

    this.addUser(userText);
    this.addBot(this.answerFor(topic));
  }

  sendManual() {
    const text = this.input().trim();
    if (!text) return;
    this.addUser(text);
    this.input.set('');

    const lower = text.toLowerCase();

    if (lower.includes('order')) {
      this.addBot(this.answerFor('order'));
    } else if (lower.includes('reservation') || lower.includes('book')) {
      this.addBot(this.answerFor('reservation'));
    } else if (lower.includes('event')) {
      this.addBot(this.answerFor('event'));
    } else if (lower.includes('admin')) {
      this.addBot(this.answerFor('admin'));
    } else if (lower.includes('menu')) {
      this.addBot(
        "You can browse the full menu on the Menu page. Click an item to add it to an order, or just use it as a reference while planning reservations and events."
      );
    } else {
      this.addBot(
        "I’m mainly here to explain how SRMS works: menu, orders, reservations, events, and the admin dashboard. Try asking about one of those!"
      );
    }
  }

  private addUser(text: string) {
    this.messages.set([...this.messages(), { from: 'user', text }]);
  }

  private addBot(text: string) {
    // small delay to feel less robotic
    setTimeout(() => {
      this.messages.set([...this.messages(), { from: 'bot', text }]);
    }, 150);
  }

  private answerFor(topic: 'overview' | 'order' | 'reservation' | 'event' | 'admin'): string {
    switch (topic) {
      case 'overview':
        return (
          'SRMS is your restaurant management system. As a guest you can browse the menu, place pickup/delivery orders, book table reservations, and request special events. Staff and managers can use the Admin Dashboard to view analytics and manage the menu.'
        );
      case 'order':
        return (
          'To place an order, go to the Menu page, choose the dishes you want, and submit the order form. The backend records the order with its items, calculates the total, and tracks the status (pending, completed, cancelled).'
        );
      case 'reservation':
        return (
          'To make a reservation, open the Reservations page, pick a date and time, specify how many guests are coming, and add any notes. Your request is stored in the reservations table with a status (pending/approved/cancelled) for staff to manage.'
        );
      case 'event':
        return (
          'Events are for larger occasions like birthdays or corporate dinners. On the Events page you choose an event type, date/time, guest count, and optional menu ideas. The system links the event to your user and tracks its status so staff can follow up.'
        );
      case 'admin':
        return (
          'Admins can log into the Admin Dashboard to see overall stats: order volume, revenue, upcoming reservations and events, and top menu items. They can also manage the menu (add dishes, update availability) and use this data to plan staffing and promotions.'
        );
    }
  }
}
