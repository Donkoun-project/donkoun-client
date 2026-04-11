import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITrip } from '../../models/ITrip';

@Component({
  selector: 'app-parcel-detail',
  templateUrl: './parcel-detail.component.html',
  styleUrls: ['./parcel-detail.component.scss']
})
export class ParcelDetailComponent {
  @Input() trip: ITrip | null;
  @Output() close = new EventEmitter<void>();
  @Input() showStatus: boolean = true;

  // Mapping status technique => label utilisateur
  statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    NO_VALIDATE: 'Non validé',
    VALIDATE: 'Validé',
    CLOSED_STATUS: 'Fermé',
    REJECTED_STATUS: 'Rejeté'
  };

  // Couleurs de badge par status
  statusBadgeClass: { [key: string]: string } = {
    PENDING: 'bg-blue-100 text-blue-700',
    NO_VALIDATE: 'bg-yellow-100 text-yellow-700',
    VALIDATE: 'bg-green-100 text-green-700',
    CLOSED_STATUS: 'bg-gray-200 text-gray-700',
    REJECTED_STATUS: 'bg-red-100 text-red-700'
  };

  closePanel() {
    this.close.emit();
  }

  getStatusLabel(status: string | undefined | null): string {
    if (!status) return 'Non validé';
    return this.statusLabels[status] || status;
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) return this.statusBadgeClass['NO_VALIDATE'];
    return this.statusBadgeClass[status] || 'bg-gray-100 text-gray-700';
  }
}