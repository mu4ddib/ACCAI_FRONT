import { BackendValidationError, NormalizedError } from "../../core/interfaces/api-error.interfaces";


function unique(arr: string[]) { return Array.from(new Set(arr)); }
function splitByDelim(s: string) {
  const delim = s.includes(';') && !s.includes(',') ? ';' : ',';
  return { delim, parts: unique(s.split(delim).map(x => x.trim()).filter(Boolean)) };
}

export function normalizeApiError(err: any): NormalizedError {
  const status = typeof err?.status === 'number' ? err.status : -1;
  const body = (err?.error ?? err?.raw ?? err ?? {}) as BackendValidationError;

  if (status === 0) {
    return {
      httpStatus: 0,
      kind: 'network',
      message: 'Error de red. Intenta nuevamente en unos minutos.',
      detalle: [],
    };
  }

  const detalle = Array.isArray((body as any)?.detalle) ? (body as any).detalle! : [];
  const cid = (body as any)?.correlationId ?? (err?.correlationId);
  const totalFilas = (body as any)?.totalFilas;
  const errores = (body as any)?.errores;

  const firstMsg = detalle?.[0]?.mensaje ?? body?.message ?? '';
  if (detalle?.[0]?.campo === '_archivo' && /extensi[oó]n\s*.csv/i.test(firstMsg)) {
    return {
      httpStatus: status,
      kind: 'extension',
      message: 'El archivo debe tener extensión .csv.',
      correlationId: cid, detalle, totalFilas, errores,
    };
  }

  // 2) CABECERAS
  if (detalle?.[0]?.campo === '_archivo' && /cabeceras inválidas/i.test(firstMsg)) {
    // Buscar "Esperado: ... Recibido: ..."
    const m = firstMsg.match(/Esperado:\s*([^.]*)\.?\s*Recibido:\s*(.*)$/i);
    let headerExpected: string[] | undefined;
    let headerReceived: string[] | undefined;
    let headerMissing: string[] | undefined;
    let headerExtra: string[] | undefined;
    let delimiterHint: string | undefined;

    if (m) {
      const exp = splitByDelim(m[1] ?? '');
      const rec = splitByDelim(m[2] ?? '');
      headerExpected = exp.parts;
      headerReceived = rec.parts;
      headerMissing = exp.parts.filter(h => !rec.parts.includes(h));
      headerExtra = rec.parts.filter(h => !exp.parts.includes(h));
      if (exp.delim !== rec.delim) {
        delimiterHint = `Usa "${exp.delim}" como separador. Tu archivo usa "${rec.delim}".`;
      }
    }

    return {
      httpStatus: status,
      kind: 'headers',
      message: 'Cabeceras inválidas. Revisa las columnas del CSV.',
      correlationId: cid, detalle, totalFilas, errores,
      headerExpected, headerReceived, headerMissing, headerExtra, delimiterHint,
    };
  }

  if (detalle?.some((d: { campo: string; }) => d.campo === '_db')) {
    return {
      httpStatus: status,
      kind: 'db',
      message: `Se presentaron errores de actualización en ${detalle.length} línea(s).`,
      correlationId: cid, detalle, totalFilas, errores,
    };
  }

  return {
    httpStatus: status,
    kind: 'unknown',
    message: firstMsg || 'Ocurrió un error inesperado. Intenta nuevamente.',
    correlationId: cid, detalle, totalFilas, errores,
  };
}

export function downloadErroresCsv(detalle: { linea: number; campo: string; mensaje: string; valor: any }[], filename = 'errores.csv') {
  const head = ['linea','campo','mensaje','valor'];
  const rows = detalle.map(d => [d.linea, d.campo, (d.mensaje ?? '').replace(/\s+/g, ' '), d.valor ?? '']);
  const csv = [head, ...rows].map(r =>
    r.map(v => {
      const s = String(v ?? '');
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
