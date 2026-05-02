import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NdviComponent } from './ndvi.component';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';

@NgModule({
  declarations: [NdviComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule,
    RouterModule.forChild([{
      path: '', component: AppLayoutComponent,
      children: [{ path: '', component: NdviComponent }]
    }])
  ]
})
export class NdviModule {}
