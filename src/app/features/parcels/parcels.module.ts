import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';
import { ParcelsListComponent } from './parcels-list/parcels-list.component';
import { ParcelDetailComponent } from './parcel-detail/parcel-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '',    component: ParcelsListComponent  },
      { path: ':id', component: ParcelDetailComponent },
    ]
  }
];

@NgModule({
  declarations: [
    ParcelsListComponent,
    ParcelDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class ParcelsModule {}
