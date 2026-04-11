import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { take } from 'rxjs/operators';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create and auto-remove notification', (done) => {
    const notification = service.success('Test', 'Test message', 100); // 100ms pour test rapide
    
    // Vérifier que la notification est créée
    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(notification);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Test');
      expect(notifications[0].message).toBe('Test message');
    });

    // Vérifier que la notification est supprimée automatiquement
    setTimeout(() => {
      service.notifications$.pipe(take(1)).subscribe(notifications => {
        expect(notifications.length).toBe(0);
        done();
      });
    }, 150); // Attendre un peu plus que la durée de la notification
  });

  it('should create notification without auto-remove when duration is 0', (done) => {
    const notification = service.success('Test', 'Test message', 0);
    
    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(1);
    });

    // Attendre et vérifier que la notification n'est pas supprimée
    setTimeout(() => {
      service.notifications$.pipe(take(1)).subscribe(notifications => {
        expect(notifications.length).toBe(1);
        done();
      });
    }, 100);
  });

  it('should remove notification manually', () => {
    const notification = service.success('Test', 'Test message');
    
    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(1);
    });

    service.remove(notification);

    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(0);
    });
  });

  it('should clear all notifications', () => {
    service.success('Test 1', 'Message 1');
    service.error('Test 2', 'Message 2');
    
    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(2);
    });

    service.clear();

    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(0);
    });
  });

  it('should create different types of notifications', () => {
    service.success('Success', 'Success message');
    service.error('Error', 'Error message');
    service.warning('Warning', 'Warning message');
    service.info('Info', 'Info message');

    service.notifications$.pipe(take(1)).subscribe(notifications => {
      expect(notifications.length).toBe(4);
      expect(notifications[0].type).toBe('success');
      expect(notifications[1].type).toBe('error');
      expect(notifications[2].type).toBe('warning');
      expect(notifications[3].type).toBe('info');
    });
  });
});
