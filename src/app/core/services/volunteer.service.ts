import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateVolunteerProfileRequest, UpdateVolunteerStatusRequest, VolunteerProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VolunteerService {
  constructor(private http: HttpClient) {}
  mine(): Observable<VolunteerProfile> { return this.http.get<VolunteerProfile>(`${environment.apiUrl}/volunteers/me`); }
  updateMine(body: UpdateVolunteerProfileRequest): Observable<VolunteerProfile> { return this.http.put<VolunteerProfile>(`${environment.apiUrl}/volunteers/me`, body); }
  updateStatus(status: UpdateVolunteerStatusRequest['status']): Observable<VolunteerProfile> { return this.http.patch<VolunteerProfile>(`${environment.apiUrl}/volunteers/me/status`, { status }); }
  list(): Observable<VolunteerProfile[]> { return this.http.get<VolunteerProfile[]>(`${environment.apiUrl}/volunteers`); }
}
