import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';

import { LandingComponent } from './landing.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { PipelineComponent } from './components/pipeline/pipeline.component';
import { FeaturesComponent } from './components/features/features.component';
import { StatsComponent } from './components/stats/stats.component';
import { ProblemComponent } from './components/problem/problem.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';

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
    FooterComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule
  ]
})
export class LandingModule {}