import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { TripService } from '../../services/trip.service';
import { ITrip } from '../../models/ITrip';
import { AuthService } from 'src/app/features/auth/services/service-auth.service';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  standalone: false,
  selector: 'app-all-package',
  templateUrl: './all-package.component.html',
  styleUrls: ['./all-package.component.scss']
})
export class AllPackageComponent implements OnInit {

  trips: ITrip[] = [];
  filters = {
    departure: '',
    destination: '', 
    status: '',
    date: ''
  };

  showDetails = false;
  selectedTrip: ITrip | null = null;

  isLoading = true;
  error: string | null = null;

  statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    VALIDATED: 'Validé',
    ACTIVE: 'Actif',
    CLOSED: 'Fermé',
    REJECTED: 'Rejeté',
    CANCELLED: 'Annulé'
  };

  statusBadgeClass: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    VALIDATED: 'bg-green-100 text-green-700',
    ACTIVE: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-200 text-gray-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-orange-100 text-orange-700'
  };

  currentPage = 1;
  pageSize = 10;

  userId: number | null = null;
  visibleDropdown: ITrip | null = null;

  get filteredTrips(): ITrip[] {
    let result = this.trips;
    if (this.filters.departure) {
      result = result.filter(t => t.departureCity?.toLowerCase().includes(this.filters.departure.toLowerCase()));
    }
    if (this.filters.destination) {
      result = result.filter(t => t.arrivalCity?.toLowerCase().includes(this.filters.destination.toLowerCase()));
    }
    if (this.filters.status) {
      result = result.filter(t => t.status === this.filters.status);
    }
    if (this.filters.date) {
      result = result.filter(t => t.departureDate?.startsWith(this.filters.date));
    }
    return result;
  }

  get totalResults() {
    return this.filteredTrips.length;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  constructor(
    private tripService: TripService,
    private authService: AuthService,
    private _eref: ElementRef,
    public router: Router,
    public sharedService: SharedService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      const userIdString = this.authService.getCurrentUserId();
      const storedUserId = localStorage.getItem('userId');
      this.userId = storedUserId ? parseInt(storedUserId, 10) : (userIdString ? parseInt(userIdString, 10) : null);

      if (this.userId && !isNaN(this.userId)) {
        this.getList();
      } else {
        this.isLoading = false;
        this.error = 'Erreur: Impossible de récupérer l\'ID utilisateur';
      }
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown-action-parent')) {
      this.visibleDropdown = null;
    }
  }

  toggleDropdown(trip: ITrip, event: MouseEvent) {
    event.stopPropagation();
    this.visibleDropdown = this.visibleDropdown === trip ? null : trip;
  }

  isDropdownOpen(trip: ITrip): boolean {
    return this.visibleDropdown === trip;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    }

  getList() {
    this.isLoading = true;
    this.error = null;

    if (!this.userId) {
      this.isLoading = false;
      this.error = 'Impossible de récupérer l\'ID utilisateur.';
      this.logout();
      return;
    }

    this.tripService.getTripByUserId(this.userId).subscribe({
      next: (trips) => {
        this.trips = trips;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Erreur lors du chargement des trajets.';
      }
    });
  }

  get pagedParcels(): ITrip[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTrips.slice(start, start + this.pageSize);
  }

  get startItem(): number {
    return this.totalResults === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalResults);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalResults / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  applyFilters() {
    this.currentPage = 1;
  }

  deleteParcel(trip: ITrip): void {
    this.sharedService.showConfirmationAlert(
      'Êtes-vous sûr ?',
      'Cette action est irréversible.',
      'Oui, supprimer !'
    ).then((result) => {
      if (result.isConfirmed) {
        this.tripService.deleteTrip(trip.id.toString()).subscribe({
          next: () => {
            this.sharedService.showAlert('success', 'Supprimé !', 'Le trajet a bien été supprimé.');
            this.getList();
          },
          error: () => {
            this.sharedService.showAlert('error', 'Erreur', 'La suppression a échoué.');
          }
        });
      }
    });
    this.visibleDropdown = null;
}

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openDetails(trip: ITrip) {
    this.selectedTrip = trip;
    this.showDetails = true;
    this.visibleDropdown = null;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedTrip = null;
  }

  editTrip(trip: ITrip) {
  this.visibleDropdown = null;
  this.router.navigate(['/trips/edit', trip.id]);
}
}