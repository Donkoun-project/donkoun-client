import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ActivationComponent } from './activation.component';
import { AuthService } from '../services/service-auth.service';
import { SharedService } from '../../../shared/shared.service';

describe('ActivationComponent', () => {
  let component: ActivationComponent;
  let fixture: ComponentFixture<ActivationComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let sharedService: jasmine.SpyObj<SharedService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['activateAccount', 'resendActivationCode']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const sharedServiceSpy = jasmine.createSpyObj('SharedService', ['showAlert']);

    await TestBed.configureTestingModule({
      declarations: [ ActivationComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SharedService, useValue: sharedServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty activation code', () => {
    expect(component.activationForm.get('activationCode')?.value).toBe('');
  });

  it('should validate activation code length', () => {
    const activationCodeControl = component.activationForm.get('activationCode');
    
    activationCodeControl?.setValue('123');
    expect(activationCodeControl?.invalid).toBeTruthy();
    
    activationCodeControl?.setValue('123456');
    expect(activationCodeControl?.valid).toBeTruthy();
  });

  it('should activate account successfully', () => {
    const mockResponse = { success: true, message: 'Account activated' };
    authService.activateAccount.and.returnValue(of(mockResponse));
    
    component.activationForm.patchValue({ activationCode: '123456' });
    component.onSubmit();
    
    expect(authService.activateAccount).toHaveBeenCalledWith({
      activeUserAccountCredential: '123456'
    });
  });

  it('should handle activation error', () => {
    const mockError = { error: { message: 'Invalid activation code' } };
    authService.activateAccount.and.returnValue(throwError(() => mockError));
    
    component.activationForm.patchValue({ activationCode: '123456' });
    component.onSubmit();
    
    expect(component.isError).toBeTruthy();
    expect(component.errorMessage).toBe('Invalid activation code');
  });
});
