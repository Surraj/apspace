import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { BusShuttleServicesPage } from './bus-shuttle-services.page';

const routes: Routes = [
  {
    path: '',
    component: BusShuttleServicesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BusShuttleServicesPage]
})
export class BusShuttleServicesPageModule { }
