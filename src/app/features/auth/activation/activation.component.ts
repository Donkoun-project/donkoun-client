import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/service-auth.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  standalone: false,
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {
  activationForm: FormGroup;
  isActivating = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';
  successMessage = '';
  activationCode = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.activationForm = this.fb.group({
      activationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'email depuis les paramètres de route ou le localStorage
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('pendingActivationEmail') || '';
    });

    // Vérifier si on a un code d'activation dans l'URL
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.activationCode = params['code'];
        this.activationForm.patchValue({ activationCode: this.activationCode });
        // Auto-activer si on a un code dans l'URL
        this.activateAccount();
      }
    });
  }

  onSubmit(): void {
    if (this.activationForm.valid) {
      this.activateAccount();
    } else {
      this.activationForm.markAllAsTouched();
    }
  }

  activateAccount(): void {
    this.isActivating = true;
    this.isError = false;
    this.isSuccess = false;

    const activationData = {
      activeUserAccountCredential: this.activationForm.value.activationCode
    };

    this.authService.activateAccount(activationData).subscribe({
      next: (response: any) => {
        this.isActivating = false;
        this.isSuccess = true;
        this.successMessage = 'Votre compte a été activé avec succès !';
        
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
        this.errorMessage = error.error?.message || 'Erreur lors de l\'activation du compte';
        console.error('Erreur d\'activation:', error);
      }
    });
  }

  resendActivationCode(): void {
    if (!this.email) {
      this.sharedService.showAlert('error', 'Erreur', 'Email non disponible pour renvoyer le code');
      return;
    }

    this.authService.resendActivationCode(this.email).subscribe({
      next: (response: any) => {
        this.sharedService.showAlert('success', 'Code renvoyé', 'Un nouveau code d\'activation a été envoyé à votre email');
      },
      error: (error: any) => {
        this.sharedService.showAlert('error', 'Erreur', 'Impossible de renvoyer le code d\'activation');
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
