export interface BackendDetalle {
    linea: number;
    campo: string;
    mensaje: string;
    valor: string | null;
  }
  
  export interface BackendValidationError {
    totalFilas?: number;
    errores?: number;
    correlationId?: string;
    detalle?: BackendDetalle[];
    message?: string;
    code?: string;
  }
  
  export type ErrorKind = 'extension' | 'headers' | 'db' | 'network' | 'unknown';
  
  export interface NormalizedError {
    httpStatus: number;
    kind: ErrorKind;
    message: string;
    correlationId?: string;
    totalFilas?: number;
    errores?: number;
    detalle: BackendDetalle[];
  
    headerExpected?: string[];
    headerReceived?: string[];
    headerMissing?: string[];
    headerExtra?: string[];
    delimiterHint?: string; 
  }
  