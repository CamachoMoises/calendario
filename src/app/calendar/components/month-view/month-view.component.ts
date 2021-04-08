import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
} from '@angular/core';
import { Appointment } from '../../../types/appointment.type';
import { DayWithAppointments } from '../../../types/day-with-appointments.type';
import * as moment from 'moment';
import * as _ from 'lodash';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.css'],
})
export class MonthViewComponent implements OnChanges {
  @Input() month: number;
  @Input() year: number;
  @Input() appointments: Array<Appointment>;

  @Output() public addAppointment = new EventEmitter<Appointment>();
  @Output() public updateAppointment = new EventEmitter<Appointment>();
  @Output() public removeAppointment = new EventEmitter<Appointment>();

  weeks: Array<Array<DayWithAppointments>>;

  ngOnChanges(simpleChanges: any): void {
    if (this.month && this.year) {
      this.weeks = this.calculateMonthWithAppointments(
        this.month,
        this.year,
        this.appointments || []
      );
      console.log('weeks',this.appointments);


    }
  }
  private calculateMonthWithAppointments(month: number, year: number, appointments: Array<Appointment>): Array<Array<DayWithAppointments>> {
    const dayOneM = moment().year(year).month(month).date(1);
    const days = Array.from({length: dayOneM.daysInMonth()}, (value, key) => key + 1);
    let res = _.groupBy(days, ((day: number) => moment().year(year).month(month).date(day).week()));
    return Object.keys(res)
        .map((key) => res[key])
        .map((days: Array<number>) => {
            let week: Array<DayWithAppointments> = Array.from({length: 7}, () => null);
            days.forEach((day) => {
                let dateM = moment().year(year).month(month).date(day);
                week[dateM.weekday()] = {
                    date: dateM.toDate(),
                    appointments: appointments.filter((appointment: Appointment) => {
                        return dateM.date() === moment(appointment.date).date();
                    }).slice(0,3)
                };
            });
            return week;
        });
}
}
