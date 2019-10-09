import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { DeauthGuard } from './guards/deauth.guard';
import { Role } from './interfaces';

/* tslint:disable:no-bitwise */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [DeauthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },

  {
    path: 'student-timetable',
    loadChildren: () => import('./pages/student-timetable/student-timetable.module').then(m => m.StudentTimetablePageModule)
  },
  {
    path: 'staffs',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/staff-directory/staff-directory.module').then(m => m.StaffDirectoryPageModule)
      },
      {
        path: '',
        loadChildren: () => import('./pages/staff-directory-info/staff-directory-info.module').then(m => m.StaffDirectoryInfoPageModule)
      },
      {
        path: ':id/consultations',
        loadChildren: () => import('./pages/iconsult/student/opened-slots/opened-slots.module').then(m => m.OpenedSlotsPageModule)
      }
    ]
  },
  {
    path: 'feedback',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackPageModule)
  },
  {
    path: 'bus-shuttle-services',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/bus-shuttle-services/bus-shuttle-services.module').then(m => m.BusShuttleServicesPageModule)
  },
  {
    path: 'more',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/more/more.module').then(m => m.MorePageModule)
  },
  {
    path: 'attendance',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/attendance/attendance.module').then(m => m.AttendancePageModule)
  },
  {
    path: 'apcard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/apcard/apcard.module').then(m => m.ApcardPageModule)
  },
  {
    path: 'fees',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/fees/fees.module').then(m => m.FeesPageModule)
  },
  {
    path: 'holidays',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/holidays/holidays.module').then(m => m.HolidaysPageModule)
  },
  {
    path: 'graduate-verification-service',
    loadChildren: () => import('./pages/graduate-verification-service/graduate-verification-service.module')
      .then(m => m.GraduateVerificationServicePageModule)
  },
  {
    path: 'exam-schedule',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/exam-schedule/exam-schedule.module').then(m => m.ExamSchedulePageModule)
  },
  {
    path: 'news',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'set-security-questions',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/settings/set-security-questions/set-security-questions.module')
      .then(m => m.SetSecurityQuestionsPageModule)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  {
    path: 'classroom-finder',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/classroom-finder/classroom-finder.module').then(m => m.ClassroomFinderPageModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  },

  {
    path: 'operation-hours',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/operation-hours/operation-hours.module').then(m => m.OperationHoursPageModule)
  },
  // {
  //   path: 'student-survey',
  //   canActivate: [AuthGuard],
  //   data: { role: Role.Student },
  //   loadChildren: () => import('./pages/student-survey/student-survey.module').then(m => m.SubmitSurveyPageModule)
  // },
  {
    path: 'results',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/results/results.module').then(m => m.ResultsPageModule)
  },
  {
    path: 'lecturer-timetable',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/lecturer-timetable/lecturer-timetable.module').then(m => m.LecturerTimetablePageModule)
  },
  {
    path: 'logout',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/logout/logout.module').then(m => m.LogoutPageModule)
  },

  // iConsult Routes
  {
    path: 'iconsult',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'add-free-slot',
        canActivate: [AuthGuard],
        data: { role: Role.Admin | Role.Lecturer },
        loadChildren: () => import('./pages/iconsult/staff/add-free-slot/add-free-slot.module').then(m => m.AddFreeSlotPageModule)
      },
      {
        path: 'add-unavailability',
        canActivate: [AuthGuard],
        data: { role: Role.Admin | Role.Lecturer },
        loadChildren: () => import('./pages/iconsult/staff/add-unavailability/add-unavailability.module')
          .then(m => m.AddUnavailabilityPageModule)
      },
      {
        path: 'my-consultations',
        canActivate: [AuthGuard],
        data: { role: Role.Admin | Role.Lecturer },
        loadChildren: () => import('./pages/iconsult/staff/my-consultations/my-consultations.module').then(m => m.MyConsultationsPageModule)
      },
      {
        path: 'my-appointments',
        canActivate: [AuthGuard],
        data: { role: Role.Student },
        loadChildren: () => import('./pages/iconsult/student/my-appointments/my-appointments.module').then(m => m.MyAppointmentsPageModule)
      },
    ]
  },
  // {
  //   path: 'aplc-progress-report',
  //   canActivate: [AuthGuard],
  //   data: { role: Role.Admin | Role.Lecturer },
  //   loadChildren: () => import('./pages/aplc-progress-report/aplc-progress-report.module').then(m => m.AplcProgressReportPageModule)
  // },
  {
    path: 'staff-dashboard',
    canActivate: [AuthGuard],
    data: { role: Role.Lecturer },
    loadChildren: () => import('./pages/staff-dashboard/staff-dashboard.module').then(m => m.StaffDashboardPageModule)
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/settings/change-password/change-password.module')
      .then(m => m.ChangePasswordPageModule)
  },
  {
    path: 'visa-status',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Student },
    loadChildren: () => import('./pages/visa-status/visa-status.module').then(m => m.VisaStatusPageModule)
  },
  {
    path: 'maintenance-and-update',
    loadChildren: () => import('./pages/maintenance-and-update/maintenance-and-update.module').then(m => m.MaintenanceAndUpdatePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
