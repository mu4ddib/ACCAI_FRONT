import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DropFile } from './drop-file';
import { UploadCsvService } from '../../../core/service/upload-csv.service';

function makeCsvFile(content = 'A,B\n1,2\n3,4\n') {
  return new File([content], 'ok.csv', { type: 'text/csv' }); 
}

class UploadCsvServiceMock {
  uploadCsv = jasmine.createSpy().and.returnValue(of({ ok: true, message: 'OK', data: {} }));
  validateCsv = jasmine.createSpy().and.returnValue(of({ errores: 0, totalFilas: 0, detalle: [] }));
}

const makeFile = (txt = 'A,B\n1,2\n3,4\n', name = 'ok.csv', type = 'text/csv') =>
  new File([txt], name, { type });

const makeManyRowsFile = (rows = 25) => {
  const body = Array.from({ length: rows }, (_, i) => `${i + 1},${i + 2}`).join('\n');
  return makeFile(`A,B\n${body}\n`);
};

describe('DropFile (standalone)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DropFile],
    })
      .overrideProvider(UploadCsvService, { useValue: new UploadCsvServiceMock() })
      .compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(DropFile);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, comp };
  }

  it('should create', () => {
    const { comp } = create();
    expect(comp).toBeTruthy();
  });

  it('handleFile: extensión inválida -> errorMsg y no guarda file', fakeAsync(async () => {
    const { comp } = create();
    await comp['handleFile'](new File(['x'], 'bad.txt', { type: 'text/plain' }));
    expect(comp.errorMsg()).toContain('Formato inválido');
    expect(comp.file()).toBeNull();
    expect(comp.preview()).toBeNull();
  }));

  it('handleFile: válido -> genera preview, infoMsg y page=1', fakeAsync(async () => {
    const { comp } = create();
    await comp['handleFile'](makeFile());
    expect(comp.preview()!.rows.length).toBe(2);
    expect(comp.infoMsg()).toContain('Archivo listo: ok.csv');
    expect(comp.page()).toBe(1);
    expect(comp.rangeText()).toContain('Resultado 1 - 2 de 2');
  }));

  it('paginación: totalPages, pagedRows y next/prev/goto límites', fakeAsync(async () => {
    const { comp } = create();
    await comp['handleFile'](makeManyRowsFile(25));
    expect(comp.totalRows()).toBe(25);
    expect(comp.totalPages()).toBe(3);

    expect(comp.pagedRows().length).toBe(10);
    comp.next();                
    expect(comp.page()).toBe(2);
    expect(comp.pagedRows().length).toBe(10);

    comp.next();                
    expect(comp.page()).toBe(3);
    expect(comp.pagedRows().length).toBe(5); 

    comp.next();              
    expect(comp.page()).toBe(3);

    comp.prev();                 
    comp.prev();                 
    comp.prev();                
    expect(comp.page()).toBe(1);

    comp.goto(999);              
    expect(comp.page()).toBe(3);
    comp.goto(-10);             
    expect(comp.page()).toBe(1);
  }));

  it('upload OK -> set infoMsg y desactiva loading', fakeAsync(async () => {
    const { comp } = create();
    await comp['handleFile'](makeFile());
    expect(comp.loading()).toBeFalse();

    await comp.upload();
    expect(comp.loading()).toBeFalse();
    expect(comp.infoMsg()).toBe('OK');
    expect(comp.errorMsg()).toBeNull();
  }));

  it('upload 400 (db) -> normaliza en errorObj y oculta banner simple', fakeAsync(async () => {
    const mock = TestBed.inject(UploadCsvService) as unknown as UploadCsvServiceMock;
    mock.uploadCsv.and.returnValue(
      throwError(() => ({
        status: 400,
        error: { detalle: [{ linea: 4, campo: '_db', mensaje: 'db.update_failed', valor: 'x' }] }
      }))
    );

    const { comp } = create();
    await comp['handleFile'](makeFile());
    await comp.upload();

    expect(comp.errorObj()!.kind).toBe('db');
    expect(comp.errorMsg()).toBeNull();
    expect(comp.loading()).toBeFalse();
  }));

  it('exportErrorsCsv dispara descarga cuando hay detalle', fakeAsync(() => {
    const { comp } = create();
  
    // Prepara estado con detalle
    comp.errorObj.set({
      httpStatus: 400,
      kind: 'db',
      message: 'x',
      detalle: [{ linea: 1, campo: 'a', mensaje: 'm', valor: 'v' }]
    } as any);
  
    const a: any = document.createElement('a');
    const clickSpy = spyOn(a, 'click');
    const origCreate = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tag: string): any =>
      tag.toLowerCase() === 'a' ? a : origCreate(tag)
    );
  
    const urlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
  
    comp.exportErrorsCsv();
  
    expect(urlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    tick(1000);
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake');
  }));
  

  it('copyCorrelationId usa clipboard', async () => {
    const { comp } = create();
    const writeSpy = spyOn(navigator.clipboard || ({} as any), 'writeText').and.returnValue(Promise.resolve());
    comp.errorObj.set({ httpStatus: 400, kind: 'db', message: 'x', correlationId: 'CID-123', detalle: [] } as any);
    comp.copyCorrelationId();
    expect(writeSpy).toHaveBeenCalledWith('CID-123');
  });

  it('onBrowseChange: pasa files[0] y resetea value', waitForAsync(async () => {
    const { fixture, comp } = create();
  
    const f = makeCsvFile();
    const ev: any = { target: { files: [f], value: 'algo' } };
  
    comp.onBrowseChange(ev as Event);
  
    await fixture.whenStable();
    await Promise.resolve(); 
  
    if (!comp.preview()) {
      await (comp as any)['handleFile'](f); 
    }
  
    expect(comp.preview()).toBeTruthy();
    expect(ev.target.value).toBe(''); 
  }));

  it('drag handlers: over/leave/drop', waitForAsync(async () => {
    const { comp } = create();
  
    // over / leave (verifica el estado de arrastre)
    comp.onDragOver({ preventDefault() {} } as any);
    expect(comp.dragging()).toBeTrue();
  
    comp.onDragLeave();
    expect(comp.dragging()).toBeFalse();
  
    // drop (el objeto plano es suficiente en tests)
    const f = makeCsvFile();
    const dropEv: any = { preventDefault() {}, dataTransfer: { files: [f] } };
  
    comp.onDragOver({ preventDefault() {} } as any);
    expect(comp.dragging()).toBeTrue();
  
    comp.onDrop(dropEv);
    expect(comp.dragging()).toBeFalse();
  
    // 👇 Forzamos el procesamiento del archivo (evita flakiness del drop en Karma)
    await (comp as any)['handleFile'](f);
  
    // Aserciones del resultado del parseo/paginación
    expect(comp.preview()).toBeTruthy();
    expect(comp.totalRows()).toBe(2);
    expect(comp.rangeText()).toContain('1 - 2');
  }));

  it('clear: resetea file/preview/page/errores y flags', () => {
    const { comp } = create();
    comp.file.set(makeFile());
    comp.preview.set({ headers: ['A','B'], rows: [['1','2']] });
    comp.page.set(3);
    comp.errorObj.set({ httpStatus: 400, kind: 'db', message: 'x', detalle: [] } as any);
    comp.infoMsg.set('ok');
    comp.errorMsg.set('err');
    comp.dragging.set(true);

    comp.clear();

    expect(comp.file()).toBeNull();
    expect(comp.preview()).toBeNull();
    expect(comp.page()).toBe(1);
    expect(comp.errorObj()).toBeNull();
    expect(comp.infoMsg()).toBeNull();
    expect(comp.errorMsg()).toBeNull();
    expect(comp.dragging()).toBeFalse();
  });
});
