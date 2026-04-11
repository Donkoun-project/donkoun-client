import {Component, Input, Output, EventEmitter} from '@angular/core';
import { ITrip } from 'src/app/features/trips/models/ITrip';

@Component({
  selector: 'app-parcels',
  templateUrl: './parcels.component.html',
  styleUrls: ['./parcels.component.scss']
})
export class ParcelsComponent { 
  @Input() trip: ITrip;
  @Output() details = new EventEmitter<ITrip>();

  statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    NO_VALIDATE: 'Non validé',
    VALIDATE: 'Validé',
    VALIDATED: 'Validé',
    CLOSED_STATUS: 'Fermé',
    REJECTED_STATUS: 'Rejeté'
  };

  statusClasses: { [key: string]: string } = {
    PENDING: 'status-pending',
    NO_VALIDATE: 'status-novalidate',
    VALIDATE: 'status-validate',
    VALIDATED: 'status-validate',
    CLOSED_STATUS: 'status-closed',
    REJECTED_STATUS: 'status-rejected'
  };

  openDetails() {
    this.details.emit(this.trip);
  } 

  getStatusLabel(status: string | undefined | null): string {
    if (!status) return 'Non validé';
    return this.statusLabels[status] || status;
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) return 'status-novalidate';
    return this.statusClasses[status] || 'status-default';
  }
}