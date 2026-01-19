/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ColumnMappingComponent } from './column-mapping.component';

describe('ColumnMappingComponent', () => {
  let component: ColumnMappingComponent;
  let fixture: ComponentFixture<ColumnMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnMappingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
