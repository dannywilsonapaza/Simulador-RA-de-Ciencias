import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, v as string);
      });
    }
    return this.http
      .get<T>(`${this.base}/${path}`, { params: httpParams })
      .pipe(catchError(this.handle));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.base}/${path}`, body)
      .pipe(catchError(this.handle));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.base}/${path}`, body)
      .pipe(catchError(this.handle));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.base}/${path}`)
      .pipe(catchError(this.handle));
  }

  private handle(error: HttpErrorResponse) {
    // Aquí puedes mapear errores del backend a algo usable
    return throwError(() => error);
  }
}
