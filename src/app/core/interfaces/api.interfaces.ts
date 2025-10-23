// src/app/core/interfaces/api.interfaces.ts
export interface ApiMessage {
  code?: string;
  message: string;
}

export interface ApiResult<T> {
  ok: boolean;                  // o "success" si tu back lo llama así
  data?: T | null;
  message?: string | ApiMessage; // <- aquí está la “message” que usas
}

export interface ProcessResponseDto {
  totalFilas: number;
  errores: number;
  correlationId?: string;
  detalle: Array<{
    linea: number;
    campo: string;
    mensaje: string;
    valor: string | null;
  }>;
  // si el back también envía un mensaje dentro del dto, puedes agregar:
  // message?: string;
}
