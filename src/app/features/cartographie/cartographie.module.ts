import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartographieRoutingModule } from './cartographie-routing.module';
import { CartographieComponent } from './cartographie/cartographie.component';


import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    CartographieComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    CartographieRoutingModule
  ]
})
export class CartographieModule { }
