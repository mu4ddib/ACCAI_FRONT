import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => 
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const fallback = {
        code: 'UNEXPECTED_ERROR',
        message: 'Ocurrió un error inesperado. Intenta nuevamente.',
      };
      
      const body = (err?.error ?? {}) as any;
      const normalized = {
        code: body?.code ?? `HTTP_${err.status || 'ERROR'}`,
        message: body?.message || body?.title || fallback.message,
        correlationId: body?.cid || body?.correlationId,
        details: body?.errors || body,
      };

      return throwError(() => normalized);
    })
  );
