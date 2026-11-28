import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-catalog',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-card">
      <h1>Danh mục</h1>
      <p>Quản lý sự kiện thiên tai, kho cứu trợ và vật tư.</p>
      <nav class="catalog-links" aria-label="Danh mục quản trị">
        <a routerLink="/admin/events"><i class="pi pi-calendar"></i> Sự kiện</a>
        <a routerLink="/admin/warehouses"><i class="pi pi-building"></i> Kho cứu trợ</a>
        <a routerLink="/admin/items"><i class="pi pi-box"></i> Vật tư</a>
      </nav>
    </section>
  `,
  styles: [`
    .catalog-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    .catalog-links a { display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); background: var(--surface); }
    .catalog-links a:hover { color: var(--primary); border-color: var(--primary); }
  `]
})
export class AdminCatalogComponent {}
