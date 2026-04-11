export interface ITrip {
  id: number;
  code?: string; // Optionnel car pas dans la réponse API
  arrivalCity: string;
  arrivalDate: string; // ISO string
  departureCity: string;
  departureDate: string; // ISO string
  deliveryLocation: string;
  pickupLocation: string;
  arrivalCountry: string; // Maintenant présent dans la réponse API
  availableQuantity: number;
  minReservation: number;
  pricePerKg: number;
  currency: string;
  transportType: string;
  transportCompany: string;
  departureCountry: string; // Maintenant présent dans la réponse API
  status: 'PENDING' | 'NO_VALIDATE' | 'VALIDATE' | 'CLOSED_STATUS' | 'REJECTED_STATUS' | string;
  reservationDeadline: string; // ISO string
  message: string;
  imageUrl?: string; // Optionnel car pas dans la réponse API
  unit: string;
  userId: number;
  userName: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ApiResponse {
  success: boolean;
  data: {
    items: ITrip[];
    pagination: {
      hasNextPage: boolean;
      lastEvaluatedKey: string;
      totalScanned: number;
      limit: number;
    }
  }
}

export interface PaginatedTripsResponse {
  success: boolean;
  message: string;
  data: {
    content: ITrip[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        unsorted: boolean;
        sorted: boolean;
        empty: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    empty: boolean;
  };
  timestamp: string;
  status: number;
}

// Interface pour la réponse de récupération d'un trip individuel
export interface TripDetailResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number;
    userName: string;
    transportType: string;
    transportCompany: string;
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
    arrivalDate: string;
    unit: string;
    availableQuantity: number;
    minReservation: number;
    reservationDeadline: string;
    pickupLocation: string;
    deliveryLocation: string;
    currency: string;
    pricePerKg: number;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    // Ces champs peuvent être absents de la réponse API
    code?: string;
    departureCountry: string; // Maintenant présent dans la réponse API
    arrivalCountry: string; // Maintenant présent dans la réponse API
    imageUrl?: string;
  };
  error: {
    code: number;
    message: string;
    details: string;
  };
  timestamp: string;
  status: number;
}