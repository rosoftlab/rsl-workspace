/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GenericIonicCrudComponent } from './generic-ionic-crud.component';

describe('GenericIonicCrudComponent', () => {
  let component: GenericIonicCrudComponent;
  let fixture: ComponentFixture<GenericIonicCrudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericIonicCrudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericIonicCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
