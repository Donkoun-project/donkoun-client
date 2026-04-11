import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ITrip } from '../../trips/models/ITrip';
import { TripService } from '../../trips/services/trip.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  trips : ITrip[];
  constructor(
    private tripService: TripService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Vérifier s'il y a un token d'activation dans l'URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        // Rediriger vers la page d'activation avec le token
        this.router.navigate(['/auth/activate'], { 
          queryParams: { token: params['token'] } 
        });
        return;
      }
    });
    
    this.getList();
  }

  getList(){
    this.tripService.list()
      .subscribe((result)=>{
        this.trips = result.data;
        console.log(this.trips);
      });
  }

  testNotification() {
    this.sharedService.showAlert('success', 'Test', 'Ceci est un test de notification qui devrait disparaître automatiquement après 5 secondes');
  }

}
