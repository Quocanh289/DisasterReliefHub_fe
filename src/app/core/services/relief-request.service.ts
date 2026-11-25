import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReliefRequestDto, ReliefRequestResponse } from '../models/relief-request.model';

@Injectable({ providedIn: 'root' })
export class ReliefRequestService {
  constructor(private http: HttpClient) {}
  mine(): Observable<ReliefRequestResponse[]> { return this.http.get<ReliefRequestResponse[]>(`${environment.apiUrl}/relief-requests/mine`); }
  list(): Observable<ReliefRequestResponse[]> { return this.http.get<ReliefRequestResponse[]>(`${environment.apiUrl}/relief-requests`); }
  create(body: CreateReliefRequestDto): Observable<ReliefRequestResponse> { return this.http.post<ReliefRequestResponse>(`${environment.apiUrl}/relief-requests`, body); }
  cancel(id: string): Observable<void> { return this.http.post<void>(`${environment.apiUrl}/relief-requests/${id}/cancel`, {}); }
}
