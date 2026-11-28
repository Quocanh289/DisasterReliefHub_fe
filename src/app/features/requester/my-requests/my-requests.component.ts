import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { ReliefRequestItemResponse, ReliefRequestResponse } from '../../../core/models/models';
import { ReliefRequestService } from '../../../core/services/relief-request.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { UrgencyBadgeComponent } from '../../../shared/components/urgency-badge/urgency-badge.component';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    EmptyStateComponent,
    StatusTagComponent,
    TableModule,
    UrgencyBadgeComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit {
  private readonly reliefRequests = inject(ReliefRequestService);
  private readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);

  requests: ReliefRequestResponse[] = [];
  loading = true;
  loadError = false;
  cancellingId: string | null = null;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.loadError = false;
    this.reliefRequests.mine().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.loadError = true;
        this.showError('Không tải được yêu cầu của bạn', error);
      }
    });
  }

  requestCancellation(request: ReliefRequestResponse): void {
    if (request.status !== 'Pending' || this.cancellingId) return;
    this.confirmation.confirm({
      header: 'Hủy yêu cầu cứu trợ',
      message: 'Bạn có chắc muốn hủy yêu cầu này? Yêu cầu chỉ có thể hủy khi đang chờ xử lý.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hủy yêu cầu',
      rejectLabel: 'Giữ lại',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelRequest(request.id)
    });
  }

  itemProgressPercent(item: ReliefRequestItemResponse): number {
    if (item.quantityNeeded <= 0) return 0;
    return Math.min(100, Math.max(0, (item.quantityFulfilled / item.quantityNeeded) * 100));
  }

  newRequest(): void {
    void this.router.navigate(['/requester/new']);
  }

  private cancelRequest(id: string): void {
    if (this.cancellingId) return;
    this.cancellingId = id;
    this.reliefRequests.cancel(id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.messages.add({
          severity: 'success',
          summary: 'Đã hủy yêu cầu',
          detail: 'Trạng thái yêu cầu đã được cập nhật.'
        });
        this.loadRequests();
      },
      error: (error: unknown) => {
        this.cancellingId = null;
        this.showError('Không thể hủy yêu cầu', error);
      }
    });
  }

  private showError(summary: string, error: unknown): void {
    this.messages.add({
      severity: 'error',
      summary,
      detail: extractErrorMessage(error)
    });
  }
}
