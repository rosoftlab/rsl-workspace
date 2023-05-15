import { TestBed } from '@angular/core/testing';

import { IonicService } from './ionic.service';

describe('IonicService', () => {
  let service: IonicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IonicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
