import { Component, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable, timer } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { VIEW_MODE } from './types/constants';
import { AngularFireDatabase } from '@angular/fire/database';
import { mergeMap, map, shareReplay, flatMap } from 'rxjs/operators';
import * as moment from 'moment';
import Moment = moment.Moment;
import { Appointment } from './types/appointment.type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  VIEW_MODE = VIEW_MODE;
  viewMode$ = new BehaviorSubject(VIEW_MODE.MONTH);

  navigation$ = new BehaviorSubject<number>(0);
  searchTerm$ = new BehaviorSubject('');
  filter;



  private currentDateM$ = this.viewMode$.pipe(
    mergeMap((viewMode: string) => {
      let dateM = moment();
      return this.navigation$.pipe(
        map((action: number) => {
          switch (viewMode) {
            case VIEW_MODE.MONTH:
              return dateM.startOf('month').add(action, 'months');
            case VIEW_MODE.WEEK:
              return dateM.startOf('week').add(action, 'weeks');
            case VIEW_MODE.DAY:
              return dateM.startOf('day').add(action, 'days');
          }
          return dateM;
        })
      );
    }),
    shareReplay()
  );
  currentDate$ = this.currentDateM$.pipe(map((dateM) => dateM.toDate()));
  currentYear$ = this.currentDateM$.pipe(map((dateM) => dateM.year()));
  currentMonth$ = this.currentDateM$.pipe(map((dateM) => dateM.month()));
  currentWeek$ = this.currentDateM$.pipe(map((dateM) => dateM.week()));
  appointments$ = this.db
    .list('/appointments')
    .snapshotChanges()
    .pipe(map((data) => data.map(val=>{
      const data:any=val.payload.val();
      data.$key=val.payload.key;
      return data
    })));
  appointmentChange$ = this.db.list('/appointments');
  filteredAppointments$ = combineLatest([
    this.viewMode$,
    this.currentDateM$,
    this.appointments$,
    this.searchTerm$,
  ])
    .pipe(
      map((val) => {
        switch (val[0]) {
          case 'MONTH':
            return val[2]
              .filter(
                (item: Appointment) =>
                  moment(item.date).format('MM/YYYY') ===
                  val[1].format('MM/YYYY')
              )
              .filter((item) => this.filterByTerm(item, val[3]));
          case 'WEEK':
            return val[2]
              .filter(
                (item: Appointment) =>
                  moment(item.date).format('ww/YYYY') ===
                  val[1].format('ww/YYYY')
              )
              .filter((item) => this.filterByTerm(item, val[3]));
          case 'DAY':
            return val[2]
              .filter(
                (item: Appointment) =>
                  moment(item.date).format('DD/MM/YYYY') ===
                  val[1].format('DD/MM/YYYY')
              )
              .filter((item) => this.filterByTerm(item, val[3]));
        }
      }),
      shareReplay()
    )
    .subscribe((val) => {
      this.filter = val;


      this.appointments$.subscribe((val) => {

      });
    });

  // timerOne emits first value at 1s, then once every 4s
  timerOne$ = timer(1000, 4000);
  // timerTwo emits first value at 2s, then once every 4s
  timerTwo$ = timer(2000, 4000);
  // timerThree emits first value at 3s, then once every 4s
  timerThree$ = timer(3000, 4000);

  // when one timer emits, emit the latest values from each timer as an array
  // loadind= combineLatest(this.timerOne$, this.timerTwo$, this.timerThree$).subscribe(
  //   ([timerValOne, timerValTwo, timerValThree]) => {
  //     /*
  //       Example:
  //     timerThree first tick: 'Timer One Latest: 0, Timer Two Latest: 0, Timer Three Latest: 0
  //     timerOne second tick: 'Timer One Latest: 1, Timer Two Latest: 0, Timer Three Latest: 0
  //     timerTwo second tick: 'Timer One Latest: 1, Timer Two Latest: 1, Timer Three Latest: 0
  //   */
  //     console.log(
  //       `Timer One Latest: ${timerValOne},
  //      Timer Two Latest: ${timerValTwo},
  //      Timer Three Latest: ${timerValThree}`
  //     );
  //   }
  // );

  constructor(
    private db: AngularFireDatabase,
    private http: HttpClientModule
  ) {}
  ngOnInit() {
    this.filteredAppointments$;
  }

  private filterByTerm(appointment, term: string): boolean {
    return (
      appointment.description.toLowerCase().indexOf(term.toLowerCase()) > -1
    );
  }

  onSetViewMode(viewMode: string): void {
    this.viewMode$.next(viewMode);
  }

  onPrevious(): void {
    this.navigation$.next(-1);
  }

  onNext(): void {
    this.navigation$.next(1);
  }

  onSearchChanged(e: string): void {
    this.searchTerm$.next(e);
  }

  onRemoveAppointment(id: string): void {
    this.appointmentChange$.remove(id);
  }

  onAddAppointment(date: Date): void {
    this.appointmentChange$.push(new Appointment(date.toDateString(), ''));
  }

  onUpdateAppointment(appointment: Appointment): void {
    this.db.object('appointments/' + appointment.$key).set({
      description: appointment.description,
      date: appointment.date,
    });
  }
}
