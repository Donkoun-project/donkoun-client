import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {DonkounHeaderComponent} from "./layouts/header/donkoun-header.component";
import {DonkounFooterComponent} from "./layouts/footer/donkoun-footer.component";
import { DonkounBannerComponent } from './layouts/banner/donkoun-banner.component';
import { ParcelsComponent } from './components/trips/parcels.component';
import { DateFormatPipe } from './pipes/date-format/date-format.pipe';
import {CommonModule} from "@angular/common";
import { CapitalizePipe } from './pipes/capitalize/capitalize.pipe';
import { NotificationComponent } from './components/notification/notification.component';

@NgModule({
  declarations: [
    DonkounHeaderComponent,
    DonkounFooterComponent,
    DonkounBannerComponent,
    ParcelsComponent,
    DateFormatPipe,
    CapitalizePipe,
    NotificationComponent,
  ],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  exports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DonkounFooterComponent,
    DonkounBannerComponent,
    ParcelsComponent,
    DateFormatPipe,
    CapitalizePipe,
    DonkounHeaderComponent,
    NotificationComponent
  ]
})
export class SharedModule { }
