import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard/auth.guard';
import { NotFoundComponent } from './features/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module')
      .then(m => m.HomeModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module')
      .then(m => m.DashboardModule)
  },
  { 
    path: 'trips',
    loadChildren: () => import('./features/trips/annonces.module')
      .then(m => m.AnnoncesModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module')
      .then(m => m.AuthModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }