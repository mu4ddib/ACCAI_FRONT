import { TestBed } from '@angular/core/testing';

import { UploadCsvService } from './upload-csv.service';

describe('UploadCsvService', () => {
  let service: UploadCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadCsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
