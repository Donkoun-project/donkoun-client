import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest } from '../models/register';
import { AuthService } from '../services/service-auth.service';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private registerService: AuthService,
    public sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  formatPhoneNumber(phone: string): string {
    // Nettoyage basique : garder seulement les chiffres et le + au début
    return phone.replace(/[^\d+]/g, '');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const now = new Date().toISOString();

    const registerData: RegisterRequest = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      phone: this.formatPhoneNumber(this.registerForm.value.phone),
      password: this.registerForm.value.password
    };

    this.registerService.registerUser(registerData).subscribe({
      next: (res) => {
        this.successMessage = 'Inscription réussie !';
        this.registerForm.reset();
        
        // Stocker l'email pour l'activation
        localStorage.setItem('pendingActivationEmail', registerData.email);
        
        this.sharedService.showAlert('success', 'Inscription réussie !', 'Un code d\'activation a été envoyé à votre email. Veuillez activer votre compte pour vous connecter.');
        
        // Rediriger vers la page d'activation
        this.router.navigate(['/auth/activation'], { 
          queryParams: { email: registerData.email } 
        });
        
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de l'inscription";
        this.sharedService.showAlert('error', 'Erreur', "Erreur lors de l'inscription. Vérifiez vos informations.");
      }
    }).add(() => {
      this.loading = false;
    });
  }
}