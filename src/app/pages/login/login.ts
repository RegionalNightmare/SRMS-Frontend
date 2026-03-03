import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  error = '';

  loading = false;

  // Forgot password
  forgotMode = false;
  resetEmail = '';
  resetLoading = false;
  resetMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.resetMessage = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ||
          err?.message ||
          'Login failed. Please check your credentials.';
      },
    });
  }

  openForgot() {
    this.error = '';
    this.resetMessage = '';
    this.forgotMode = true;
    this.resetEmail = this.email || '';
  }

  closeForgot() {
    this.error = '';
    this.resetMessage = '';
    this.forgotMode = false;
  }

  requestReset() {
    this.error = '';
    this.resetMessage = '';

    if (!this.resetEmail) {
      this.error = 'Please enter your email to reset your password.';
      return;
    }

    this.resetLoading = true;

    // Expecting AuthService method. See snippet below.
    this.auth.requestPasswordReset(this.resetEmail).subscribe({
      next: () => {
        this.resetLoading = false;
        this.resetMessage =
          'If an account exists for that email, a reset link has been sent.';
      },
      error: (err) => {
        this.resetLoading = false;
        this.error =
          err?.error?.message ||
          err?.message ||
          'Could not send reset email. Please try again.';
      },
    });
  }
}
