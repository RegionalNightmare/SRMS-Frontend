import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword {
  email = '';
  token = '';

  newPassword = '';
  confirmPassword = '';

  loading = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    // Read query params from link: /reset-password?token=...&email=...
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email') || '';
      this.token = params.get('token') || '';
    });
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.email || !this.token) {
      this.error = 'Reset link is missing required info. Please request a new link.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res?.message || 'Password reset successfully. You can now log in.';

        // Optional: auto redirect after a moment
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ||
          err?.message ||
          'Reset failed. Please request a new reset link.';
      },
    });
  }
}
