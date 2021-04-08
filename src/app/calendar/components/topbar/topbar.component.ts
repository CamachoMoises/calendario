import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { VIEW_MODE } from '../../../types/constants';


@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  constructor() { }
  @Output() previous = new EventEmitter();
  @Output() next = new EventEmitter();
  @Output() setViewMode = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();
  value=null;
  VIEW_MODE = VIEW_MODE;
  ngOnInit(): void {
  }

}
