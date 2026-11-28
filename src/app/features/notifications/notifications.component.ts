import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { NotificationItem } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';
import { extractErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe, EmptyStateComponent],
  template: `
    <section class="page-card">
      <h1>Thông báo</h1>
      <p>Cập nhật mới nhất về yêu cầu và nhiệm vụ cứu trợ.</p>
    </section>

    <section class="notification-list" *ngIf="notifications.length; else empty">
      <article class="notification" *ngFor="let notification of notifications" [class.unread]="!notification.isRead">
        <span class="notification-icon"><i class="pi pi-bell" aria-hidden="true"></i></span>
        <div>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
          <time>{{ notification.createdAt | date: 'short' }}</time>
        </div>
      </article>
    </section>

    <ng-template #empty>
      <section class="page-card">
        <app-empty-state
          [title]="loading ? 'Đang tải thông báo…' : 'Bạn chưa có thông báo'"
          description="Các cập nhật mới sẽ xuất hiện tại đây."
        ></app-empty-state>
      </section>
    </ng-template>
  `,
  styles: [`
    .notification-list { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
    .notification { display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .notification:last-child { border-bottom: 0; }
    .notification.unread { background: #f8fbff; }
    .notification-icon { display: grid; width: 36px; height: 36px; flex: none; place-items: center; border-radius: 50%; color: var(--primary); background: var(--primary-soft); }
    .notification p { margin: 4px 0; color: var(--text); }
    .notification time { color: var(--muted); font-size: 12px; }
  `]
})
export class NotificationsComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  notifications: NotificationItem[] = [];
  loading = true;

  ngOnInit(): void {
    this.service.mine().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.messages.add({
          severity: 'error',
          summary: 'Không tải được thông báo',
          detail: extractErrorMessage(error)
        });
      }
    });
  }
}
