import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssignmentResponse, CreateAssignmentDto, UpdateAssignmentStatusDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  constructor(private http: HttpClient) {}
  create(body: CreateAssignmentDto): Observable<AssignmentResponse> { return this.http.post<AssignmentResponse>(`${environment.apiUrl}/assignments`, body); }
  mine(): Observable<AssignmentResponse[]> { return this.http.get<AssignmentResponse[]>(`${environment.apiUrl}/assignments/mine`); }
  updateStatus(id: string, body: UpdateAssignmentStatusDto): Observable<AssignmentResponse> { return this.http.patch<AssignmentResponse>(`${environment.apiUrl}/assignments/${id}/status`, body); }
}
