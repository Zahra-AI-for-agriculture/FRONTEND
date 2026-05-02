import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TreatmentsComponent } from './treatments.component';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';

@NgModule({
  declarations: [TreatmentsComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule,
    RouterModule.forChild([{
      path: '', component: AppLayoutComponent,
      children: [{ path: '', component: TreatmentsComponent }]
    }])
  ]
})
export class TreatmentsModule {}
