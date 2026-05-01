import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./landing/landing.module').then(m => m.LandingModule)
  },

  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'onboarding',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/onboarding/onboarding.module').then(m => m.OnboardingModule)
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'parcels',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/parcels/parcels.module').then(m => m.ParcelsModule)
  },

  {
    path: 'ai',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/ai/ai.module').then(m => m.AIModule)
  },

  {
    path: 'weather',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/weather/weather.module').then(m => m.WeatherModule)
  },

  {
    path: 'alerts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/alerts/alerts.module').then(m => m.AlertsModule)
  },

  {
    path: 'treatments',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/treatments/treatments.module').then(m => m.TreatmentsModule)
  },

  {
    path: 'market',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/market/market.module').then(m => m.MarketModule)
  },

  {
    path: 'knowledge',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/knowledge/knowledge.module').then(m => m.KnowledgeModule)
  },

  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/reports/reports.module').then(m => m.ReportsModule)
  },

  {
    path: 'community',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/community/community.module').then(m => m.CommunityModule)
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
