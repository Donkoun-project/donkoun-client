import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { NotificationService } from './services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService { 
  baniereImage: boolean= true;
  constructor(private notificationService: NotificationService) {}

  showAlert(icon: SweetAlertIcon, title: string, text: string) {
    // Utiliser les notifications toast au lieu des modales
    switch (icon) {
      case 'success':
        return this.notificationService.success(title, text);
      case 'error':
        return this.notificationService.error(title, text);
      case 'warning':
        return this.notificationService.warning(title, text);
      case 'info':
        return this.notificationService.info(title, text);
      default:
        return this.notificationService.info(title, text);
    }
  }

  showConfirmationAlert(
    title: string,
    text: string,
    confirmButtonText: string = 'Oui, confirme!',
    cancelButtonText: string = 'Non, annule'
  ){
   return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText
    })
  }

  // Méthode pour les confirmations simples (garder les modales)
  showConfirm(
    title: string,
    text: string,
    details: string = '',
    confirmButtonText: string = 'Oui, confirme!'
  ) {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Annuler'
    });
  }
}