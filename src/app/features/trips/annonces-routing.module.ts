import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from "./components/list/list.component";
import { CreateTripComponent } from './components/create/create-trip.component';
import { AllPackageComponent } from './components/all-package/all-package.component';
import { AuthGuard } from '../../shared/guard/auth.guard';
import { MonProfilComponent } from './components/mon-profil/mon-profil.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ListComponent },
      { path: 'create', canActivate: [AuthGuard], component: CreateTripComponent },
      { path: 'allpackage', canActivate: [AuthGuard], component: AllPackageComponent },
      { path: 'monProfil', canActivate: [AuthGuard], component: MonProfilComponent },
      { path: 'edit/:id', canActivate: [AuthGuard], component: CreateTripComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnoncesRoutingModule { }