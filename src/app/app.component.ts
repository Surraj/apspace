import { Observable } from 'rxjs/Observable';
import { Component, ViewChild } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import {
  AlertController, Events, Platform, ToastController,
  Nav
} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';

import { CasTicketProvider, WsApiProvider, NotificationServiceProvider } from '../providers';
import { UserProfile, UserPhoto } from '../interfaces';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  activePage: any;
  items: { title: string, text: string }[] = [];

  pages: Array<{
    title: string,
    component: any,
    icon: any
  }>;

  profile$: Observable<UserProfile[]>;
  photo$: Observable<UserPhoto[]>;

  constructor(
    public alertCtrl: AlertController,
    public events: Events,
    public network: Network,
    public plt: Platform,
    public storage: Storage,
    public toastCtrl: ToastController,
    private cas: CasTicketProvider,
    private ws: WsApiProvider,
    private notificationService: NotificationServiceProvider,
    private platform: Platform,
    private firebase: Firebase
  ) {

    this.storage.get('tgt')
      .then(tgt => {
        if (tgt) {
          this.events.subscribe('user:logout', () => this.onLogout());
          this.profile$ = this.ws.get<UserProfile[]>('/student/profile');
          this.photo$ = this.ws.get<UserPhoto[]>('/student/photo')
          this.activePage = this.pages[0];
          this.navCtrl.setRoot('HomePage');
        } else {
          this.events.subscribe('user:login', () => this.onLogin());
          this.navCtrl.setRoot('LoginPage');
        }
      });

    this.pages = [
      { title: 'Home', component: 'HomePage', icon: 'home' },
      { title: 'Timetable', component: 'TimetablePage', icon: 'calendar' },
      { title: 'Staff Directory', component: 'StaffDirectoryPage', icon: 'people' },
      { title: 'Results', component: 'ResultsPage', icon: 'checkbox' },
      { title: 'Notification', component: 'NotificationPage', icon: 'chatbubbles' },
      { title: 'Feedback', component: 'FeedbackPage', icon: 'at' },
    ];

    this.platform.ready().then(() => {
      this.firebase.onNotificationOpen()
        .subscribe(notification => {
          console.log("Notification receieved");
          this.storage.get('items').then(data => {
            if (!data) {
              console.log(";ist is empty");
            } else {
              this.items = data;
              this.items.splice(0, 0, { title: notification.title, text: notification.text });
              if (this.items.length > 10) {
                this.items.pop();
              }
              this.storage.set('items', this.items);
              this.presentConfirm(notification.title, notification);
            }
          })
        })
    })
    this.activePage = this.pages[0];

    if (this.plt.is('cordova') && this.network.type === 'none') {
      this.toastCtrl.create({ message: 'You are now offline.', duration: 3000 }).present();
    }
  }

  openPage(page) {
    this.navCtrl.setRoot(page.component);
    this.activePage = page;
  }

  onLogin() {
    this.profile$ = this.ws.get<UserProfile[]>('/student/profile');
    this.photo$ = this.ws.get<UserPhoto[]>('/student/photo');
    this.activePage = this.pages[0];
    this.subscribe();
    this.events.unsubscribe('user:login');
    this.events.subscribe('user:logout', () => this.onLogout());
  }

  onLogout() {
    this.unsubscribe();
    this.ws.get('/student/close_session').subscribe();
    this.cas.deleteTGT().subscribe(_ => {
      // TODO: keep reusable cache
      this.storage.clear();
      this.navCtrl.setRoot('LoginPage');
      this.navCtrl.popToRoot();
    });
    this.events.unsubscribe('user:logout');
    this.events.subscribe('user:login', () => this.onLogin());
  }

  logout() {
    this.alertCtrl.create({
      title: 'Confirm logout',
      message: 'Do you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout', handler: () => {
            this.events.publish('user:logout');
          }
        },
      ]
    }).present();
  }

  subscribe() {
    this.firebase.onTokenRefresh()
      .subscribe(token => {
        this.storage.set('token', token);
        this.ws.get('/student/profile')
          .subscribe((user_info) => {
            this.cas.getTGT('tgt')
              .subscribe((tgt) => {
                this.notificationService
                  .Subscribe(user_info[0].STUDENT_NUMBER, token, tgt)
              })
          })
      })

  }

  unsubscribe() {
    this.cas.getTGT('tgt').subscribe(tgt => {
      this.ws.get('/student/profile')
        .subscribe(user_info => {
          this.storage.get('token')
            .then(token => {
              this.notificationService
                .Unsubscribe(user_info[0].STUDENT_NUMBER, token, tgt)
            })
        })
    })
  }

  presentConfirm(title, notification) {
    let alert = this.alertCtrl.create({
      title: 'New Notification',
      message: title,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Open',
          handler: () => {
            this.navCtrl.push("NotificationModalPage", { itemDetails: notification })
          }
        }
      ]
    });
    alert.present();
  }


}

