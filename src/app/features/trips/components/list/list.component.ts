import { Component, OnInit } from '@angular/core';
import { TripService } from "../../services/trip.service";
import { ITrip } from "../../models/ITrip";
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  trips: ITrip[] = [];
  showDetails = false;
  selectedTrip: ITrip | null = null;
  isLoading = true;
  error: string | null = null;
  pagination: any = null; // Pour la pagination, si nécessaire

  filterForm: FormGroup;

  constructor(
    private tripService: TripService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      origin: [''],
      destination: [''],
      departureCountry: [''],
      arrivalCountry: [''],
      transportType: [''],
      transportCompany: [''],
      // Ajoute d'autres champs si besoin
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const origin = params['origin'] || '';
      const destination = params['destination'] || '';
      if (origin || destination) {
        this.filterForm.patchValue({ origin, destination });
        this.onSearch({ origin, destination });
      } else {
        this.getList();
      }
    });
  }

  getList(): void {
    this.isLoading = true;
    this.error = null;
    this.tripService.list({ status: 'VALIDATED' }).subscribe({
      next: (result) => {
        this.trips = result.data ?? [];
        this.pagination = result.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Erreur lors du chargement des données';
      }
    });
  }

loadMore(): void {
  if (!this.pagination?.hasNextPage) return;
  const params = { 
    page: this.pagination.currentPage + 1,
    status: 'VALIDATED' // Maintenir le filtre côté backend
  };
  this.isLoading = true;
  this.tripService.list(params).subscribe({
    next: (result) => {
      if (result && result.data && Array.isArray(result.data)) {
        // Plus besoin de filtrer côté frontend, le backend s'en charge
        this.trips = this.trips.concat(result.data);
        this.pagination = result.pagination;
      }
      this.isLoading = false;
    },
    error: (err) => {
      this.isLoading = false;
      this.error = "Erreur lors du chargement des données";
    }
  });
}

  onSearch(filters?: any): void {
    this.isLoading = true;
    this.error = null;
    const raw = filters || (this.filterForm?.valid ? this.filterForm.value : {});

    const mappedFilters: any = {};
    if (raw.origin)         mappedFilters.departure    = raw.origin;
    if (raw.destination)    mappedFilters.destination  = raw.destination;
    if (raw.dateFrom)       mappedFilters.dateFrom     = raw.dateFrom;
    if (raw.dateTo)         mappedFilters.dateTo       = raw.dateTo;
    if (raw.transportType)  mappedFilters.transportType = raw.transportType;
    if (raw.company)        mappedFilters.company      = raw.company;

    this.tripService.searchTrips(mappedFilters).subscribe({
      next: (result) => {
        this.trips = result.data ?? [];
        this.pagination = null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche';
      }
    });
  }

  openDetails(trip: ITrip): void {
    this.selectedTrip = trip;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedTrip = null;
  }

  // Méthode appelée par le filtre enfant
  onFilterChanged(filters: any) {
    this.onSearch(filters);
  }
}