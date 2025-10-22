import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResult, ProcessResponseDto, ValidationResponseDto } from '../../core/models/fp-changes.models';

@Injectable({ providedIn: 'root' })
export class UploadCsvService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/fp-changes`; // 👈 con guion

  validateCsv(file: File): Observable<ValidationResponseDto> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ValidationResponseDto>(`${this.baseUrl}/validate`, form).pipe(
      catchError((err: HttpErrorResponse) =>
        err.status === 400 && err.error ? of(err.error as ValidationResponseDto)
                                        : throwError(() => err)
      )
    );
  }

  uploadCsv(file: File): Observable<ApiResult<ProcessResponseDto>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ApiResult<ProcessResponseDto>>(`${this.baseUrl}/upload`, form).pipe(
      catchError((err: HttpErrorResponse) =>
        err.status === 400 && err.error ? of(err.error as ApiResult<ProcessResponseDto>)
                                        : throwError(() => err)
      )
    );
  }
}
