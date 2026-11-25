import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.model';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';

interface MenuItem { label: string; route: string }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, NotificationBellComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <a class="brand" routerLink="/">Disaster Relief Hub</a>
        <nav>
          <a *ngFor="let item of menu" [routerLink]="item.route" routerLinkActive="active">{{ item.label }}</a>
        </nav>
      </aside>
      <div class="content">
        <header class="topbar">
          <div *ngIf="user" class="identity">
            <strong>{{ user.fullName }}</strong>
            <span class="role">{{ user.role }}</span>
          </div>
          <app-notification-bell></app-notification-bell>
          <button type="button" (click)="logout()">Logout</button>
        </header>
        <main><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  user = this.auth.currentUser();
  menu: MenuItem[] = this.getMenu(this.user?.role);

  logout(): void {
    this.auth.logout();
  }

  private getMenu(role: UserRole | undefined): MenuItem[] {
    switch (role) {
      case 'Admin':
        return [
          { label: 'Events', route: '/admin/events' },
          { label: 'Items', route: '/admin/items' },
          { label: 'Warehouses', route: '/admin/warehouses' },
          { label: 'Inventories', route: '/admin/inventories' },
          { label: 'Coordination', route: '/coordinator/dashboard' }
        ];
      case 'Coordinator':
        return [
          { label: 'Coordination', route: '/coordinator/dashboard' },
          { label: 'Inventories', route: '/admin/inventories' }
        ];
      case 'Volunteer':
        return [
          { label: 'Profile', route: '/volunteer/profile' },
          { label: 'Tasks', route: '/volunteer/tasks' }
        ];
      case 'Requester':
        return [
          { label: 'My Requests', route: '/requester/requests' },
          { label: 'New Request', route: '/requester/requests/new' }
        ];
      default:
        return [];
    }
  }
}
