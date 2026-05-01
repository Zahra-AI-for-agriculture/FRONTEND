import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';
import { CommunityComponent } from './community/community.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: CommunityComponent }
    ]
  }
];

@NgModule({
  declarations: [CommunityComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class CommunityModule {}
