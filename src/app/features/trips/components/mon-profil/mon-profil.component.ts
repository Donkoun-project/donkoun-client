import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IUserProfile, IUpdateUserProfileRequest } from '../../models/user';
import { AuthService } from 'src/app/features/auth/services/service-auth.service';
import { TokenService } from 'src/app/shared/token.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-mon-profil',
  templateUrl: './mon-profil.component.html',
  styleUrls: ['./mon-profil.component.scss']
})
export class MonProfilComponent implements OnInit {

  profileForm: FormGroup | null = null;
  user: IUserProfile | null = null;
  userId: string | null = null;
  loading = true;
  updating = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: AuthService,
    private tokenService: TokenService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.userId = this.getCurrentUserId();
    if (this.userId) {
      this.userService.getUserProfile(this.userId).subscribe({
        next: user => {
          this.user = user;
          this.initForm(user);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          // Gère l'affichage d'une erreur ici si tu veux
        }
      });
    } else {
      this.loading = false;
    }
  }

  initForm(user: IUserProfile) {
    this.profileForm = this.fb.group({
      fullName: [user.fullName, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      phone: [user.phone, Validators.required],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  getCurrentUserId(): string | null {
    if (!this.userId) {
      this.userId = this.extractUserIdFromToken();
    }
    return this.userId;
  }

  extractUserIdFromToken(): string | null {
    const token = this.tokenService.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const storedUserId = localStorage.getItem('userId');
      // Ne pas utiliser payload.sub car il contient l'email, pas l'ID
      return storedUserId || payload.userId || payload.id || null;
    } catch (e) {
      return null;
    }
  }

  formatPhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }

  onSubmit() {
    if (!this.profileForm || this.profileForm.invalid || !this.userId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      this.sharedService.showAlert('error', 'Erreur de validation', this.errorMessage);
      return;
    }

    this.updating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { oldPassword, newPassword, confirmPassword, ...rest } = this.profileForm.value;

    // Préparer les données pour la mise à jour
    const updateData: IUpdateUserProfileRequest = {
      fullName: rest.fullName,
      email: rest.email,
      phone: this.formatPhone(rest.phone)
    };

    // Changement de mot de passe si les champs sont remplis
    if (oldPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
        this.sharedService.showAlert('error', 'Erreur de validation', this.errorMessage);
        this.updating = false;
        return;
      }
      this.userService.changePassword(oldPassword, newPassword).subscribe({
        next: () => this.sharedService.showAlert('success', 'Mot de passe', 'Mot de passe mis à jour avec succès.'),
        error: (err) => this.sharedService.showAlert('error', 'Erreur', err?.error?.message || 'Impossible de changer le mot de passe.')
      });
    }

    // Appel à l'API pour mettre à jour le profil
    this.userService.updateUserProfile(this.userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.successMessage = 'Profil mis à jour avec succès !';
        this.sharedService.showAlert('success', 'Succès', this.successMessage);
        this.updateLocalStorage(updatedUser);
        this.initForm(updatedUser);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors de la mise à jour du profil.';
        this.sharedService.showAlert('error', 'Erreur', this.errorMessage);
      }
    }).add(() => {
      this.updating = false;
    });
  }

  private updateLocalStorage(user: IUserProfile): void {
    if (user.fullName) {
      localStorage.setItem('userFullName', user.fullName);
    }
    if (user.email) {
      localStorage.setItem('userEmail', user.email);
    }
    if (user.phone) {
      localStorage.setItem('userPhone', user.phone);
    }
  }
}