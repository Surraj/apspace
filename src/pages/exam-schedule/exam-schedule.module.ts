import { NgModule } from '@angular/core';
import { ActionSheet } from '@ionic-native/action-sheet';
import { IonicPageModule } from 'ionic-angular';
import { TimetableProvider } from '../../providers';
import { ComponentsModule } from './../../components/components.module';
import { ExamSchedulePage } from './exam-schedule';

@NgModule({
  declarations: [
    ExamSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(ExamSchedulePage),
    ComponentsModule,
  ],
  providers: [ActionSheet, TimetableProvider],
})
export class ExamSchedulePageModule { }
