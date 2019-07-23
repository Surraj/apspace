import { Component } from "@angular/core";
import { IonicPage, MenuController, ToastController, AlertController, NavController } from "ionic-angular";
import { Observable } from "rxjs";
import { AplcClassDescription, AplcStudentBehaviour } from "../../../interfaces";
import { WsApiProvider } from "../../../providers";

@IonicPage()
@Component({
  selector: "page-update-progress-report",
  templateUrl: "update-progress-report.html",
})
export class UpdateProgressReportPage {
  // TEMP VARIABLES 
  stagingUrl = 'https://kh1rvo4ilf.execute-api.ap-southeast-1.amazonaws.com/dev/aplc';

  objectKeys = Object.keys; // USED FOR GROUPING TRANSACTIONS PER MONTH
  scores = [1, 2, 3];

  // NGMODEL VARIABLES
  subjectCode: string;
  courseCode: string;
  classCode: string;
  searchBy: string;


  // LOADING VARIABLES
  showLoading = false;
  showSubjectLoading = false;
  showClassCodeLoading = false;
  showCoursesLoading = false;
  numOfSkeletons = new Array(3);

  // EMPTY DATA VARIABLES
  showNoCoursesMessage = false;
  showNoSubjectsMessage = false;

  // LISTS
  subjects: string[];
  courses: string[];
  classes: [{
    CLASS_CODE: string,
    LECTURER_NAME: string
  }];

  // OBSERAVBLES
  classDescription$: Observable<AplcClassDescription[]>;
  studentsBehaviour$: Observable<AplcStudentBehaviour[]>;
  descriptionLegend$: Observable<any>;
  scoreLegend$: Observable<any>;

  constructor(public navCtrl: NavController, public menu: MenuController, private ws: WsApiProvider, private toastCtrl: ToastController, public alertCtrl: AlertController) { }

  ionViewDidLoad() {
    this.getScoreLegend();
    this.getDescriptionLegend();
  }

  // TOGGLE THE MENU
  toggleFilterMenu() {
    this.menu.toggle();
  }

  onSearchByChanged() {
    if (this.searchBy === 'subject') {
      this.getSubjects();
      this.courseCode = '';
    }
    else if (this.searchBy === 'course') {
      this.getCourses();
      this.subjectCode = '';
    }
    this.classCode = '';
  }

  getClassCodesList(getBy: string) {
    this.getClasses(getBy);
  }

  onClassCodeChanged() {
    this.getClassDescription(this.classCode);
    this.getStudentsBehaviour(this.classCode);
    this.toggleFilterMenu();
  }

  getSubjects() {
    this.showSubjectLoading = true;
    this.ws.get<any>(`/subjects`, true, { url: this.stagingUrl }).subscribe(
      res => this.subjects = res,
      _ => { },
      () => {
        if(this.subjects.length === 0){
          this.showNoSubjectsMessage = true;
        }
        this.showSubjectLoading = false
      }
    );
  }

  getCourses() {
    this.showCoursesLoading = true;
    this.ws.get<any>(`/courses`, true, { url: this.stagingUrl }).subscribe(
      res => this.courses = res,
      _ => { },
      () => {
        if(this.courses.length === 0){
          this.showNoCoursesMessage = true;
        }
        this.showCoursesLoading = false
      }
    );
  }

  getClasses(getBy: string) {
    this.showClassCodeLoading = true;
    if (getBy === 'subject') {
      this.ws.get<any>(`/classes?subject_code=${this.subjectCode}`, true, { url: this.stagingUrl }).subscribe(
        res => this.classes = res,
        _ => { },
        () => this.showClassCodeLoading = false
      );
    } else if (getBy === 'course') {
      this.ws.get<any>(`/classes?course_code=${this.courseCode}`, true, { url: this.stagingUrl }).subscribe(
        res => this.classes = res,
        _ => { },
        () => this.showClassCodeLoading = false
      );
    }
  }

  getClassDescription(classCode: string) {
    this.classDescription$ = this.ws.get<AplcClassDescription[]>(`/class-description?class_code=${classCode}`, true, { url: this.stagingUrl });
  }

  getStudentsBehaviour(classCode: string) {
    this.studentsBehaviour$ = this.ws.get<AplcStudentBehaviour[]>(`/student-behavior?class_code=${classCode}`, true, { url: this.stagingUrl });
  }

  getScoreLegend() {
    this.scoreLegend$ = this.ws.get<any[]>(`/score-legend`, true, { url: this.stagingUrl });
  }

  getDescriptionLegend() {
    this.descriptionLegend$ = this.ws.get<any[]>(`/description-legend`, true, { url: this.stagingUrl });
  }
  updateStudentsBehaviors(studentBehaviors: AplcStudentBehaviour[]) {
    const confirm = this.alertCtrl.create({
      title: 'Update Students Details',
      message: `You are about to update students details. Do you want to continue?`,
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.showLoading = true;
            this.ws.put('/student-behavior', { url: this.stagingUrl, body: studentBehaviors }).subscribe(
              _ => { },
              err => {
                this.toast("Something went wrong and we couldn't complete your request. Please try again or contact us via the feedback page");
              },
              () => {
                this.toast("Students information has been updated successfully.");
                this.navCtrl.pop();
                this.showLoading = false;
              }
            );
          }
        }
      ]
    });
    confirm.present();
  }

  toast(msg: string) {
    this.toastCtrl
      .create({
        message: msg,
        duration: 7000,
        position: "bottom",
        showCloseButton: true
      })
      .present();
  }
}