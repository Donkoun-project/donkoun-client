import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/service-auth.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  standalone: false,
  selector: 'app-donkoun-header',
  templateUrl: './donkoun-header.component.html',
  styleUrls: ['./donkoun-header.component.scss']
})
export class DonkounHeaderComponent implements OnInit {
  isAuthenticated = false;
  baniere = true;
  currentPath = '';
  showDropdown = false;  // Pour le menu "Mon compte"

  constructor(
    private router: Router,
    public shared: SharedService,
    private authService: AuthService,
    private elRef: ElementRef   // Permet de détecter les clics en dehors du composant
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isAuthenticated = status;
    });
    this.currentPath = this.router.url;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.showDropdown = false; // Ferme le menu après déconnexion
  }

  setBaniereStatus() {
    this.shared.baniereImage = false;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  // Ferme le dropdown si clic en dehors du composant
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}