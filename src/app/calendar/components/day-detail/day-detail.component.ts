import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { Appointment } from '../../../types/appointment.type';
import * as moment from 'moment';

@Component({
  selector: 'app-day-detail',
  templateUrl: './day-detail.component.html',
  styleUrls: ['./day-detail.component.css'],
})
export class DayDetailComponent implements OnInit, OnChanges {
  @Input() date: Date;
  @Input() appointments: Array<Appointment>;
  editMode = false;

  @Output() public addAppointment = new EventEmitter<Date>();
  @Output() public updateAppointment = new EventEmitter<Appointment>();
  @Output() public removeAppointment = new EventEmitter<Appointment>();

  displayedColumns: string[] = ['description', 'date'];
  dataSource: Appointment[];
  constructor() {}
  ngOnInit(): void {}
  ngOnChanges() {
    this.dataSource = this.appointments;
  }
  add(): void {
    this.addAppointment.emit(moment(this.date).toDate());
  }
  update(appointment: Appointment, $key: string) {
    this.updateAppointment.emit(Object.assign({ $key }, appointment));
  }
}
