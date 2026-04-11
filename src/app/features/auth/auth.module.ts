import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ActivationComponent } from './activation/activation.component';
import { ActivationLinkComponent } from './activation/activation-link.component';
import {SharedModule} from "../../shared/shared.module";
import {AuthRoutingModule} from "./auth-routing.module";
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ActivationComponent,
    ActivationLinkComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports:[
    AuthRoutingModule
  ]
})
export class AuthModule { }
