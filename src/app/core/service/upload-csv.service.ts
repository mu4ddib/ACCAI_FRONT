import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UploadCsvResponse } from '../interfaces/api.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadCsvService {
  private http = inject(HttpClient);

  private baseUrl = '/api/fpchanges'; 

  uploadCsv(file: File): Observable<UploadCsvResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<UploadCsvResponse>(`${this.baseUrl}/upload`, form);
  }
}
