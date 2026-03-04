import { Navbar } from './layout/navbar/navbar';
import { ChatbotComponent } from './shared/chatbot/chat.component';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatbotComponent, Navbar], // ✅ add Navbar here
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
