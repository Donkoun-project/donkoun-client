import { Component, OnInit } from '@angular/core';
import { TripService } from '../trips/services/trip.service';
import { AuthService } from '../auth/services/service-auth.service';
import { ITrip } from '../trips/models/ITrip';

interface TripStats {
  status: string; // Code brut du statut (ex: 'PENDING')
  count: number;
  percentage: number;
}

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tripStats: TripStats[] = [];
  totalTrips: number = 0;
  loading = true;
  error: string | null = null;
  selectedStatus: string = '';
  allTrips: ITrip[] = [];

  constructor(
    private tripService: TripService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    // Récupérer les trips de l'utilisateur
    this.tripService.getTripByUserId(parseInt(userId)).subscribe({
      next: (trips) => {
        this.processTripsData(trips);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des trips:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  private processTripsData(trips: ITrip[]): void {
    // Stocker tous les trips
    this.allTrips = trips;
    
    // Calculer les statistiques par statut
    this.totalTrips = trips.length;
    const statusCounts = this.calculateStatusCounts(trips);
    this.tripStats = this.calculateStatusStats(statusCounts);
  }

  private calculateStatusCounts(trips: ITrip[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    trips.forEach(trip => {
      const status = trip.status || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }

  private calculateStatusStats(statusCounts: { [key: string]: number }): TripStats[] {
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status, // Garder le code brut du statut
      count,
      percentage: this.totalTrips > 0 ? Math.round((count / this.totalTrips) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'NO_VALIDATE': 'Non validé',
      'VALIDATE': 'Validé',
      'CLOSED_STATUS': 'Fermé',
      'REJECTED_STATUS': 'Rejeté',
      'UNKNOWN': 'Inconnu'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'NO_VALIDATE': 'status-no-validate',
      'VALIDATE': 'status-validate',
      'CLOSED_STATUS': 'status-closed',
      'REJECTED_STATUS': 'status-rejected',
      'UNKNOWN': 'status-unknown'
    };
    return statusClasses[status] || 'status-unknown';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  trackByTripId(index: number, trip: ITrip): number {
    return trip.id;
  }

  trackByStatus(index: number, stat: TripStats): string {
    return stat.status;
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
  }

  getDisplayedTrips(): ITrip[] {
    // Si aucun trip n'est chargé
    if (!this.allTrips || this.allTrips.length === 0) {
      return [];
    }
    
    // Si un statut est sélectionné, retourner les trips filtrés par statut
    if (this.selectedStatus && this.selectedStatus !== '') {
      const filteredTrips = this.allTrips
        .filter(trip => trip.status === this.selectedStatus)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      return filteredTrips;
    }
    
    // Sinon, retourner les 5 derniers trips de tous les status
    return this.allTrips
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getSectionTitle(): string {
    if (this.selectedStatus && this.selectedStatus !== '') {
      return `5 derniers trips - ${this.getStatusLabel(this.selectedStatus)}`;
    }
    return 'Mes 5 derniers trips';
  }

  getStatusOptions(): string[] {
    // Retourner les codes de statut pour le filtrage
    return this.tripStats.map(stat => stat.status);
  }

  getStatusLabelForOption(statusCode: string): string {
    // Retourner le label traduit pour affichage dans le dropdown
    return this.getStatusLabel(statusCode);
  }
}
