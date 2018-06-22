import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { SuperTabs } from 'ionic2-super-tabs';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  @ViewChild(SuperTabs) superTabs: SuperTabs;

  tabs: Array<{
    icon: any,
    root: any
  }>;

  constructor(public navParams: NavParams) {

    this.tabs = [
      { icon: 'md-home', root: 'HomePage' },
      { icon: 'md-calendar', root: 'TimetablePage' },
      { icon: 'md-alarm', root: 'AttendancePage' },
      { icon: 'md-card', root: 'ApcardPage' },
      { icon: 'ios-more', root: 'MorePage' },
    ]
  }

  ionViewDidLoad() { }

  slideToIndex(index: number) {
    this.superTabs.slideTo(index);
  }
}
