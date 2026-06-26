import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HowItsWorkComponent } from './how-its-work/how-its-work.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SharedModule } from "../../shared/shared.module";
import { HomeRoutingModule } from "./home-routing.module";
import { CallToActionComponent } from './call-to-action/call-to-action.component';
import { FaqComponent } from './faq/faq.component';



@NgModule({
  declarations: [
    HowItsWorkComponent,
    LandingPageComponent,
    CallToActionComponent,
    FaqComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    HomeRoutingModule
  ]
})
export class HomeModule { }
