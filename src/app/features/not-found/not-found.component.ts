import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-not-found',
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 class="text-8xl font-bold text-blue-600">404</h1>
      <p class="mt-4 text-2xl font-semibold text-gray-800">Page introuvable</p>
      <p class="mt-2 text-gray-500">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <button
        (click)="goHome()"
        class="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
        Retour à l'accueil
      </button>
    </div>
  `
})
export class NotFoundComponent {
  constructor(private router: Router) {}
  goHome() { this.router.navigate(['/']); }
}
