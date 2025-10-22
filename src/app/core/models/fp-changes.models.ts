export interface ApiError {
    code: string;
    message: string;
    target?: string;
    line?: number | null;
    field?: string | null;
}
  
export interface ApiResult<T> {
    correlationId: string;
    ok: boolean;
    data?: T;
    errors: ApiError[];
}
  
export interface ProcessResponseDto {
    total: number;
    procesados: number;
    rechazados: number;
}
  
export interface ValidationResponseDto {
    totalFilas: number;
    errores: number;
    correlationId: string;
    detalle: { linea: number; campo: string; mensaje: string; valor?: string | null }[];
}
  