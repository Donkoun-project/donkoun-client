import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TripService } from '../../services/trip.service';
import { ITrip } from '../../models/ITrip';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from '../../../auth/services/service-auth.service';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.scss']
})
export class CreateTripComponent implements OnInit {
  tripForm: FormGroup;
  isSubmitted = false;
  isSuccess = false;
  isError = false;
  errorMsg = '';
  isEditMode = false;
  tripId: string | null = null;
  imageUrlPreview: string | null = null;
  selectedFile: File | null = null;
  availableUnits: string[] = []; // Available units from API
  availableTransportTypes: string[] = []; // Available transport types from API
  availableCurrencies: string[] = []; // Available currencies from API

  // Transport type mapping
  private readonly transportTypeMapping: { [key: string]: string } = {
    'Air': 'PLANE',
    'Maritime': 'BOAT',
    'Bus': 'BUS',
    'Car': 'CAR',
    'Train': 'TRAIN',
    'Truck': 'TRUCK'
  };

  private readonly reverseTransportTypeMapping: { [key: string]: string } = {
    'PLANE': 'Air',
    'BOAT': 'Maritime',
    'BUS': 'Bus',
    'CAR': 'Car',
    'TRAIN': 'Train',
    'TRUCK': 'Truck'
  };

  // Unit mapping to API expected values
  private readonly unitMapping: { [key: string]: string } = {
    'kg': 'KG',
    'g': 'GRAM',
    'tonne': 'KG', // Use KG for tonne
    'l': 'LITER',
    'piece': 'PIECE',
    'package': 'PACKAGE'
  };

  // Reverse mapping for editing (API to form)
  private readonly reverseUnitMapping: { [key: string]: string } = {
    'KG': 'kg',
    'GRAM': 'g',
    'LITER': 'l',
    'PIECE': 'piece',
    'PACKAGE': 'package'
  };

  constructor(
    private fb: FormBuilder,
    private tripsService: TripService,
    private route: ActivatedRoute,
    private router: Router,
    public sharedService: SharedService,
    private authService: AuthService
  ) {
    this.tripForm = this.fb.group({
      transportType: ['', Validators.required],
      transportCompany: ['', Validators.required],
      departureCountry: ['', Validators.required],
      departureCity: ['', Validators.required],
      arrivalCountry: ['', Validators.required],
      arrivalCity: ['', Validators.required],
      departureDate: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      unit: ['', Validators.required],
      availableQuantity: [null, [Validators.required, Validators.min(1)]],
      minReservation: [null, [Validators.required, Validators.min(1)]],
      reservationDeadline: ['', Validators.required],
      pickupLocation: ['', [Validators.required, Validators.minLength(5)]],
      deliveryLocation: ['', [Validators.required, Validators.minLength(5)]],
      currency: ['', Validators.required],
      pricePerKg: [null, [Validators.required, Validators.min(0)]],
      message: [''],
      imageUrl: ['']
    }, { validators: [this.minReservationInferiorValidator, this.dateValidationValidator] });
  }

  ngOnInit() {
    // Charger les unités, types de transport et devises disponibles
    this.loadAvailableUnits();
    this.loadAvailableTransportTypes();
    this.loadAvailableCurrencies();
    
    this.route.paramMap.subscribe(params => {
      this.tripId = params.get('id');
      if (this.tripId) {
        this.isEditMode = true;
        this.tripsService.getTripById(this.tripId).subscribe({
          next: (trip: ITrip | null | undefined) => {
            if (!trip) {
              this.isError = true;
              this.errorMsg = "Aucune donnée de trajet reçue.";
              this.tripForm.reset();
              this.imageUrlPreview = null;
              this.selectedFile = null;
              return;
            }
            this.tripForm.patchValue({
              transportType: this.reverseTransportTypeMapping[trip.transportType] || (trip.transportType ?? ''),
              transportCompany: trip.transportCompany ?? '',
              departureCountry: trip.departureCountry ?? '', // Peut être undefined dans la réponse API
              departureCity: trip.departureCity ?? '',
              arrivalCountry: trip.arrivalCountry ?? '', // Peut être undefined dans la réponse API
              arrivalCity: trip.arrivalCity ?? '',
              unit: this.reverseUnitMapping[trip.unit] || (trip.unit ?? 'kg'),
              departureDate: this.toInputDateTime(new Date(trip.departureDate)),
              arrivalDate: this.toInputDateTime(new Date(trip.arrivalDate)),
              availableQuantity: trip.availableQuantity ?? null,
              minReservation: trip.minReservation ?? null,
              reservationDeadline: this.toInputDateTime(new Date(trip.reservationDeadline)),
              pickupLocation: trip.pickupLocation ?? '',
              deliveryLocation: trip.deliveryLocation ?? '',
              currency: trip.currency ?? 'XOF',
              pricePerKg: trip.pricePerKg ?? null,
              message: trip.message ?? '',
              imageUrl: trip.imageUrl ?? '' // Peut être undefined dans la réponse API
            });
            this.imageUrlPreview = trip.imageUrl ?? '';
            this.selectedFile = null;
          },
          error: (err) => {
            this.isError = true;
            this.errorMsg = err?.error?.message || 'Erreur lors du chargement du trajet.';
            this.tripForm.reset();
            this.imageUrlPreview = null;
            this.selectedFile = null;
          }
        });
      } else {
        this.isEditMode = false;
        this.tripForm.reset();
        this.imageUrlPreview = null;
        this.selectedFile = null;
      }
    });

    this.tripForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (!this.selectedFile) {
        this.imageUrlPreview = url;
      }
    });
  }

  toInputDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return '';
    const pad = (n: number) => n < 10 ? '0' + n : n;
    // Format pour input[type="datetime-local"] : YYYY-MM-DDTHH:mm
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Charger les unités disponibles depuis l'API
  private loadAvailableUnits(): void {
    this.tripsService.getUnits().subscribe({
      next: (units) => {
        this.availableUnits = units;
        console.log('Unités chargées:', units);
        
        // Définir la première unité comme valeur par défaut si aucune n'est sélectionnée
        if (units.length > 0 && !this.tripForm.get('unit')?.value) {
          this.tripForm.patchValue({ unit: units[0] });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des unités:', err);
        // Fallback vers des unités par défaut
        this.availableUnits = ['KG', 'LBS', 'TON'];
        if (!this.tripForm.get('unit')?.value) {
          this.tripForm.patchValue({ unit: 'KG' });
        }
      }
    });
  }

  // Charger les types de transport disponibles depuis l'API
  private loadAvailableTransportTypes(): void {
    this.tripsService.getTransportTypes().subscribe({
      next: (transportTypes) => {
        this.availableTransportTypes = transportTypes;
        console.log('Types de transport chargés:', transportTypes);
        
        // Définir le premier type comme valeur par défaut si aucun n'est sélectionné
        if (transportTypes.length > 0 && !this.tripForm.get('transportType')?.value) {
          this.tripForm.patchValue({ transportType: transportTypes[0] });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de transport:', err);
        // Fallback vers des types par défaut
        this.availableTransportTypes = ['PLANE', 'TRAIN', 'BUS', 'CAR', 'BOAT', 'TRUCK'];
        if (!this.tripForm.get('transportType')?.value) {
          this.tripForm.patchValue({ transportType: 'PLANE' });
        }
      }
    });
  }

  // Charger les devises disponibles depuis l'API
  private loadAvailableCurrencies(): void {
    this.tripsService.getCurrencies().subscribe({
      next: (currencies) => {
        this.availableCurrencies = currencies;
        console.log('Devises chargées:', currencies);
        
        // Définir la première devise comme valeur par défaut si aucune n'est sélectionnée
        if (currencies.length > 0 && !this.tripForm.get('currency')?.value) {
          this.tripForm.patchValue({ currency: currencies[0] });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des devises:', err);
        // Fallback vers des devises par défaut
        this.availableCurrencies = ['EUR', 'USD', 'XOF'];
        if (!this.tripForm.get('currency')?.value) {
          this.tripForm.patchValue({ currency: 'EUR' });
        }
      }
    });
  }


  minReservationInferiorValidator(form: FormGroup) {
    const minReservation = form.get('minReservation')?.value;
    const availableQuantity = form.get('availableQuantity')?.value;
    if (minReservation == null || availableQuantity == null) return null;
    return Number(minReservation) < Number(availableQuantity) ? null : { minReservationNotInferior: true };
  }

  dateValidationValidator(form: FormGroup) {
    const departureDate = form.get('departureDate')?.value;
    const arrivalDate = form.get('arrivalDate')?.value;
    const reservationDeadline = form.get('reservationDeadline')?.value;

    if (!departureDate || !arrivalDate || !reservationDeadline) {
      return null; // Laissons les validators required gérer les champs vides
    }

    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);
    const deadline = new Date(reservationDeadline);

    // La date limite de réservation doit être avant la date de départ
    if (deadline >= departure) {
      return { reservationDeadlineAfterDeparture: true };
    }

    // La date d'arrivée doit être après la date de départ
    if (arrival <= departure) {
      return { arrivalBeforeDeparture: true };
    }

    return null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrlPreview = reader.result as string;
        // Ne pas stocker le fake path du fichier dans imageUrl !
        this.tripForm.get('imageUrl')?.setValue('');
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.imageUrlPreview = '';
      this.tripForm.get('imageUrl')?.setValue('');
    }
  }

onSubmit(): void {
  this.isSubmitted = true;
  this.isSuccess = false;
  this.isError = false;
  this.errorMsg = '';

  if (this.tripForm.invalid) {
    let errMsg = 'Veuillez remplir tous les champs obligatoires correctement.';
    if (this.tripForm.errors?.['minReservationNotInferior']) {
      errMsg = 'La valeur minimum de réservation doit être strictement inférieure à la quantité disponible.';
    } else if (this.tripForm.errors?.['reservationDeadlineAfterDeparture']) {
      errMsg = 'La date limite de réservation doit être avant la date de départ.';
    } else if (this.tripForm.errors?.['arrivalBeforeDeparture']) {
      errMsg = 'La date d\'arrivée doit être après la date de départ.';
    }
    this.sharedService.showAlert('warning', 'Formulaire incomplet', errMsg);
    return;
  }

  // Clone les valeurs du formulaire
  const formData = { ...this.tripForm.value };

  // Ajouter l'ID de l'utilisateur et le nom d'utilisateur
  const userId = this.authService.getCurrentUserId();
  const userName = localStorage.getItem('userFullName');
  
  if (userId) {
    formData.userId = parseInt(userId, 10); // Convertir en number
    formData.userName = userName || 'Utilisateur';
  } else {
    this.sharedService.showAlert('error', 'Erreur', 'Impossible de récupérer l\'ID utilisateur. Veuillez vous reconnecter.');
    return;
  }

  // Ajouter un statut par défaut
  formData.status = 'PENDING';

  // Convertir le type de transport
  if (formData.transportType && this.transportTypeMapping[formData.transportType]) {
    formData.transportType = this.transportTypeMapping[formData.transportType];
  }

  // Convertir l'unité
  if (formData.unit && this.unitMapping[formData.unit]) {
    formData.unit = this.unitMapping[formData.unit];
  }

  // Corrige les dates au bon format pour le backend (LocalDateTime sans Z et millisecondes)
  ['departureDate', 'arrivalDate', 'reservationDeadline'].forEach(field => {
    if (formData[field]) {
      const date = new Date(formData[field]);
      formData[field] = date.toISOString().replace('Z', '').split('.')[0];
    }
  });

  // Validation métier : la date limite de réservation doit être avant la date de départ
  const departureDate = new Date(formData.departureDate);
  const reservationDeadline = new Date(formData.reservationDeadline);
  
  if (reservationDeadline >= departureDate) {
    this.sharedService.showAlert('error', 'Erreur de validation', 'La date limite de réservation doit être avant la date de départ.');
    return;
  }

  // Validation métier : la date d'arrivée doit être après la date de départ
  const arrivalDate = new Date(formData.arrivalDate);
  if (arrivalDate <= departureDate) {
    this.sharedService.showAlert('error', 'Erreur de validation', 'La date d\'arrivée doit être après la date de départ.');
    return;
  }

  // Supprimer seulement les champs qui ne sont pas dans la réponse API
  delete formData.code;
  delete formData.imageUrl;
  // departureCountry et arrivalCountry sont maintenant obligatoires dans la réponse API

  if (this.isEditMode && this.tripId) {
    this.tripsService.updateTrip(this.tripId, formData).subscribe({
      next: (updated: ITrip | null | undefined) => {
        if (!updated) {
          this.isError = true;
          this.errorMsg = "Réponse inattendue du serveur lors de la modification.";
          this.sharedService.showAlert('error', 'Erreur', this.errorMsg);
          return;
        }
        this.isSuccess = true;
        this.isSubmitted = false;
        this.tripForm.patchValue({
          transportType: this.reverseTransportTypeMapping[updated.transportType] || (updated.transportType ?? ''),
          transportCompany: updated.transportCompany ?? '',
          departureCountry: updated.departureCountry ?? '', // Peut être undefined dans la réponse API
          departureCity: updated.departureCity ?? '',
          arrivalCountry: updated.arrivalCountry ?? '', // Peut être undefined dans la réponse API
          arrivalCity: updated.arrivalCity ?? '',
          unit: this.reverseUnitMapping[updated.unit] || (updated.unit ?? 'kg'),
          departureDate: this.toInputDateTime(new Date(updated.departureDate)),
          arrivalDate: this.toInputDateTime(new Date(updated.arrivalDate)),
          availableQuantity: updated.availableQuantity ?? null,
          minReservation: updated.minReservation ?? null,
          reservationDeadline: this.toInputDateTime(new Date(updated.reservationDeadline)),
          pickupLocation: updated.pickupLocation ?? '',
          deliveryLocation: updated.deliveryLocation ?? '',
          currency: updated.currency ?? 'XOF',
          pricePerKg: updated.pricePerKg ?? null,
          message: updated.message ?? '',
          imageUrl: updated.imageUrl ?? '' // Peut être undefined dans la réponse API
        });
        this.imageUrlPreview = updated.imageUrl ?? '';
        this.selectedFile = null;
        this.sharedService.showAlert('success', 'Succès', 'Trajet modifié avec succès !');
        setTimeout(() => this.router.navigate(['/trips/allpackage']), 1000);
      },
      error: (err) => {
        console.error('Erreur lors de la modification du trajet :', err);
        this.isError = true;
        this.errorMsg = err?.error?.message || err?.message || JSON.stringify(err?.error) || 'Erreur lors de la modification du trajet.';
        this.sharedService.showAlert('error', 'Erreur', this.errorMsg);
      }
    });
  } else {
    this.tripsService.createTrip(formData).subscribe({
      next: (created: ITrip | null | undefined) => {
        if (!created) {
          this.isError = true;
          this.errorMsg = "Réponse inattendue du serveur lors de la création.";
          this.sharedService.showAlert('error', 'Erreur', this.errorMsg);
          return;
        }
        this.isSuccess = true;
        this.tripForm.reset();
        this.isSubmitted = false;
        this.imageUrlPreview = created.imageUrl || null;
        this.selectedFile = null;
        this.sharedService.showAlert('success', 'Succès', 'Trajet créé avec succès !');
        setTimeout(() => this.router.navigate(['/trips/allpackage']), 1000);
      },
               error: (err) => {
                 this.isError = true;
        
        if (err.status === 403) {
          this.errorMsg = 'Accès refusé. Vérifiez que vous êtes bien connecté et que vous avez les permissions nécessaires.';
        } else if (err.status === 401) {
          this.errorMsg = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          this.errorMsg = err?.error?.message || err?.message || JSON.stringify(err?.error) || 'Erreur lors de la création du voyage.';
        }
        
        this.sharedService.showAlert('error', 'Erreur', this.errorMsg);
      }
    });
  }
}
}