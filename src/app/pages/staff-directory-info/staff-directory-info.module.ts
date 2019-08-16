import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LecturerTimetableComponentModule } from '../../components/lecturer-timetable/lecturer-timetable.module';
import { StaffDirectoryInfoPage } from './staff-directory-info.page';
import { UrldecodePipe } from '../../pipes/urldecode.pipe';
import { ComponentsModule } from 'src/app/components/components.module';
import { AppLauncherService } from 'src/app/services';

const routes: Routes = [
  {
    path: ':id',
    component: StaffDirectoryInfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    LecturerTimetableComponentModule
  ],
  providers: [AppLauncherService],
  declarations: [StaffDirectoryInfoPage, UrldecodePipe]
})
export class StaffDirectoryInfoPageModule { }