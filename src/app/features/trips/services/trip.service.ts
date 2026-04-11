import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { ApiResponse, ITrip, PaginatedTripsResponse, TripDetailResponse } from '../models/ITrip';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private apiUrl = `${environment.baseUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  // Liste tous les trips avec pagination selon la documentation API
  list(params: any = {}): Observable<{ data: ITrip[], pagination: any }> {
    let httpParams = new HttpParams();
    
    // Paramètres de pagination selon la documentation API
    const page = params.page || 0;
    const size = params.size || 10;
    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || 'DESC';
    
    httpParams = httpParams.set('page', page.toString());
    httpParams = httpParams.set('size', size.toString());
    httpParams = httpParams.set('sortBy', sortBy);
    httpParams = httpParams.set('sortDirection', sortDirection);
    
    // Ajouter d'autres paramètres si présents
    Object.keys(params).forEach(key => {
      if (key !== 'page' && key !== 'size' && key !== 'sortBy' && key !== 'sortDirection' && 
          params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<PaginatedTripsResponse>(`${this.apiUrl}/trips`, { 
      params: httpParams,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            data: response.data.content || [],
            pagination: {
              hasNextPage: !response.data.last,
              lastEvaluatedKey: response.data.number.toString(),
              totalScanned: response.data.totalElements,
              limit: response.data.size,
              currentPage: response.data.number,
              totalPages: response.data.totalPages,
              totalElements: response.data.totalElements
            }
          };
        } else {
          return {
            data: [],
            pagination: null
          };
        }
      })
    );
  }

  getTripByUserId(userId: number): Observable<ITrip[]> {
    // Utiliser l'endpoint spécifique pour récupérer les trips d'un utilisateur
    return this.http.get<{ success: boolean, message: string, data: ITrip[] }>(`${this.apiUrl}/trips/users/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }


  getTripById(tripId: string): Observable<ITrip> {
    return this.http.get<TripDetailResponse>(`${this.apiUrl}/trips/${tripId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            id: response.data.id,
            code: response.data.code,
            arrivalCity: response.data.arrivalCity,
            arrivalDate: response.data.arrivalDate,
            departureCity: response.data.departureCity,
            departureDate: response.data.departureDate,
            deliveryLocation: response.data.deliveryLocation,
            pickupLocation: response.data.pickupLocation,
            arrivalCountry: response.data.arrivalCountry,
            availableQuantity: response.data.availableQuantity,
            minReservation: response.data.minReservation,
            pricePerKg: response.data.pricePerKg,
            currency: response.data.currency,
            transportType: response.data.transportType,
            transportCompany: response.data.transportCompany,
            departureCountry: response.data.departureCountry,
            status: response.data.status,
            reservationDeadline: response.data.reservationDeadline,
            message: response.data.message,
            imageUrl: response.data.imageUrl,
            unit: response.data.unit,
            userId: response.data.userId,
            userName: response.data.userName,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt
          };
        } else {
          throw new Error('Trajet non trouvé ou réponse invalide');
        }
      })
    );
  }

  createTrip(trip: ITrip): Observable<ITrip> {
    return this.http.post<{ 
      success: boolean, 
      message: string, 
      data: ITrip,
      error: { code: number, message: string, details: string },
      timestamp: string,
      status: number
    }>(`${this.apiUrl}/trips`, trip, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Erreur lors de la création du trip');
        }
      })
    );
  }

  updateTrip(tripId: string, trip: Partial<ITrip>): Observable<ITrip> {
    // Convertir les données du trip en paramètres de requête
    let params = new HttpParams();
    
    // Ajouter tous les champs du trip comme paramètres de requête
    Object.keys(trip).forEach(key => {
      const value = (trip as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.put<{ success: boolean, data: ITrip }>(
      `${this.apiUrl}/trips/${tripId}`,
      null, // Pas de body, les données sont dans les paramètres
      { 
        headers: this.getAuthHeaders(),
        params: params
      }
    ).pipe(
      map(response => response.data)
    );
  }

  searchTrips(filters: any = {}): Observable<{ data: ITrip[] }> {
    let params = new HttpParams();
    if (filters.departure)     params = params.set('departure', filters.departure);
    if (filters.destination)   params = params.set('destination', filters.destination);
    if (filters.dateFrom)      params = params.set('dateFrom', filters.dateFrom + 'T00:00:00');
    if (filters.dateTo)        params = params.set('dateTo', filters.dateTo + 'T23:59:59');
    if (filters.transportType) params = params.set('transportType', filters.transportType.toUpperCase());
    if (filters.company)       params = params.set('company', filters.company);

    return this.http.get<{ success: boolean; message: string; data: ITrip[] }>(
      `${this.apiUrl}/trips/filter`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      map(response => ({ data: response.success && response.data ? response.data : [] }))
    );
  }

  deleteTrip(tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trips/${tripId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Récupérer les unités de mesure disponibles
  getUnits(): Observable<string[]> {
    return this.http.get<{ success: boolean, message: string, data: string[] }>(`${this.apiUrl}/settings/units`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }

  // Récupérer les types de transport disponibles
  getTransportTypes(): Observable<string[]> {
    return this.http.get<{ success: boolean, message: string, data: string[] }>(`${this.apiUrl}/settings/transports`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }

  // Récupérer les devises disponibles
  getCurrencies(): Observable<string[]> {
    return this.http.get<{ success: boolean, message: string, data: string[] }>(`${this.apiUrl}/settings/currencies`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }
}