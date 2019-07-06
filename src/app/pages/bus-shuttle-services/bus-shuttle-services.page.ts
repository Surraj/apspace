import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BusTrips, BusTrip, APULocation, APULocations } from 'src/app/interfaces';
import { Observable, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { MenuController } from '@ionic/angular';
import { SettingsService } from 'src/app/services';

@Component({
  selector: 'app-bus-shuttle-services',
  templateUrl: './bus-shuttle-services.page.html',
  styleUrls: ['./bus-shuttle-services.page.scss'],
})
export class BusShuttlePage implements OnInit {
  trip$: Observable<BusTrip[]>;
  filteredTrip$: any;
  busTrackingUrl = 'https://api.apiit.edu.my/transix';
  locations: APULocation[];
  dateNow = new Date();

  latestUpdate = '';

  filterObject: {
    tripDay: string,
    toLocation: string,
    fromLocation: string,
    show: 'all' | 'upcoming'
  } = {
      toLocation: '',
      fromLocation: '',
      show: 'upcoming',
      tripDay: this.getTodayDay(this.dateNow)
    };

  skeletonSettings = {
    numberOfSkeltons: new Array(6),
    numberOfLocationsPerSource: new Array(3),
    numberOfTimesPerTrip: new Array(9)
  };

  numberOfTrips = 1;

  constructor(
    public http: HttpClient,
    private menu: MenuController,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    // GETTING FILTER SETTINGS FROM STORAGE:
    if (this.settings.get('tripFrom')) {
      this.filterObject.fromLocation = this.settings.get('tripFrom');
    }
    if (this.settings.get('tripTo')) {
      this.filterObject.toLocation = this.settings.get('tripTo');
    }


    this.filteredTrip$ = forkJoin(
      this.getLocations(),
      this.getTrips(),
    ).pipe(
      map(res => res[1]),
      tap(_ => this.onFilter())
    );
  }

  getTrips() {
    const url = `${this.busTrackingUrl}/trips/applicable`;
    return this.trip$ = this.http.get<BusTrips>(url).pipe(
      map(res => res.trips),
    );
  }

  getLocations() {
    const url = `${this.busTrackingUrl}/locations`;
    return this.http.get<APULocations>(url).pipe(
      map((res: APULocations) => res.locations),
      tap(locations => this.locations = locations)
    );
  }

  onFilter() {
    this.filteredTrip$ = this.trip$.pipe(
      map(trips => {
        this.numberOfTrips = 1; // HIDE 'THERE ARE NO TRIPS' MESSAGE
        let filteredArray = trips.filter(trip => {
          // FILTER TRIPS BY (FROM, TO) LOCATIONS, AND DAY
          if (this.filterObject.tripDay === 'mon-fri') {
            return (
              trip.trip_from.includes(this.filterObject.fromLocation) &&
              trip.trip_to.includes(this.filterObject.toLocation) &&
              (trip.trip_day === 'mon-fri' || trip.trip_day === 'fri')
            );
          } else {
            return (
              trip.trip_from.includes(this.filterObject.fromLocation) &&
              trip.trip_to.includes(this.filterObject.toLocation) &&
              trip.trip_day === this.filterObject.tripDay
            );
          }
        });
        if (this.filterObject.show === 'upcoming') {
          filteredArray = filteredArray.filter(trip => {
            // FILTER TRIPS TO UPCOMING TRIPS ONLY
            // return this.strToDate(trip.trip_time) >= this.dateNow;
            return moment(trip.trip_time, 'kk:mm').toDate() >= this.dateNow;
          });
        }
        if (filteredArray.length === 0) { // NO RESULTS => SHOW 'THERE ARE NO TRIPS' MESSAGE
          this.numberOfTrips = 0;
        }
        return filteredArray;
      }),
      tap(trips => {
        // STORE LATEST UPDATE DATE
        this.latestUpdate = moment(Math.max(...trips.map(trip =>
          moment(trip.applicable_from, 'YYYY-MM-DD').toDate().getTime())))
          .format('dddd, Do MMMM YYYY');
      }),
      map(trips => {
        const result = trips.reduce((r, a) => {
          r[a.trip_from] = r[a.trip_from] || {};  // {acadimea: , apu: ...}
          r[a.trip_from][a.trip_to] = r[a.trip_from][a.trip_to] || [];

          r[a.trip_from][a.trip_to].push(a);
          return r;
        }, {});

        return result;
      }),
      tap(_ => {
        this.settings.set('tripFrom', this.filterObject.fromLocation);
        this.settings.set('tripTo', this.filterObject.toLocation);
      })
    );
  }

  openMenu() {
    this.menu.enable(true, 'bus-filter-menu');
    this.menu.open('bus-filter-menu');
  }

  closeMenu() {
    this.menu.close('bus-filter-menu');
  }

  // SWAP FROM AND TO LOCATIONS
  swapLocations() {
    const temp = this.filterObject.toLocation;
    this.filterObject.toLocation = this.filterObject.fromLocation;
    this.filterObject.fromLocation = temp;
    this.onFilter();
  }

  clearFilter() {
    this.filterObject = {
      fromLocation: '',
      toLocation: '',
      tripDay: 'mon-fri',
      show: 'upcoming'
    };
    this.onFilter();
  }

  // GET DAY SHORT NAME (LIKE 'SAT' FOR SATURDAY)
  getTodayDay(date: Date) {
    const dayRank = date.getDay();
    if (dayRank === 0) {
      return 'sun';
    } else if (dayRank > 0 && dayRank <= 5) {
      return 'mon-fri';
    } else {
      return 'sat';
    }
  }

  // GET LOCATION NAME BY LOCATION ID
  getLocationDisplayNameAndType(locationName: string) {
    for (const location of this.locations) {
      if (location.location_name === locationName) {
        return location.location_nice_name + '&&' + location.location_type;
      }
    }
  }

  // GET LOCATION COLOR BY LOCATION ID
  getLocationColor(locationName: string) {
    for (const location of this.locations) {
      if (location.location_name === locationName) {
        return location.location_color;
      }
    }
  }
}
