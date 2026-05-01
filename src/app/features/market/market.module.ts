import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';
import { MarketComponent } from './market/market.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: MarketComponent }
    ]
  }
];

@NgModule({
  declarations: [MarketComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class MarketModule {}
