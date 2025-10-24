import { fakeAsync, tick } from '@angular/core/testing';
import { normalizeApiError, downloadErroresCsv } from './error-normalizer';

describe('normalizeApiError', () => {
  it('status 0 -> kind network', () => {
    const n = normalizeApiError({ status: 0 });
    expect(n.kind).toBe('network');
    expect(n.message).toContain('Error de red');
  });

  it('extensión .csv -> kind extension', () => {
    const err = {
      status: 400,
      error: {
        detalle: [
          { linea: 0, campo: '_archivo', mensaje: 'El archivo debe tener extensión .csv.', valor: null },
        ],
      },
    };
    const n = normalizeApiError(err);
    expect(n.kind).toBe('extension');
    expect(n.message).toBe('El archivo debe tener extensión .csv.');
  });

  it('cabeceras inválidas con delimitador distinto -> calcula faltantes/extras + hint', () => {
    const msg =
      'Cabeceras inválidas. Esperado: Apellidos,Nombres,NroDocum. Recibido: Apellidos;NroDocum;Contrato';
    const err = {
      status: 400,
      error: { detalle: [{ linea: 0, campo: '_archivo', mensaje: msg, valor: null }] },
    };
    const n = normalizeApiError(err);
    expect(n.kind).toBe('headers');
    expect(n.headerExpected).toEqual(['Apellidos', 'Nombres', 'NroDocum']);
    expect(n.headerReceived).toEqual(['Apellidos', 'NroDocum', 'Contrato']);
    expect(n.headerMissing).toContain('Nombres');
    expect(n.headerExtra).toContain('Contrato');
    expect(n.delimiterHint).toBeDefined();
  });

  it('errores _db -> kind db', () => {
    const err = {
      status: 400,
      error: { detalle: [{ linea: 4, campo: '_db', mensaje: 'x', valor: 'y' }] },
    };
    const n = normalizeApiError(err);
    expect(n.kind).toBe('db');
    expect(n.detalle.length).toBe(1);
  });

  it('desconocido -> kind unknown (usa body.message si existe)', () => {
    const err = { status: 400, error: { message: 'otro error' } };
    const n = normalizeApiError(err);
    expect(n.kind).toBe('unknown');
    expect(n.message).toBe('otro error');
  });
});

describe('downloadErroresCsv', () => {
    it('genera el CSV, hace click y revoca el URL', fakeAsync(() => {
      // Anchor simulado SOLO cuando se pide un <a>
      const a: any = document.createElement('a');
      const clickSpy = spyOn(a, 'click');
      const origCreate = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake((tag: string): any =>
        tag.toLowerCase() === 'a' ? a : origCreate(tag)
      );
  
      const urlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
      const revokeSpy = spyOn(URL, 'revokeObjectURL');
  
      downloadErroresCsv(
        [
          { linea: 1, campo: 'A', mensaje: 'm1', valor: 'v1' },
          { linea: 2, campo: 'B', mensaje: 'm2', valor: 'v2' },
        ],
        'errores.csv'
      );
  
      expect(urlSpy).toHaveBeenCalled();   // se creó el Blob URL
      expect(clickSpy).toHaveBeenCalled(); // se disparó la descarga
  
      // El util usa setTimeout(..., 1000)
      tick(1000);
      expect(revokeSpy).toHaveBeenCalledWith('blob:fake');
    }));
  });