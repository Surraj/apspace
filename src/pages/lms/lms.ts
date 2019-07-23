import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicPage, NavController } from 'ionic-angular';

import { CasTicketProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-lms',
  template: '',
})
export class LmsPage {

  lmsUrl = 'https://lms2.apiit.edu.my/login/index.php';

  constructor(
    private cas: CasTicketProvider,
    private iab: InAppBrowser,
    private navCtrl: NavController,
  ) { }

  ionViewDidLoad() {
    this.cas.getST(this.lmsUrl)
      .subscribe(st => this.iab.create(`${this.lmsUrl}?ticket=${st}`, '_blank', 'location=true'));
    this.navCtrl.pop();
  }
}