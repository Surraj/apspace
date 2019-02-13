import { Component } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';

import { LocationsInterface, Trips } from '../../interfaces';
import { BusTrackingProvider } from '../../providers';

import { Observable } from 'rxjs/Observable';
import { finalize, map } from 'rxjs/operators';

import * as _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-bus-tracking',
  templateUrl: 'bus-tracking.html',
})
export class BusTrackingPage {
  // OBSERVABLES
  trip$: Observable<Trips[]>;
  filteredTrip$: Observable<Trips[]>;
  location$: Observable<LocationsInterface[]>;

  locations: LocationsInterface[];
  dateNow = new Date();
  objectKeys = Object.keys;
  numOfSkeletons = new Array(6);

  // FILTER NG MODEL VALUES
  tripDay: string;
  toLocation: string;
  fromLocation: string;
  comingTripsOnly: string;
  numberOfTrips = 1;

  constructor(public bus: BusTrackingProvider, public menu: MenuController) {}

  ionViewDidLoad() {
    // FILTER OPTIONS
    this.tripDay = this.getTodayDay(this.dateNow); // SET THE TRIP DAY TO THE CURRENT DAY
    this.toLocation = '';
    this.fromLocation = '';
    this.comingTripsOnly = '';

    this.getTrips();
    this.getLocations();
  }

  // GET TRIPS FOR FIRST TIME
  getTrips(refresher?) {
    // TRIP$ IS USED FOR FILTERING
    this.trip$ = this.bus.getTrips(Boolean(refresher)).pipe(
      map(res => res.trips),
      finalize(() => refresher && refresher.complete()),
    );

    // FILTEREDTRIP$ IS USED IN THE TEMPLATE AFTER GROUPING TRIP$
    this.filteredTrip$ = this.trip$.pipe(
      map(trips => {
          return _.filter(trips, trip => {
            // FILTER TRIPS TO UPCOMING TRIPS ONLY
            if (this.tripDay == 'mon-fri') {
              return trip.trip_day == 'mon-fri' || trip.trip_day == 'fri';
            } else {
              return trip.trip_day == this.getTodayDay(this.dateNow);
            }
          });
        },
      ),
      map(trips => {
        // group items by trip_from
        return _.mapValues(
          _.groupBy(trips, item => {
            return item.trip_from;
          }),
        );
      }),
      map(filteredTrips => {
        // group items by trip_to
        // this.numberOfTrips++;
        return _.forEach(filteredTrips, function(value, key) {
          filteredTrips[key] = _.groupBy(filteredTrips[key], function(item) {
            return item.trip_to;
          });
        });
      }),
    );
  }

  // GET LOCATIONS
  getLocations(refresher?) {
    this.bus.getLocationDetails(Boolean(refresher)).subscribe(response => {
      this.locations = response.locations;
    });
  }

  // TOGGLE THE MENU
  toggleFilterMenu() {
    this.menu.toggle();
  }

  // FILTER TRIPS BY FROM LOCATION , TO LOCATION, TRIP DAY AND COMING TRIPS ONLY
  filterTrips(
    source: string,
    destination: string,
    day: string,
    comingTripsOnly: string,
  ) {
    this.filteredTrip$ = this.trip$.pipe(
      map(trips => {
        this.numberOfTrips = 1; // HIDE 'THERE ARE NO TRIPS' MESSAGE
        let filteredArray = _.filter(trips, trip => {
          // FILTER TRIPS BY (FROM, TO) LOCATIONS, AND DAY
          if (day == 'mon-fri') {
            return (
              trip.trip_from.includes(source) &&
              trip.trip_to.includes(destination) &&
              (trip.trip_day == 'mon-fri' || trip.trip_day == 'fri')
            );
          } else {
            return (
              trip.trip_from.includes(source) &&
              trip.trip_to.includes(destination) &&
              trip.trip_day == day
            );
          }
        });
        if (comingTripsOnly == 'true') {
          filteredArray = _.filter(filteredArray, trip => {
            // FILTER TRIPS TO UPCOMING TRIPS ONLY
            return this.strToDate(trip.trip_time) >= this.dateNow;
          });
        }
        if (filteredArray.length == 0) { // NO RESULTS => SHOW 'THERE ARE NO TRIPS' MESSAGE
          this.numberOfTrips = 0;
        }
        return filteredArray;
      }),
      map(trips => {
        // group items by trip_from
        return _.mapValues(
          _.groupBy(trips, item => {
            return item.trip_from;
          }),
        );
      }),
      map(filteredTrips => {
        // group items by trip_to
        return _.forEach(filteredTrips, function(value, key) {
          filteredTrips[key] = _.groupBy(filteredTrips[key], function(item) {
            return item.trip_to;
          });
        });
      }),
    );
    this.toggleFilterMenu();
  }

  // GET DAY SHORT NAME (LIKE 'SAT' FOR SATURDAY)
  getTodayDay(date: Date) {
    const dayRank = date.getDay();
    if (dayRank == 0) {
      return 'sun';
    } else if (dayRank > 0 && dayRank <= 5) {
      return 'mon-fri';
    } else {
      return 'sat';
    }
  }

  // GET LOCATION NAME BY LOCATION ID
  getLocationDisplayName(locationName: string) {
    for (const location of this.locations) {
      if (location.location_name == locationName) {
        return location.location_nice_name;
      }
    }
  }

  // GET LOCATION COLOR BY LOCATION ID
  getLocationColor(locationName: string) {
    for (const location of this.locations) {
      if (location.location_name == locationName) {
        return location.location_color;
      }
    }
  }

  // CONVERT STRING TO DATE
  strToDate(strTime: string) {
    const customDate = new Date();
    customDate.setHours(+strTime.split(':')[0]);
    customDate.setMinutes(+strTime.split(':')[1]);
    return customDate;
  }
}
