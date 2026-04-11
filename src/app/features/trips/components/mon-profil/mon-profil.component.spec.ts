import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { MonProfilComponent } from './mon-profil.component';
import { AuthService } from 'src/app/features/auth/services/service-auth.service';
import { TokenService } from 'src/app/shared/token.service';
import { SharedService } from 'src/app/shared/shared.service';
import { IUserProfile, IUpdateUserProfileRequest } from '../../models/user';

describe('MonProfilComponent', () => {
  let component: MonProfilComponent;
  let fixture: ComponentFixture<MonProfilComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let sharedService: jasmine.SpyObj<SharedService>;

  const mockUser: IUserProfile = {
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    roleId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockUpdatedUser: IUserProfile = {
    ...mockUser,
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+0987654321',
    updatedAt: new Date('2024-01-02')
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserProfile', 'updateUserProfile']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getToken']);
    const sharedServiceSpy = jasmine.createSpyObj('SharedService', ['showAlert']);

    await TestBed.configureTestingModule({
      declarations: [MonProfilComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: SharedService, useValue: sharedServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonProfilComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    tokenService.getToken.and.returnValue('mock-token');
    authService.getUserProfile.and.returnValue(of(mockUser));
    
    component.ngOnInit();
    
    expect(authService.getUserProfile).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.loading).toBeFalse();
  });

  it('should initialize form with user data', () => {
    component.initForm(mockUser);
    
    expect(component.profileForm).toBeTruthy();
    expect(component.profileForm?.get('fullName')?.value).toBe(mockUser.fullName);
    expect(component.profileForm?.get('email')?.value).toBe(mockUser.email);
    expect(component.profileForm?.get('phone')?.value).toBe(mockUser.phone);
  });

  it('should validate passwords match', () => {
    component.initForm(mockUser);
    const form = component.profileForm!;
    
    form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'password123'
    });
    
    expect(form.hasError('passwordsMismatch')).toBeFalse();
    
    form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'different123'
    });
    
    expect(form.hasError('passwordsMismatch')).toBeTrue();
  });

  it('should update user profile successfully', () => {
    component.user = mockUser;
    component.userId = '1';
    component.initForm(mockUser);
    authService.updateUserProfile.and.returnValue(of(mockUpdatedUser));
    
    // Simuler des changements dans le formulaire
    component.profileForm!.patchValue({
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+0987654321'
    });
    
    component.onSubmit();
    
    expect(authService.updateUserProfile).toHaveBeenCalledWith('1', {
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+0987654321'
    });
    expect(component.user).toEqual(mockUpdatedUser);
    expect(component.successMessage).toBe('Profil mis à jour avec succès !');
    expect(sharedService.showAlert).toHaveBeenCalledWith('success', 'Succès', 'Profil mis à jour avec succès !');
  });

  it('should handle update error', () => {
    component.user = mockUser;
    component.userId = '1';
    component.initForm(mockUser);
    const error = new Error('Update failed');
    authService.updateUserProfile.and.returnValue(throwError(() => error));
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Update failed');
    expect(sharedService.showAlert).toHaveBeenCalledWith('error', 'Erreur', 'Update failed');
  });

  it('should not submit if form is invalid', () => {
    component.user = mockUser;
    component.userId = '1';
    component.initForm(mockUser);
    
    // Rendre le formulaire invalide
    component.profileForm!.patchValue({
      fullName: '', // Champ requis vide
      email: 'invalid-email' // Email invalide
    });
    
    component.onSubmit();
    
    expect(authService.updateUserProfile).not.toHaveBeenCalled();
    expect(sharedService.showAlert).toHaveBeenCalledWith('error', 'Erreur de validation', 'Veuillez remplir tous les champs obligatoires correctement.');
  });

  it('should not submit if no user ID', () => {
    component.user = mockUser;
    component.userId = null;
    component.initForm(mockUser);
    
    component.onSubmit();
    
    expect(authService.updateUserProfile).not.toHaveBeenCalled();
    expect(sharedService.showAlert).toHaveBeenCalledWith('error', 'Erreur de validation', 'Veuillez remplir tous les champs obligatoires correctement.');
  });

  it('should handle password mismatch', () => {
    component.user = mockUser;
    component.userId = '1';
    component.initForm(mockUser);
    
    component.profileForm!.patchValue({
      oldPassword: 'oldpass',
      newPassword: 'newpass',
      confirmPassword: 'differentpass'
    });
    
    component.onSubmit();
    
    expect(authService.updateUserProfile).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Les nouveaux mots de passe ne correspondent pas.');
    expect(sharedService.showAlert).toHaveBeenCalledWith('error', 'Erreur de validation', 'Les nouveaux mots de passe ne correspondent pas.');
  });

  it('should update localStorage after successful update', () => {
    component.user = mockUser;
    component.userId = '1';
    component.initForm(mockUser);
    authService.updateUserProfile.and.returnValue(of(mockUpdatedUser));
    
    spyOn(localStorage, 'setItem');
    
    component.onSubmit();
    
    expect(localStorage.setItem).toHaveBeenCalledWith('userFullName', mockUpdatedUser.fullName);
    expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', mockUpdatedUser.email);
    expect(localStorage.setItem).toHaveBeenCalledWith('userPhone', mockUpdatedUser.phone);
  });

  it('should extract user ID from token', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.test';
    tokenService.getToken.and.returnValue(mockToken);
    
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('123');
    
    const userId = component.extractUserIdFromToken();
    
    expect(userId).toBe('123');
  });
});