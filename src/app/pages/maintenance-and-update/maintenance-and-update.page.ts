import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-maintenance-and-update',
  templateUrl: './maintenance-and-update.page.html',
  styleUrls: ['./maintenance-and-update.page.scss'],
})
export class MaintenanceAndUpdatePage implements OnInit {
  forceUpdate = false;
  storeUrl = '';

  constructor(
    private router: Router,
    private iab: InAppBrowser
  ) { }

  ngOnInit() {
    if (this.router.getCurrentNavigation().extras.state) {
      if (this.router.getCurrentNavigation().extras.state.storeUrl) {
        this.storeUrl = this.router.getCurrentNavigation().extras.state.storeUrl;
      }
      if (this.router.getCurrentNavigation().extras.state.forceUpdate) {
        this.forceUpdate = this.router.getCurrentNavigation().extras.state.forceUpdate;
      }
    }
  }

  openStore() {
    this.iab.create(this.storeUrl, '_system', 'location=true');
  }

}
