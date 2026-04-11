import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { TokenService } from 'src/app/shared/token.service';
import { IUserProfile, IUserProfileResponse, IUpdateUserProfileRequest, IUpdateUserProfileResponse } from '../../trips/models/user';
import { RegisterRequest, RegisterResponse } from '../models/register';
import { LoginRequest, LoginResponse } from '../models/login';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.baseUrl}/api/v1`;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.tokenService.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userId: string | null = null; 

  constructor(private http: HttpClient, public tokenService: TokenService) {
    this.userId = this.extractUserIdFromToken();
    
    // Vérifier l'expiration du token au démarrage
    this.checkTokenExpiration();
    
    // Vérifier l'expiration du token toutes les minutes
    setInterval(() => {
      this.checkTokenExpiration();
    }, 60000); // 60 secondes
  }

  registerUser(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response: LoginResponse) => {
        if (response.success && response.data?.accessToken) {
          this.tokenService.setToken(response.data.accessToken);
          this.isLoggedInSubject.next(true);
          console.log('Connexion réussie, utilisateur maintenant connecté');
        } else {
          console.warn('Connexion : aucun token d\'accès reçu');
        }
      })
    );
  }

  getUserProfile(id: string): Observable<IUserProfile> {
    return this.http.get<IUserProfileResponse>(`${this.apiUrl}/users/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data)
      );
  }

  // Méthode pour obtenir le profil de l'utilisateur connecté
  getCurrentUserProfile(): Observable<IUserProfile> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('Aucun ID utilisateur disponible');
    }
    return this.getUserProfile(userId);
  }

  // Méthode pour mettre à jour le profil utilisateur
  updateUserProfile(id: string, userData: IUpdateUserProfileRequest): Observable<IUserProfile> {
    return this.http.put<IUpdateUserProfileResponse>(`${this.apiUrl}/users/${id}`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
        }
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    // Nettoyer aussi le refresh token
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    this.isLoggedInSubject.next(false);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/update-password`, {
      oldPassword,
      newPassword,
      comfirmationNewPassword: newPassword
    }, { headers: this.getAuthHeaders() });
  }

  // Méthode pour activer un compte utilisateur
  activateAccount(activationData: { activeUserAccountCredential: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/active`, activationData).pipe(
      map(response => response),
      catchError(error => {
        console.error('Erreur lors de l\'activation du compte:', error);
        return throwError(() => error);
      })
    );
  }

  // Méthode pour renvoyer le code d'activation
  resendActivationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-activation`, { email }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Erreur lors du renvoi du code d\'activation:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifie si le token est expiré et déconnecte automatiquement si nécessaire.
   */
  private checkTokenExpiration(): void {
    if (this.tokenService.isCurrentTokenExpired()) {
      this.logout();
    }
  }

  // Méthode pour rafraîchir le token
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {
      refreshToken: refreshToken
    }).pipe(
      tap((response: LoginResponse) => {
        if (response.success && response.data?.accessToken) {
          this.tokenService.setToken(response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
        }
      })
    );
  }

  getCurrentUserId(): string | null {
    if (!this.userId) {
      this.userId = this.extractUserIdFromToken();
    }
    return this.userId;
  }

  private extractUserIdFromToken(): string | null {
    const token = this.tokenService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const storedUserId = localStorage.getItem('userId');
      // Ne pas utiliser payload.sub car il contient l'email, pas l'ID
      return storedUserId || payload.userId || payload.id || null;
    } catch (e) {
      return null;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }
}