import { Component, ViewChild } from '@angular/core';
import { FCM } from '@ionic-native/fcm';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { AlertController, Events, Nav, Platform, ToastController } from 'ionic-angular';

import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';
import { switchMapTo } from 'rxjs/operators';

import {
  Role,
  StaffProfile,
  StudentPhoto,
  StudentProfile,
} from '../interfaces';
import {
  CasTicketProvider,
  DataCollectorProvider,
  NotificationProvider,
  SettingsProvider,
  UserSettingsProvider,
  WsApiProvider,
} from '../providers';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;
  selectedTheme = 'light-theme';
  selectedColorScheme = 'blue-color-scheme';

  constructor(
    public events: Events,
    public network: Network,
    public statusBar: StatusBar,
    public storage: Storage,
    public toastCtrl: ToastController,
    private notificationService: NotificationProvider,
    private platform: Platform,
    private settings: SettingsProvider,
    private ws: WsApiProvider,
    private cas: CasTicketProvider,
    private alertCtrl: AlertController,
    private fcm: FCM,
    private dc: DataCollectorProvider,
    private userSettings: UserSettingsProvider
  ) {
    // platform required to be ready before everything else
    this.platform
      .ready()
      .then(() => Promise.all([this.settings.ready(), this.storage.get('tgt')]))
      .then(([, tgt]) => {
        this.userSettings.getUserSettingsFromStorage();
        this.userSettings
          .getActiveTheme()
          .subscribe((val) => {
            this.selectedTheme = val;
            this.userSettings.changeStatusBarColor(val);
          });
        this.userSettings
          .getColorScheme()
          .subscribe(val => (this.selectedColorScheme = val));

        if (tgt) {
          // check if the user is logged in
          this.events.subscribe('user:logout', () => this.onLogout());
          this.navCtrl.setRoot('TabsPage');
          if (this.platform.is('cordova')) {
            this.checkNewNotification();
            this.notificationService.getMessage().subscribe();
          }
        } else {
          this.events.subscribe('user:login', () => this.onLogin());
          if (this.platform.is('cordova')) {
            this.checkNewNotification();
          }
          if (window.location.href.split('#')[1] === '/timetable') {
            this.navCtrl.setRoot('TimetablePage');
          } else if (window.location.href.split('#')[1] === '/qualification-verification') {
            this.navCtrl.setRoot('QualificationVerificationPage');
          } else {
            this.navCtrl.setRoot('LoginPage');
          }
        }
        if (this.platform.is('cordova')) {
          if (this.platform.is('ios')) {
            this.statusBar.overlaysWebView(false);
          }
          if (this.network.type === 'none') {
            this.toastCtrl
              .create({
                message: 'You are now offline.',
                duration: 3000,
                position: 'top',
              })
              .present();
          }
        }
      });
  }

  checkNewNotification() {
    this.fcm.onNotification().subscribe(data => {
      if (data.wasTapped) {
        this.notificationService
          .sendRead(data.message_id)
          .subscribe(_ => {
            this.navCtrl.push('NotificationModalPage', { itemDetails: data, category: data.category, firstColor: data.first_color, secondColor: data.second_color });
          });
      } else {
        this.presentConfirm(data);
        this.events.publish('newNotification');
      }
    });
  }

  onLogin() {
    if (this.platform.is('cordova')) {
      forkJoin(
        this.dc.login(),
        this.notificationService.getMessage(),
      ).subscribe();
    }
    const role = this.settings.get('role');
    if (role & Role.Student) {
      this.ws.get<StudentPhoto[]>('/student/photo').subscribe();
    } else if (role & (Role.Lecturer | Role.Admin)) {
      this.ws.get<StaffProfile[]>('/staff/profile').subscribe();
    }
    this.events.unsubscribe('user:login');
    this.events.subscribe('user:logout', () => this.onLogout());
  }

  onLogout() {
    if (this.platform.is('cordova')) {
      const role = this.settings.get('role');
      if (role & Role.Student) {
        this.ws.get<StudentProfile>('/student/profile').subscribe(p => {
          this.unsubscribeNotification(p.STUDENT_NUMBER);
          this.logout();
        });
      } else if (role & (Role.Lecturer | Role.Admin)) {
        this.ws.get<StaffProfile[]>('/staff/profile').subscribe(p => {
          this.unsubscribeNotification(p[0].ID);
          this.logout();
        });
      }
    } else {
      this.logout();
    }
  }

  logout() {
    // XXX: temporary asynchronous logout
    (this.platform.is('cordova') ? this.dc.logout() : of(null)).pipe(
      // timeout(10000),
      switchMapTo(this.cas.deleteTGT()),
    ).subscribe(_ => {
      this.settings.clear();
      this.storage.clear();
      this.navCtrl.setRoot('LoginPage');
      this.navCtrl.popToRoot();
    });
    this.events.unsubscribe('user:logout');
    this.events.subscribe('user:login', () => this.onLogin());
  }

  unsubscribeNotification(id: string) {
    this.notificationService.sendTokenOnLogout(id);
  }

  presentConfirm(data) {
    this.alertCtrl
      .create({
        title: data.title,
        message: data.non_html_content.substring(0, 150) + '...',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Open',
            handler: () => {
              this.notificationService
                .sendRead(data.message_id)
                .subscribe(_ => {
                  this.navCtrl.push('NotificationModalPage', { itemDetails: data, category: data.category, firstColor: data.first_color, secondColor: data.second_color });
                });
            },
          },
        ],
      })
      .present();
  }


}
