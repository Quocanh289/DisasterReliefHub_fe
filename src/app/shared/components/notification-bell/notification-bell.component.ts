import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/models';
import { extractErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a class="bell" routerLink="/notifications" aria-label="Mở thông báo">
      <i class="pi pi-bell" aria-hidden="true"></i>
      <span class="count" *ngIf="unreadCount">{{ unreadCount }}</span>
    </a>
  `,
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  unreadCount = 0;

  ngOnInit(): void {
    this.notifications.mine().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items: NotificationItem[]) => {
        this.unreadCount = items.filter((item) => !item.isRead).length;
      },
      error: (error: unknown) => this.messages.add({
        severity: 'error',
        summary: 'Không tải được thông báo',
        detail: extractErrorMessage(error)
      })
    });
  }
}
