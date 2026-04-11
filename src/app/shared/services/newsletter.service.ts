import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private apiUrl = `${environment.baseUrl}/api/v1/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email });
  }
}
