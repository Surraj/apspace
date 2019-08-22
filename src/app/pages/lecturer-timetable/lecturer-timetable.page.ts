import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { StaffProfile } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-lecturer-timetable',
  templateUrl: './lecturer-timetable.page.html',
  styleUrls: ['./lecturer-timetable.page.scss'],
})
export class LecturerTimetablePage implements OnInit {

  staffProfiles$: Observable<StaffProfile[]>;

  constructor(private ws: WsApiService) { }

  ngOnInit() {
    this.staffProfiles$ = this.ws.get<StaffProfile[]>('/staff/profile');
  }

}