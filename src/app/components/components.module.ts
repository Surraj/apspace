import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SkeletonItemComponent } from './skeleton-item/skeleton-item.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner';
import { EventsListComponent } from './events-list/events-list.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { QuickAccessItemComponent } from './quick-access-item/quick-access-item.component';
import { PopoverComponent } from './popover/popover.component';
import { NoDataComponent } from './no-data/no-data.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';

@NgModule({
  declarations: [
    SkeletonItemComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    EventsListComponent,
    DashboardCardComponent,
    QuickAccessItemComponent,
    PopoverComponent,
    NoDataComponent,
    MessageWithSvgComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    SkeletonItemComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    EventsListComponent,
    DashboardCardComponent,
    QuickAccessItemComponent,
    PopoverComponent,
    NoDataComponent,
    MessageWithSvgComponent
  ],
  entryComponents: [
    SearchModalComponent,
    PopoverComponent
  ]
})
export class ComponentsModule { }