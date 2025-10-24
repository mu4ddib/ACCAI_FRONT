import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UploadCsvService } from './upload-csv.service';
import { environment } from '../../../environments/environment';

const makeFile = (txt = 'A,B\n1,2\n', name = 't.csv', type = 'text/csv') =>
  new File([txt], name, { type });

describe('UploadCsvService', () => {
  let http: HttpTestingController;
  let svc: UploadCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    svc  = TestBed.inject(UploadCsvService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('POST upload -> usa endpoint /api/fp-changes/upload', () => {
    const f = makeFile();
    let resp: any;

    svc.uploadCsv(f).subscribe(r => (resp = r));
    const req = http.expectOne(`${environment.apiBase}/api/fp-changes/upload`);
    expect(req.request.method).toBe('POST');
    // Verifica que envíe FormData con el archivo
    const body = req.request.body as FormData;
    expect(body.get('file')).toBeTruthy();
    expect((body.get('file') as File).name).toBe('t.csv');

    req.flush({ ok: true, data: { totalFilas: 2 } });
    expect(resp.ok).toBeTrue();
  });

  it('POST validate -> usa endpoint /api/fp-changes/validate', () => {
    const f = makeFile();
    let resp: any;

    svc.validateCsv(f).subscribe(r => (resp = r));
    const req = http.expectOne(`${environment.apiBase}/api/fp-changes/validate`);
    expect(req.request.method).toBe('POST');

    req.flush({ errores: 0, totalFilas: 2, detalle: [] });
    expect(resp.totalFilas).toBe(2);
    expect(resp.errores).toBe(0);
  });
});
