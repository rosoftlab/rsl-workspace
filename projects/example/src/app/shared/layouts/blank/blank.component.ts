import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blank',
})
export class BlankComponent implements OnInit {
  isLoged: boolean;
  constructor() {
    this.isLoged = false;
  }

  ngOnInit() {
  }

}
