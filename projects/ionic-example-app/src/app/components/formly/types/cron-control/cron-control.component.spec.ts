/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CronControlComponent } from './cron-control.component';

describe('CronControlComponent', () => {
  let component: CronControlComponent;
  let fixture: ComponentFixture<CronControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
