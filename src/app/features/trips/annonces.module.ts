import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnoncesRoutingModule } from './annonces-routing.module';
import { ListComponent } from './components/list/list.component';
import {SharedModule} from "../../shared/shared.module";
import { FilterComponent } from './components/filter/filter.component';
import { ParcelDetailComponent } from './components/package-detail/parcel-detail.component';
import { CreateTripComponent } from './components/create/create-trip.component';
import { AllPackageComponent } from './components/all-package/all-package.component';
import { MonProfilComponent } from './components/mon-profil/mon-profil.component';


@NgModule({
  declarations: [
    ListComponent,
    FilterComponent,
    ParcelDetailComponent,
    CreateTripComponent,
    AllPackageComponent,
    MonProfilComponent,
  ],
  imports: [
    CommonModule,
    AnnoncesRoutingModule,
    SharedModule
  ]
})
export class AnnoncesModule { }
