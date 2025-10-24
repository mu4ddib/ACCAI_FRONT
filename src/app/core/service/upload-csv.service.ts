import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResult, ProcessResponseDto, ValidationResponseDto } from '../../core/models/fp-changes.models';

@Injectable({ providedIn: 'root' })
export class UploadCsvService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/fp-changes`;

  uploadCsv(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ApiResult<ProcessResponseDto>>(`${this.baseUrl}/upload`, form);
  }

  validateCsv(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ValidationResponseDto>(`${this.baseUrl}/validate`, form);
  }
}
