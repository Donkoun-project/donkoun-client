import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/service-auth.service';
import { TokenService } from 'src/app/shared/token.service';
import { SharedService } from 'src/app/shared/shared.service';
import { LoginRequest, LoginResponse } from '../models/login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let sharedService: jasmine.SpyObj<SharedService>;

  const mockLoginResponse: LoginResponse = {
    success: true,
    message: 'Connexion réussie',
    data: {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['isAuthenticated']);
    const sharedServiceSpy = jasmine.createSpyObj('SharedService', ['showAlert']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: SharedService, useValue: sharedServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard after successful login', (done) => {
    authService.login.and.returnValue(of(mockLoginResponse));
    router.navigate.and.returnValue(Promise.resolve(true));
    
    // Mock localStorage
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    // Attendre que le setTimeout se termine
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 150);
  });

  it('should redirect to saved URL if exists', (done) => {
    authService.login.and.returnValue(of(mockLoginResponse));
    router.navigate.and.returnValue(Promise.resolve(true));
    
    // Mock localStorage avec une URL de redirection sauvegardée
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'redirectAfterLogin') return '/trips/allpackage';
      return null;
    });
    spyOn(localStorage, 'removeItem');
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    // Attendre que le setTimeout se termine
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/trips/allpackage']);
      expect(localStorage.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
      done();
    }, 150);
  });

  it('should not redirect on login failure', () => {
    const errorResponse = { success: false, message: 'Invalid credentials' };
    authService.login.and.returnValue(of(errorResponse));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should handle login error', () => {
    const error = { status: 401, error: { message: 'Unauthorized' } };
    authService.login.and.returnValue(throwError(() => error));
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Identifiants incorrects. Veuillez vérifier votre numéro de téléphone et votre mot de passe.');
  });

  it('should save user data to localStorage on successful login', (done) => {
    authService.login.and.returnValue(of(mockLoginResponse));
    router.navigate.and.returnValue(Promise.resolve(true));
    
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    component.loginForm.patchValue({
      email: 'john@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', '1');
      expect(localStorage.setItem).toHaveBeenCalledWith('userFullName', 'John Doe');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'john@example.com');
      expect(localStorage.setItem).toHaveBeenCalledWith('userPhone', '+1234567890');
      done();
    }, 150);
  });
});
