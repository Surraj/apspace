import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core';

import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import {
  ClassificationLegend, Course, CourseDetails, DeterminationLegend,
  InterimLegend, MPULegend, StudentPhoto, StudentProfile, Subcourse
} from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage {
  course$: Observable<Course[]>;
  results$: Observable<{ semester: string; value: Subcourse[] }[]>;
  courseDetail$: Observable<CourseDetails>;
  interimLegend$: Observable<InterimLegend[]>;
  mpuLegend$: Observable<MPULegend[]>;
  determinationLegend$: Observable<DeterminationLegend[]>;
  classificationLegend$: Observable<ClassificationLegend[]>;
  studentProfile: StudentProfile;
  photo$: Observable<StudentPhoto>;

  type = 'bar';
  data: any;
  selectedIntake: string;
  intakeLabels: any;
  block = true;
  message: string;

  options = {
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      ],
    },
  };

  constructor(
    private ws: WsApiService,
    private actionSheetCtrl: ActionSheetController,
    // private navCtrl: NavController,
    private iab: InAppBrowser
  ) { }

  ionViewDidEnter() {
    this.doRefresh();
  }

  doRefresh(refresher?: any) {
    this.photo$ = this.ws.get<StudentPhoto>('/student/photo', refresher);
    this.ws.get<StudentProfile>('/student/profile', refresher).subscribe(p => {
      this.studentProfile = p;
      if (p.BLOCK) {
        this.block = true;
        this.course$ = this.ws.get<Course[]>('/student/courses', refresher).pipe(
          tap(i => this.selectedIntake = i[0].INTAKE_CODE),
          tap(i => this.results$ = this.getResults(i[0].INTAKE_CODE, refresher)),
          tap(i => this.getCourseDetails(i[0].INTAKE_CODE, refresher)),
          tap(i => this.getMpuLegend(i[0].INTAKE_CODE, refresher)),
          tap(i => this.getDeterminationLegend(i[0].INTAKE_CODE, refresher)),
          tap(i => this.getClassificatinLegend(i[0].INTAKE_CODE, refresher)),
          tap(i => this.intakeLabels = Array.from(new Set((i || []).map(t => t.INTAKE_CODE)))),
          finalize(() => refresher && refresher.target.complete())
        );
      } else {
        this.block = false;
        this.message = p.MESSAGE;
      }
    });
  }


  showActionSheet() {
    const intakesButton = this.intakeLabels.map(intake => {
      return {
        text: intake, handler: () => {
          this.selectedIntake = intake;
          this.results$ = this.getResults(this.selectedIntake, true);
          this.getCourseDetails(this.selectedIntake, true);
        },
      } as ActionSheetButton;
    });
    this.actionSheetCtrl.create({
      buttons: [...intakesButton, { text: 'Cancel', role: 'cancel' }],
    }).then(
      actionSheet => actionSheet.present()
    );
  }

  getResults(intake: string, refresh: boolean = false): Observable<{ semester: string; value: Subcourse[] }[]> {
    const url = `/student/subcourses?intake=${intake}`;
    return this.results$ = this.ws.get<Subcourse>(url, refresh).pipe(
      tap(results => this.getInterimLegend(intake, results, refresh)),
      map(r => this.sortResult(r))
    );
  }

  sortResult(results: any) {
    const resultBySemester = results
      .reduce((previous: any, current: any) => {
        if (!previous[current.SEMESTER]) {
          previous[current.SEMESTER] = [current];
        } else {
          previous[current.SEMESTER].push(current);
        }
        return previous;
      }, {});
    return Object.keys(resultBySemester).map(semester => ({ semester, value: resultBySemester[semester] }));
  }

  openSurveyPage(_moduleCode: string) {
    // const navigationExtras: NavigationExtras = {
    //   state: { moduleCode: 'CT108-3-2-IOS-L-UC2F1808MBT-SE', intakeCode: 'UC2F1808IT(MBT)' }
    // };
    // this.navCtrl.navigateForward(['/student-survey'], navigationExtras);

    // TEMP: SEND USER TO CURRENT SYSTEM
    this.iab.create('https://webapps.apiit.edu.my/appraisal/index.jsp', '_blank', 'location=true');
  }


  getCourseDetails(intake: string, refresh: boolean): Observable<CourseDetails> {
    const url = `/student/sub_and_course_details?intake=${intake}`;
    return this.courseDetail$ = this.ws.get<CourseDetails>(url, refresh);
  }

  getInterimLegend(intake: string, results: any, refresh: boolean) {
    const url = `/student/interim_legend?intake=${intake}`;
    this.interimLegend$ = this.ws.get<InterimLegend[]>(url, refresh).pipe(
      tap(res => {
        const gradeList = Array.from(new Set((res || []).map(grade => grade.GRADE)));
        this.sortGrades(results, gradeList);
      }),
    );
  }

  getMpuLegend(intake: string, refresh: boolean) {
    const url = `/student/mpu_legend?intake=${intake}`;
    this.mpuLegend$ = this.ws.get<MPULegend[]>(url, refresh);
  }

  getDeterminationLegend(intake: string, refresh: boolean) {
    const url = `/student/determination_legend?intake=${intake}`;
    this.determinationLegend$ = this.ws.get<DeterminationLegend[]>(url, refresh);
  }

  getClassificatinLegend(intake: string, refresh: boolean) {
    const url = `/student/classification_legend?intake=${intake}`;
    this.classificationLegend$ = this.ws.get<ClassificationLegend[]>(url, refresh);
  }

  sortGrades(results: any, gradeList: any) {
    const gradeCounter: { [index: string]: number } = results
      .map(r => r.GRADE)
      .reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});

    const studentResults = Object.keys(gradeCounter)
      .filter(g => g.length <= 2)
      .sort((a, b) => gradeList.indexOf(a) - gradeList.indexOf(b))
      .map(k => ({ grade: k, count: gradeCounter[k] }));
    const grades = studentResults.map(r => r.grade);
    const count = studentResults.map(r => r.count);
    this.showBarChart(grades, count);
  }

  showBarChart(listItems: string[], listCount: number[]) {
    const randomColor = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(54,72,87,0.7)',
      'rgba(247,89,64,0.7)',
      'rgba(61,199,190,0.7)',
    ];

    const randomBorderColor = [
      'rgba(255,99,132,1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(54,72,87,1)',
      'rgba(247,89,64,1)',
      'rgba(61,199,190,1)',
    ];

    this.data = {
      datasets: [
        {
          backgroundColor: randomColor,
          borderColor: randomBorderColor,
          borderWidth: 2,
          data: listCount,
        },
      ],
      labels: listItems,
    };
  }

  trackByFn(index: number) {
    return index;
  }

}
