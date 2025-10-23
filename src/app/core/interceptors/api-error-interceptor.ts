import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const enriched = {
        status: err.status,
        error: err.error ?? {},
        correlationId: err?.error?.correlationId ?? err?.error?.cid,
      };
      return throwError(() => enriched);
    })
  );
