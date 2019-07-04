import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StudentDashboardPage } from './student-dashboard.page';
import { ComponentsModule } from 'src/app/components/components.module';

import { ChartModule } from 'angular2-chartjs';

const routes: Routes = [
  {
    path: '',
    component: StudentDashboardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    ChartModule
  ],
  declarations: [
    StudentDashboardPage
  ],
  entryComponents: []
})
export class StudentDashboardPageModule {}
