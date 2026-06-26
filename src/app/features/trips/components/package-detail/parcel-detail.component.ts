import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITrip } from '../../models/ITrip';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,
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

  copied = false;
  readonly whatsappGroupUrl = environment.whatsappGroupUrl;

  copyTripInfo() {
    if (!this.trip) return;

    const msg = [
      `👋 Bonjour, je suis intéressé(e) par ce trajet sur Donkoun :`,
      ``,
      `✈️ ${this.trip.departureCity} (${this.trip.departureCountry}) → ${this.trip.arrivalCity} (${this.trip.arrivalCountry})`,
      `📅 Départ : ${new Date(this.trip.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `📦 Disponible : ${this.trip.availableQuantity} ${this.trip.unit}`,
      `💰 Prix : ${this.trip.pricePerKg} ${this.trip.currency} / ${this.trip.unit}`,
      `🚢 Transport : ${this.trip.transportType} — ${this.trip.transportCompany}`,
    ].join('\n');

    navigator.clipboard.writeText(msg).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 4000);
    }).catch(() => {});
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