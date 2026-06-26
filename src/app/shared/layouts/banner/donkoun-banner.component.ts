import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-donkoun-banner',
  templateUrl: './donkoun-banner.component.html',
  styleUrls: ['./donkoun-banner.component.scss']
})
export class DonkounBannerComponent implements OnInit {
  filterForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.filterForm = this.fb.group({ origin: [''], destination: [''] });
  }

  ngOnInit(): void {}

  onSearch(): void {
    const origin = this.filterForm.value.origin?.trim();
    const destination = this.filterForm.value.destination?.trim();
    const queryParams: any = {};
    if (origin) queryParams.origin = origin;
    if (destination) queryParams.destination = destination;
    this.router.navigate(['/trips'], { queryParams });
  }
}
