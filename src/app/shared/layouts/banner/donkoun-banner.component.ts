import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/service-auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-donkoun-banner',
  templateUrl: './donkoun-banner.component.html',
  styleUrls: ['./donkoun-banner.component.scss']
})
export class DonkounBannerComponent implements OnInit {
  filterForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      origin: [''],
      destination: ['']
    });
  }

  ngOnInit(): void {}

  onSendParcel(): void {
    if (this.authService.tokenService.isAuthenticated()) {
      this.router.navigate(['/trips/allpackage']);
    } else {
      localStorage.setItem('redirectAfterLogin', '/trips/allpackage');
      this.router.navigate(['/auth/login']);
    }
  }

  onBecomeTransporter(): void {
    if (this.authService.tokenService.isAuthenticated()) {
      this.router.navigate(['/trips/create']);
    } else {
      localStorage.setItem('redirectAfterLogin', '/trips/create');
      this.router.navigate(['/auth/login']);
    }
  }

  onSearch(): void {
    const origin = this.filterForm.value.origin?.trim();
    const destination = this.filterForm.value.destination?.trim();
    // On construit les query params pour la redirection
    const queryParams: any = {};
    if (origin) queryParams.origin = origin;
    if (destination) queryParams.destination = destination;
    this.router.navigate(['/trips'], { queryParams });
  }
}
