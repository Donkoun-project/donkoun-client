import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/service-auth.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'app-activation-link',
  templateUrl: './activation-link.component.html',
  styleUrls: ['./activation-link.component.scss']
})
export class ActivationLinkComponent implements OnInit {
  isActivating = false;
  isSuccess = false;
  isError = false;
  message = '';
  activationToken = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    // Récupérer le token d'activation depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.activationToken = params['token'] || '';
      
      if (this.activationToken) {
        this.activateAccountByLink();
      } else {
        this.isError = true;
        this.message = 'Token d\'activation manquant ou invalide';
      }
    });
  }

  activateAccountByLink(): void {
    this.isActivating = true;
    this.isError = false;
    this.isSuccess = false;

    const activationData = {
      activeUserAccountCredential: this.activationToken
    };

    this.authService.activateAccount(activationData).subscribe({
      next: (response: any) => {
        this.isActivating = false;
        this.isSuccess = true;
        this.message = 'Votre compte a été activé avec succès !';
        
        // Nettoyer le localStorage
        localStorage.removeItem('pendingActivationEmail');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { 
            queryParams: { message: 'account_activated' } 
          });
        }, 3000);
      },
      error: (error: any) => {
        this.isActivating = false;
        this.isError = true;
        this.message = error.error?.message || 'Erreur lors de l\'activation du compte';
        console.error('Erreur d\'activation:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
