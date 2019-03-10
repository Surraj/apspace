import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { App, IonicPage, NavParams, Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { finalize, map } from 'rxjs/operators';

import { NotificationProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})

export class NotificationPage {
  objectKeys = Object.keys;
  notifications = 'unread';
  unreadMessages: any;

  message$: Observable<any>;

  numOfSkeletons = new Array(5);
  isLoading: boolean;
  cordova: boolean;

  constructor(
    private navParams: NavParams,
    private notification: NotificationProvider,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    public app: App,
  ) { }

  ionViewDidEnter() {
    if (this.platform.is('cordova')) {
      this.doRefresh();
    }
  }

  ionViewDidLeave() {
    if (this.platform.is('cordova')) {
      const callback = this.navParams.get('callback');
      if (callback) {
        callback();
      }
    }
  }

  doRefresh(refresher?) {
    this.cordova = true;
    this.isLoading = true;
    this.message$ = this.notification.getMessage().pipe(
      map(res => res.history),
      finalize(() => { refresher && refresher.complete(), this.isLoading = false; }),
    );
  }

  openBasicModal(item: any, messageID: string) {
    this.notification.sendRead(messageID).subscribe();
    this.app.getRootNav().push('NotificationModalPage', { itemDetails: item });
  }

  displayDate(msgId) {
    const date = this.notification.timeConverter(msgId);
    return date[0];
  }

  sanitize(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
