import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-badge" [ngClass]="statusClass">{{ status }}</span>`,
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get statusClass(): string {
    return `status-${this.status.toLowerCase().replace(/[^a-z]/g, '')}`;
  }
}
