import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../token.service';
import { AuthService } from '../../features/auth/services/service-auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (token) {
      // Clone la requête et ajoute l'en-tête Authorization avec le token s'il n'est pas déjà présent
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          // Ajoute ici d'autres headers si besoin
        }
      });
      
      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.handleUnauthorized();
          }
          return throwError(() => error);
        })
      );
    }

    // Si aucun token, passe la requête telle quelle
    return next.handle(req);
  }

  private handleUnauthorized(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}