import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRequest } from '../models/login';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/service-auth.service';
import { TokenService } from 'src/app/shared/token.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private loginService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Vérifier si l'utilisateur vient d'activer son compte
    this.route.queryParams.subscribe(params => {
      if (params['message'] === 'account_activated') {
        this.successMessage = 'Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.';
        this.sharedService.showAlert('success', 'Compte activé', 'Votre compte a été activé avec succès !');
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      this.sharedService.showAlert('error', 'Champs manquants', this.errorMessage);
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.loginService.login(payload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Sauvegarder les données supplémentaires (le service gère déjà le token)
          if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
          }
          if (res.data.id) {
            localStorage.setItem('userId', res.data.id.toString());
          }
          if (res.data.fullName) {
            localStorage.setItem('userFullName', res.data.fullName);
          }
          if (res.data.email) {
            localStorage.setItem('userEmail', res.data.email);
          }
          if (res.data.phone) {
            localStorage.setItem('userPhone', res.data.phone);
          }
          
          this.successMessage = res.message || 'Connexion réussie !';
          // Pas de notification de succès après la connexion
          
          // Redirection avec un petit délai pour s'assurer que tout est sauvegardé
          setTimeout(() => {
            console.log('Attempting redirect after login...');
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
              console.log('Redirecting to saved URL:', redirectUrl);
              localStorage.removeItem('redirectAfterLogin');
              this.router.navigate([redirectUrl]).then(success => {
                console.log('Navigation success:', success);
              }).catch(err => {
                console.error('Navigation error:', err);
              });
            } else {
              console.log('Redirecting to default URL: /dashboard');
              this.router.navigate(['/dashboard']).then(success => {
                console.log('Navigation success:', success);
              }).catch(err => {
                console.error('Navigation error:', err);
              });
            }
          }, 100);
        } else {
          this.errorMessage = res.message || "Erreur lors de la connexion.";
          this.sharedService.showAlert('error', 'Erreur', this.errorMessage);
        }
      },
      error: (err) => {
        // Analyse de l'erreur pour un message adapté
        if (err.status === 0) {
          // Erreur réseau ou serveur injoignable
          this.errorMessage = "Impossible de joindre le serveur. Veuillez vérifier votre connexion Internet.";
        } else if (err.status === 401 || err.status === 403) {
          // Vérifier si c'est un problème d'activation de compte
          if (err.error && err.error.message && err.error.message.includes('activation')) {
            this.errorMessage = "Votre compte n'est pas encore activé. Veuillez vérifier votre email et activer votre compte.";
            // Rediriger vers la page d'activation
            this.router.navigate(['/auth/activation'], { 
              queryParams: { email: this.loginForm.value.email } 
            });
          } else {
            // Identifiants incorrects ou accès refusé
            this.errorMessage = "Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.";
          }
        } else if (err.status === 500) {
          // Erreur interne du serveur
          this.errorMessage = "Une erreur interne est survenue. Merci de réessayer plus tard.";
        } else if (err.error && err.error.message) {
          // Message d'erreur spécifique du backend
          this.errorMessage = err.error.message;
        } else if (err.error) {
          // Autre message d'erreur provenant du backend
          this.errorMessage = err.error;
        } else {
          // Erreur générique
          this.errorMessage = "Erreur lors de la connexion. Veuillez réessayer.";
        }

        this.sharedService.showAlert('error', 'Erreur', this.errorMessage);
      }
    }).add(() => {
      this.loading = false;
    });
  }
}