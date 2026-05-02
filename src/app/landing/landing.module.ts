import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { PipelineComponent } from './components/pipeline/pipeline.component';
import { FeaturesComponent } from './components/features/features.component';
import { StatsComponent } from './components/stats/stats.component';
import { ProblemComponent } from './components/problem/problem.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';

const routes: Routes = [
  { path: '', component: LandingComponent }
];

@NgModule({
  declarations: [
    LandingComponent,
    NavbarComponent,
    HeroComponent,
    PipelineComponent,
    FeaturesComponent,
    StatsComponent,
    ProblemComponent,
    CtaComponent,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class LandingModule {}
