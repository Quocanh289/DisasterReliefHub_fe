import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="empty-state" role="status">
      <i class="pi pi-inbox" aria-hidden="true"></i>
      <h2>{{ title }}</h2>
      <p *ngIf="description">{{ description }}</p>
    </section>
  `,
  styles: [`
    .empty-state { display: grid; justify-items: center; padding: 40px 20px; text-align: center; }
    .empty-state > i { color: var(--muted); font-size: 28px; }
    .empty-state h2 { margin: 12px 0 0; font-size: 16px; }
    .empty-state p { margin: 6px 0 0; color: var(--muted); }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Chưa có dữ liệu';
  @Input() description = '';
}
