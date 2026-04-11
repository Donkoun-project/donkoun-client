import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'token'; // Utilise 'token' pour cohérence avec le reste du code

  constructor() {}

  /**
   * Stocke le token JWT dans le localStorage (et non sessionStorage)
   * pour qu'il soit persistant même en cas de rafraîchissement ou d'ouverture d'un nouvel onglet.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Récupère le token JWT depuis le localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Supprime le token JWT du localStorage.
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Vérifie si l'utilisateur est authentifié.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Vérifier si le token est expiré
    return !this.isTokenExpired(token);
  }

  /**
   * Vérifie si le token JWT est expiré.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true; // Considérer comme expiré en cas d'erreur
    }
  }

  /**
   * Vérifie si le token actuel est expiré (méthode publique).
   */
  isCurrentTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    return this.isTokenExpired(token);
  }
}