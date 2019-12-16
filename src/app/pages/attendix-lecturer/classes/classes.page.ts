import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSelect, ModalController } from '@ionic/angular';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchModalComponent } from '../../../components/search-modal/search-modal.component';
import { Classcode, StaffProfile, StudentTimetable } from '../../../interfaces';
import { StudentTimetableService, WsApiService } from '../../../services';

type Schedule = Pick<Classcode, 'CLASS_CODE'>
  & Pick<StudentTimetable, 'DATESTAMP_ISO' | 'TIME_FROM' | 'TIME_TO'>
  & { TYPE: string; };

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss']
})
export class ClassesPage implements AfterViewInit, OnInit {

  auto = true; // manual mode to record mismatched data

  /* computed */
  classcodes: string[];
  schedules: Schedule[];
  schedulesByClasscode: Schedule[];
  schedulesByClasscodeDate: Schedule[];

  dates: string[];
  startTimes: string[];
  endTimes: string[];
  classTypes = ['Lecture', 'Tutorial', 'Lab'];

  /* selected */
  classcode: string;
  date: string;  // 2019-01-01
  startTime: string;
  endTime: string;
  classType: string;

  /* manual */
  manualClasscodes: string[];
  manualDates: string[];
  manualStartTimes = [
    '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM',
    '09:30 AM', '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM',
    '12:30 PM', '12:45 PM', '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM', '03:00 PM', '03:15 PM',
    '03:30 PM', '03:45 PM', '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM',
    '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM', '06:00 PM', '06:15 PM',
    '06:30 PM', '06:45 PM', '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
    '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM', '09:00 PM', '09:15 PM',
    '09:30 PM', '09:45 PM', '10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM',
    '10:00 PM', '11:15 PM', '11:30 PM', '11:45 PM', '11:00 PM', '11:15 PM',
    '11:30 PM', '11:45 PM'];
  manualEndTimes: string[];

  manualClasscode: string;
  manualDate: string;
  manualStartTime: string;
  manualEndTime: string;
  manualClassType: string;

  @ViewChild('classcodeInput', { static: false }) classcodeInput: IonSelect;

  constructor(
    private tt: StudentTimetableService,
    private ws: WsApiService,
    private router: Router,
    public modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    const d = new Date();
    this.date = this.isoDate(d);
    const nowMins = d.getHours() * 60 + d.getMinutes();

    const timetables$ = forkJoin([this.ws.get<StaffProfile[]>('/staff/profile', { caching: 'cache-only' }), this.tt.get()]).pipe(
      map(([profile, timetables]) => timetables.filter(timetable =>
        profile[0].ID === timetable.SAMACCOUNTNAME
        && this.parseTime(timetable.TIME_FROM) <= nowMins)),
    );
    const classcodes$ = this.ws.get<Classcode[]>('/attendix/classcodes');

    forkJoin([timetables$, classcodes$]).subscribe(([timetables, classcodes]) => {
      // left join on classcodes
      const joined = timetables.map(timetable => ({
        ...classcodes.find(classcode => {
          // Classcode BM006-3-2-CRI-L-UC2F1805CGD-CS-DA-IS-IT-BIS-CC-DBA-ISS-MBT-NC-MMT-SE-HLH
          // Take only BM006-3-2-CRI-L- (+3 extra characters for L, T1, T2)
          const len = classcode.SUBJECT_CODE.length;
          return classcode.CLASS_CODE.slice(0, len + 3) === timetable.MODID.slice(0, len + 3)
            && classcode.COURSE_CODE_ALIAS === timetable.INTAKE;
        }),
        ...timetable
      }));

      // lay out base schedules for guessing
      this.schedules = joined.map(data => {
        let guessClassType: string | null;
        if (data.SUBJECT_CODE) {
          const len = data.SUBJECT_CODE.length;
          if (data.CLASS_CODE[len + 1] === 'T') {
            guessClassType = 'Tutorial';
          } else if (data.CLASS_CODE[len + 2] === 'A') {
            guessClassType = 'Lab';
          } else if (data.CLASS_CODE[len + 1] === 'L') {
            guessClassType = 'Lecture';
          }
        }
        return {
          CLASS_CODE: data.CLASS_CODE,
          DATESTAMP_ISO: data.DATESTAMP_ISO,
          TIME_FROM: data.TIME_FROM,
          TIME_TO: data.TIME_TO,
          TYPE: guessClassType,
        };
      });
      this.guessWork(joined, nowMins);

      // append existing timetable after guess work
      const mapped = classcodes.map(({ CLASS_CODE, CLASSES }) =>
        CLASSES.map(({ DATE, TIME_FROM, TIME_TO, TYPE }) =>
          ({ DATESTAMP_ISO: DATE, TIME_FROM, TIME_TO, CLASS_CODE, TYPE })));
      this.schedules = this.schedules.concat.apply([], mapped);
      this.classcodes = [...new Set(this.schedules.map(schedule => schedule.CLASS_CODE).filter(Boolean))].sort();
      console.log('filtered', this.schedules, this.classcodes);

      // manual classcodes
      this.manualClasscodes = [...new Set(classcodes.map(classcode => classcode.CLASS_CODE))];
      this.manualDates = [...Array(30).keys()]
        .map(n => new Date(new Date().setDate(new Date().getDate() - n)).toISOString().slice(0, 10));
    });
  }

  ngAfterViewInit() {
    // prevent ion-select click bubbling
    (this.classcodeInput as any).el.addEventListener('click', (ev: MouseEvent) => {
      ev.stopPropagation();
      this.chooseClasscode();
    }, true);
  }

  /** Guess the current classcode based on timetable. */
  guessWork(schedules: (Classcode & StudentTimetable)[], nowMins: number) {
    const d = new Date();
    const date = this.isoDate(d);

    const guessSchedules = schedules.filter(schedule => {
      return schedule.DATESTAMP_ISO === date
        && schedule.CLASS_CODE // CLASS_CODE may not be matched
        && this.between(schedule.TIME_FROM, schedule.TIME_TO, nowMins);
    });

    if (new Set(guessSchedules.map(schedule => schedule.MODID)).size !== 1) {
      console.warn('fail to auto complete', guessSchedules);
      return;
    }
    const currentSchedule = guessSchedules[0];

    this.changeClasscode(this.classcode = currentSchedule.CLASS_CODE, false);
    this.changeDate(this.date = date, false);
    this.changeStartTime(this.startTime = currentSchedule.TIME_FROM);
    console.log('currentSchedule', currentSchedule);
  }

  /** Parse time into minutes of day in 12:59 PM format. */
  parseTime(time: string): number {
    return ((time.slice(-2) === 'PM' ? 12 : 0) + +time.slice(0, 2) % 12) * 60 + +time.slice(3, 5);
  }

  /** Identify if time is between start and end time in 12:59 PM format. */
  between(start: string, end: string, nowMins: number): boolean {
    return this.parseTime(start) <= nowMins && nowMins <= this.parseTime(end);
  }

  /** Display search modal to choose classcode. */
  async chooseClasscode() {
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items: this.auto ? this.classcodes : this.manualClasscodes,
        defaultItems: this.auto ? this.classcodes : this.manualClasscodes,
        notFound: 'No classcode selected'
      }
    });
    await modal.present();
    const { data: { item: classcode } = { item: this.classcode } } = await modal.onDidDismiss();
    if (this.auto) {
      if (classcode !== null && classcode !== this.classcode) {
        this.changeClasscode(this.classcode = classcode);
      }
    } else {
      this.manualClasscode = classcode;
    }
  }

  /** Change classcode, auto select class type. */
  changeClasscode(classcode: string, propagate = true) {
    this.schedulesByClasscode = this.schedules.filter(schedule => schedule.CLASS_CODE === classcode);
    this.dates = [...new Set(this.schedulesByClasscode.map(schedule => schedule.DATESTAMP_ISO))].sort();
    this.date = '';

    if (propagate && this.dates.length === 1) {
      this.changeDate(this.date = this.dates[0]);
    }
  }

  /** Change date. */
  changeDate(date: string, propagate = true) {
    this.schedulesByClasscodeDate = this.schedulesByClasscode.filter(schedule => schedule.DATESTAMP_ISO === date);
    this.startTimes = [...new Set(this.schedulesByClasscodeDate.map(schedule => schedule.TIME_FROM))].sort();
    this.endTimes = [...new Set(this.schedulesByClasscodeDate.map(schedule => schedule.TIME_TO))].sort();
    this.startTime = '';
    this.endTime = '';

    if (propagate && this.startTimes.length === 1) {
      this.changeStartTime(this.startTime = this.startTimes[0]);
    }
  }

  /** Swap auto and manual mode. */
  swapMode() {
    this.auto = !this.auto;
    (this.classcodeInput as any).el.addEventListener('click', (ev: MouseEvent) => {
      ev.stopPropagation();
      this.chooseClasscode();
    }, true);
  }

  /** Change start time, find matching end time. */
  changeStartTime(startTime: string) {
    if (this.auto) {
      const schedule = this.schedulesByClasscodeDate.find(s => s.TIME_FROM === startTime);
      this.endTime = schedule.TIME_TO;
      this.classType = schedule.TYPE;
    } else {
      this.manualEndTimes = this.manualStartTimes.slice(this.manualStartTimes.indexOf(startTime) + 1);
    }
  }

  /** Mark attendance, send feedback if necessary. */
  async mark() {
    if (!this.auto) {
      const body = {
        classcodes: this.classcodes,
        schedules: this.schedules,
        schedulesByClasscode: this.schedulesByClasscode,
        schedulesByClasscodeDate: this.schedulesByClasscodeDate,

        dates: this.dates,
        startTimes: this.startTimes,
        endTimes: this.endTimes,

        manualClasscodes: this.manualClasscodes,
        manualDates: this.manualDates,
        manualStartTimes: this.manualStartTimes,
        manualEndTimes: this.manualEndTimes,

        manualClasscode: this.manualClasscode,
        manualDate: this.manualDate,
        manualStartTime: this.manualStartTime,
        manualEndTime: this.manualEndTime,
        manualClassType: this.manualClassType,
      };
      await this.ws.post('/attendix/selection', { body }).toPromise();
    }
    this.router.navigate(['/attendix/mark-attendance', {
      classcode: this.auto ? this.classcode : this.manualClasscode,
      date: this.auto ? this.date : this.manualDate,
      startTime: this.auto ? this.startTime : this.manualStartTime,
      endTime: this.auto ? this.endTime : this.manualEndTime,
      classType: this.auto ? this.classType : this.manualClassType,
    }]);
  }

  /** Helper function to get ISO 8601 Date from Date. */
  private isoDate(d: Date): string {
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }

}
