import { Component, OnInit } from '@angular/core';
import { WsApiService } from 'src/app/services';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet/ngx';
import { Platform, ActionSheetController, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Attendance, Course, AttendanceLegend } from 'src/app/interfaces';
import { tap, finalize } from 'rxjs/operators';
import { ActionSheetButton } from '@ionic/core';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

  attendance$: Observable<Attendance[]>;
  course$: Observable<Course[]>;
  legend$: Observable<AttendanceLegend>;

  selectedIntake = '';
  average: number;
  averageColor = '';
  intakeLabels: any;

  isLoading: boolean;

  constructor(
    private ws: WsApiService,
    private actionSheet: ActionSheet,
    private plt: Platform,
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  showActionSheet() {
    if (this.plt.is('cordova')) {
      const options: ActionSheetOptions = {
        buttonLabels: this.intakeLabels,
        addCancelButtonWithLabel: 'Cancel',
      };

      this.actionSheet.show(options).then((buttonIndex: number) => {
        if (buttonIndex <= 1 + this.intakeLabels.length) {
          this.selectedIntake = this.intakeLabels[buttonIndex - 1] || '';
          this.attendance$ = this.getAttendance(this.selectedIntake);
        }
      });
    } else {
      const intakesButton = this.intakeLabels.map(intake => {
        return {
          text: intake,
          handler: () => {
            this.selectedIntake = intake;
            this.attendance$ = this.getAttendance(this.selectedIntake);
          },
        } as ActionSheetButton;
      });

      this.actionSheetCtrl.create({
        buttons: [...intakesButton, { text: 'Cancel', role: 'cancel' }],
      }).then(
        actionSheet => actionSheet.present()
      );
    }
  }

  getAttendance(intake: string, refresh?: boolean): Observable<Attendance[]> {
    this.average = -2;
    return (this.attendance$ = this.ws
      .get<Attendance[]>(`/student/attendance?intake=${intake}`, refresh)
      .pipe(
        tap(_ => this.getLegend(refresh)),
        tap(a => this.calculateAverage(a)),
    ));
  }

  getLegend(refresh: boolean) {
    this.legend$ = this.ws.get<AttendanceLegend>(
      '/student/attendance_legend',
      refresh,
    );
  }

  calculateAverage(aa: Attendance[] | null) {
    if (!Array.isArray(aa)) {
      return;
    }
    if (aa.length > 0) {
      const totalClasses = aa.reduce((a, b) => a + b.TOTAL_CLASSES, 0);
      const totalAbsentClasses = aa.reduce((a, b) => a + b.TOTAL_ABSENT, 0);
      const totalAttendedClasses = totalClasses - totalAbsentClasses;

      this.average = (totalAttendedClasses / totalClasses);
    } else {
      this.average = -1;
    }
  }

  doRefresh(event?) {
    this.course$ = this.ws.get<Course[]>('/student/courses', true).pipe(
      tap(c => (this.selectedIntake = c[0].INTAKE_CODE)),
      tap(_ => this.attendance$ = this.getAttendance(this.selectedIntake, true)),
      tap(
        c =>
          (this.intakeLabels = Array.from(
            new Set((c || []).map(t => t.INTAKE_CODE)),
          )),
      ),
      finalize(() => event && event.target.complete())
    );
  }
}