import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { extractErrorMessage } from '../../core/utils/api-error.util';
import { Role } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastModule, NotificationBellComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  menuOpen = false;
  activeEvent = 'Chưa có sự kiện đang hoạt động';

  get menu(): MenuItem[] {
    const role = this.auth.currentUser()?.role;
    const byRole: Record<Role, MenuItem[]> = {
      Requester: [
        { label: 'Tạo yêu cầu', icon: 'pi pi-plus-circle', route: '/requester/new' },
        { label: 'Yêu cầu của tôi', icon: 'pi pi-list', route: '/requester/my' }
      ],
      Volunteer: [
        { label: 'Nhiệm vụ của tôi', icon: 'pi pi-truck', route: '/volunteer/assignments' },
        { label: 'Hồ sơ cá nhân', icon: 'pi pi-user', route: '/volunteer/profile' }
      ],
      Coordinator: [
        { label: 'Yêu cầu cứu trợ', icon: 'pi pi-map-marker', route: '/coordinator/requests' },
        { label: 'Phân công', icon: 'pi pi-send', route: '/coordinator/assign' },
        { label: 'Tình nguyện viên', icon: 'pi pi-users', route: '/coordinator/volunteers' },
        { label: 'Tồn kho', icon: 'pi pi-box', route: '/admin/inventory' }
      ],
      Admin: [
        { label: 'Yêu cầu cứu trợ', icon: 'pi pi-map-marker', route: '/coordinator/requests' },
        { label: 'Phân công', icon: 'pi pi-send', route: '/coordinator/assign' },
        { label: 'Tình nguyện viên', icon: 'pi pi-users', route: '/coordinator/volunteers' },
        { label: 'Tồn kho', icon: 'pi pi-box', route: '/admin/inventory' },
        { label: 'Danh mục', icon: 'pi pi-cog', route: '/admin/catalog' }
      ]
    };
    return role ? byRole[role] : [];
  }

  ngOnInit(): void {
    this.catalog.events().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (events) => {
        this.activeEvent = events.find((event) => event.isActive)?.name
          ?? events[0]?.name
          ?? 'Chưa có sự kiện đang hoạt động';
      },
      error: (error: unknown) => this.messages.add({
        severity: 'error',
        summary: 'Không tải được sự kiện',
        detail: extractErrorMessage(error)
      })
    });
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout();
  }
}
