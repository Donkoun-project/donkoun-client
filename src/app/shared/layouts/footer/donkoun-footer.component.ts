import { Component } from '@angular/core';
import { NewsletterService } from '../../services/newsletter.service';

@Component({
  selector: 'app-donkoun-footer',
  templateUrl: './donkoun-footer.component.html',
  styleUrls: ['./donkoun-footer.component.scss']
})
export class DonkounFooterComponent {
  email = '';
  loading = false;
  success = false;
  error = '';

  constructor(private newsletterService: NewsletterService) {}

  subscribe(): void {
    const trimmed = this.email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      this.error = 'Veuillez entrer une adresse email valide.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    this.newsletterService.subscribe(trimmed).subscribe({
      next: () => {
        this.success = true;
        this.email = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Une erreur est survenue.';
        this.loading = false;
      }
    });
  }
}
