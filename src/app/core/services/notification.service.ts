import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationItem } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}
  mine(): Observable<NotificationItem[]> { return this.http.get<NotificationItem[]>(`${environment.apiUrl}/notifications/mine`); }
}
