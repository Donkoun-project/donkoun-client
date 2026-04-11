import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      id,
      duration: notification.duration ?? 5000, // 5 secondes par défaut
      ...notification
    };

    const current = this.notifications.value;
    this.notifications.next([...current, newNotification]);

    // Auto-remove après la durée spécifiée
    console.log('Notification créée avec durée:', newNotification.duration);
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        console.log('Suppression automatique de la notification:', id);
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  remove(id: string): void {
    console.log('Suppression de la notification:', id);
    const current = this.notifications.value;
    this.notifications.next(current.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.next([]);
  }
}
