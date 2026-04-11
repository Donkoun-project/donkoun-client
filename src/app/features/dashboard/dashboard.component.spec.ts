import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { TripService } from '../trips/services/trip.service';
import { AuthService } from '../auth/services/service-auth.service';
import { ITrip } from '../trips/models/ITrip';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let tripService: jasmine.SpyObj<TripService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockTrips: ITrip[] = [
    {
      id: 1,
      departureCity: 'Paris',
      arrivalCity: 'Lyon',
      departureDate: '2024-01-15T10:00:00Z',
      arrivalDate: '2024-01-15T14:00:00Z',
      deliveryLocation: 'Centre-ville',
      pickupLocation: 'Aéroport',
      arrivalCountry: 'France',
      availableQuantity: 50,
      minReservation: 5,
      pricePerKg: 2.5,
      currency: 'EUR',
      transportType: 'Avion',
      transportCompany: 'Air France',
      departureCountry: 'France',
      status: 'PENDING',
      reservationDeadline: '2024-01-14T18:00:00Z',
      message: 'Transport rapide',
      unit: 'kg',
      userId: 1,
      userName: 'John Doe',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 2,
      departureCity: 'Marseille',
      arrivalCity: 'Nice',
      departureDate: '2024-01-20T09:00:00Z',
      arrivalDate: '2024-01-20T12:00:00Z',
      deliveryLocation: 'Port',
      pickupLocation: 'Gare',
      arrivalCountry: 'France',
      availableQuantity: 30,
      minReservation: 3,
      pricePerKg: 1.8,
      currency: 'EUR',
      transportType: 'Train',
      transportCompany: 'SNCF',
      departureCountry: 'France',
      status: 'VALIDATE',
      reservationDeadline: '2024-01-19T20:00:00Z',
      message: 'Transport écologique',
      unit: 'kg',
      userId: 1,
      userName: 'John Doe',
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-12T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    const tripServiceSpy = jasmine.createSpyObj('TripService', ['getTripByUserId']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TripService, useValue: tripServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    tripService = TestBed.inject(TripService) as jasmine.SpyObj<TripService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    authService.getCurrentUserId.and.returnValue('1');
    tripService.getTripByUserId.and.returnValue(of(mockTrips));

    component.ngOnInit();

    expect(authService.getCurrentUserId).toHaveBeenCalled();
    expect(tripService.getTripByUserId).toHaveBeenCalledWith(1);
    expect(component.recentTrips.length).toBe(2);
    expect(component.totalTrips).toBe(2);
  });

  it('should handle error when loading trips', () => {
    authService.getCurrentUserId.and.returnValue('1');
    tripService.getTripByUserId.and.returnValue(throwError('Error loading trips'));

    component.ngOnInit();

    expect(component.error).toBe('Erreur lors du chargement des données');
    expect(component.loading).toBeFalse();
  });

  it('should handle no user ID', () => {
    authService.getCurrentUserId.and.returnValue(null);

    component.ngOnInit();

    expect(component.error).toBe('Utilisateur non connecté');
    expect(component.loading).toBeFalse();
  });

  it('should get correct status label', () => {
    expect(component.getStatusLabel('PENDING')).toBe('En attente');
    expect(component.getStatusLabel('VALIDATE')).toBe('Validé');
    expect(component.getStatusLabel('NO_VALIDATE')).toBe('Non validé');
    expect(component.getStatusLabel('CLOSED_STATUS')).toBe('Fermé');
    expect(component.getStatusLabel('REJECTED_STATUS')).toBe('Rejeté');
    expect(component.getStatusLabel('UNKNOWN')).toBe('Inconnu');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('VALIDATE')).toBe('status-validate');
    expect(component.getStatusClass('NO_VALIDATE')).toBe('status-no-validate');
    expect(component.getStatusClass('CLOSED_STATUS')).toBe('status-closed');
    expect(component.getStatusClass('REJECTED_STATUS')).toBe('status-rejected');
  });

  it('should format date correctly', () => {
    const dateString = '2024-01-15T10:00:00Z';
    const formattedDate = component.formatDate(dateString);
    expect(formattedDate).toContain('15');
    expect(formattedDate).toContain('janv.');
    expect(formattedDate).toContain('2024');
  });

  it('should calculate trip stats correctly', () => {
    authService.getCurrentUserId.and.returnValue('1');
    tripService.getTripByUserId.and.returnValue(of(mockTrips));

    component.ngOnInit();

    expect(component.tripStats.length).toBe(2);
    expect(component.tripStats[0].status).toBe('Validé');
    expect(component.tripStats[0].count).toBe(1);
    expect(component.tripStats[0].percentage).toBe(50);
    expect(component.tripStats[1].status).toBe('En attente');
    expect(component.tripStats[1].count).toBe(1);
    expect(component.tripStats[1].percentage).toBe(50);
  });

  it('should refresh data when refreshData is called', () => {
    authService.getCurrentUserId.and.returnValue('1');
    tripService.getTripByUserId.and.returnValue(of(mockTrips));

    component.refreshData();

    expect(tripService.getTripByUserId).toHaveBeenCalledWith(1);
  });

  it('should track by trip id', () => {
    const trip = mockTrips[0];
    expect(component.trackByTripId(0, trip)).toBe(trip.id);
  });

  it('should track by status', () => {
    const stat = { status: 'PENDING', count: 1, percentage: 50 };
    expect(component.trackByStatus(0, stat)).toBe(stat.status);
  });
});
