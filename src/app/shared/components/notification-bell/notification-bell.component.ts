import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="bell" type="button" aria-label="Notifications">
      <span aria-hidden="true">Notifications</span>
      <span class="count" *ngIf="unreadCount">{{ unreadCount }}</span>
    </button>
  `,
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  private notifications = inject(NotificationService);
  unreadCount = 0;

  ngOnInit(): void {
    this.notifications.mine().subscribe((items: NotificationItem[]) => {
      this.unreadCount = items.filter((item) => !item.isRead).length;
    });
  }
}
