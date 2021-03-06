import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { QRCodeModule } from 'angularx-qrcode';

import { AttendancePipe } from './attendance.pipe';
import { CharsPipe } from './chars.pipe';
import { MarkAttendancePage } from './mark-attendance.page';
import { SearchPipe } from './search.pipe';

const routes: Routes = [
  {
    path: '',
    component: MarkAttendancePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    QRCodeModule
  ],
  declarations: [MarkAttendancePage, CharsPipe, SearchPipe, AttendancePipe]
})
export class MarkAttendancePageModule { }
