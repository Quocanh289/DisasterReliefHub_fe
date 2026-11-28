import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  template: '<p-tag [value]="status" [severity]="severity"></p-tag>'
})
export class StatusTagComponent {
  @Input({ required: true }) status = '';

  get severity(): TagSeverity {
    switch (this.status) {
      case 'Pending':
        return 'info';
      case 'PartiallyAssigned':
      case 'Assigned':
      case 'Accepted':
      case 'InTransit':
      case 'Busy':
        return 'warn';
      case 'Fulfilled':
      case 'Delivered':
      case 'Available':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Cancelled':
      case 'Offline':
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}
