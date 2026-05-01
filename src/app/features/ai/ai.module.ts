import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';
import { DiseaseComponent } from './disease/disease.component';
import { YieldComponent } from './yield/yield.component';
import { IrrigationComponent } from './irrigation/irrigation.component';
import { DroughtComponent } from './drought/drought.component';
import { PestComponent } from './pest/pest.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'disease',    component: DiseaseComponent    },
      { path: 'yield',      component: YieldComponent      },
      { path: 'irrigation', component: IrrigationComponent },
      { path: 'drought',    component: DroughtComponent    },
      { path: 'pest',       component: PestComponent       },
      { path: 'diagnosis',  component: DiagnosisComponent  },
    ]
  }
];

@NgModule({
  declarations: [
    DiseaseComponent,
    YieldComponent,
    IrrigationComponent,
    DroughtComponent,
    PestComponent,
    DiagnosisComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class AIModule {}
