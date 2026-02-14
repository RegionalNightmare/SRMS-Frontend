import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';

    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill out all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        // user is automatically logged in by AuthService.register()
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error =
          err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
