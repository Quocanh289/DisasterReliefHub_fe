import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

type TagSeverity = 'info' | 'warn' | 'danger';

@Component({
  selector: 'app-urgency-badge',
  standalone: true,
  imports: [TagModule],
  template: '<p-tag [value]="label" [severity]="severity"></p-tag>'
})
export class UrgencyBadgeComponent {
  @Input({ required: true }) level: 1 | 2 | 3 | 4 | 5 = 1;

  get label(): string {
    return `Mức khẩn cấp ${this.level}`;
  }

  get severity(): TagSeverity {
    if (this.level <= 2) return 'info';
    return this.level === 3 ? 'warn' : 'danger';
  }
}
