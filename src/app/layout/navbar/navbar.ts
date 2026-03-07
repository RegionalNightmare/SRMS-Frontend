import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  menuOpen = false;
  adminMenuOpen = false;
  mobileAdminMenuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.mobileAdminMenuOpen = false;
    }
  }

  closeMenu() {
    this.menuOpen = false;
    this.mobileAdminMenuOpen = false;
  }

  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  openAdminMenu() {
    this.adminMenuOpen = true;
  }

  closeAdminMenu() {
    this.adminMenuOpen = false;
  }

  toggleMobileAdminMenu() {
    this.mobileAdminMenuOpen = !this.mobileAdminMenuOpen;
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.closeAdminMenu();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
    this.closeAdminMenu();
  }
}
