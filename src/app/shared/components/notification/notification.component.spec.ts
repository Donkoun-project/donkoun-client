import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '../../services/notification.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['remove']);
    const notificationsSubject = new BehaviorSubject([]);
    notificationServiceSpy.notifications$ = notificationsSubject.asObservable();

    await TestBed.configureTestingModule({
      declarations: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display notifications', () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'success' as const,
        title: 'Success',
        message: 'Operation successful',
        duration: 5000
      },
      {
        id: '2',
        type: 'error' as const,
        title: 'Error',
        message: 'Operation failed',
        duration: 5000
      }
    ];

    // Simuler l'émission de notifications
    (notificationService.notifications$ as any).next(mockNotifications);
    fixture.detectChanges();

    expect(component.notifications).toEqual(mockNotifications);
  });

  it('should call remove when close button is clicked', () => {
    const mockNotification = {
      id: '1',
      type: 'success' as const,
      title: 'Success',
      message: 'Operation successful',
      duration: 5000
    };

    component.notifications = [mockNotification];
    fixture.detectChanges();

    const closeButton = fixture.debugElement.nativeElement.querySelector('button');
    closeButton.click();

    expect(notificationService.remove).toHaveBeenCalledWith('1');
  });

  it('should apply correct CSS classes for different notification types', () => {
    const successNotification = {
      id: '1',
      type: 'success' as const,
      title: 'Success',
      message: 'Success message',
      duration: 5000
    };

    const errorNotification = {
      id: '2',
      type: 'error' as const,
      title: 'Error',
      message: 'Error message',
      duration: 5000
    };

    component.notifications = [successNotification, errorNotification];
    fixture.detectChanges();

    const successClasses = component.getNotificationClasses('success');
    const errorClasses = component.getNotificationClasses('error');

    expect(successClasses).toContain('bg-green-50');
    expect(successClasses).toContain('border-green-400');
    expect(errorClasses).toContain('bg-red-50');
    expect(errorClasses).toContain('border-red-400');
  });
});
