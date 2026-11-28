import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { DisasterEvent, GeoLocation, Item, Warehouse } from '../../../core/models/models';
import { CatalogService } from '../../../core/services/catalog.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker.component';

type CatalogTab = 'events' | 'warehouses' | 'items';
type EventType = 'Storm' | 'Flood' | 'Landslide';
type EventRow = DisasterEvent & { type?: EventType };
type ItemRow = Item & { category?: string; perishable?: boolean };

@Component({
  selector: 'app-admin-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    EmptyStateComponent,
    InputTextModule,
    MapPickerComponent,
    SelectModule,
    TableModule,
    TabsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-catalog.component.html',
  styleUrl: './admin-catalog.component.scss'
})
export class AdminCatalogComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  activeTab: CatalogTab = 'events';
  dialogVisible = false;
  editingId: string | null = null;
  saving = false;
  deletingId: string | null = null;

  events: EventRow[] = [];
  warehouses: Warehouse[] = [];
  items: ItemRow[] = [];

  readonly loading: Record<CatalogTab, boolean> = { events: true, warehouses: true, items: true };
  readonly loadErrors: Record<CatalogTab, boolean> = { events: false, warehouses: false, items: false };

  readonly eventTypes = [
    { label: 'Bão', value: 'Storm' as const },
    { label: 'Lũ lụt', value: 'Flood' as const },
    { label: 'Sạt lở', value: 'Landslide' as const }
  ];
  readonly activityOptions = [
    { label: 'Đang hoạt động', value: true },
    { label: 'Đã kết thúc', value: false }
  ];
  readonly warehouseActivityOptions = [
    { label: 'Hoạt động', value: true },
    { label: 'Tạm ngưng', value: false }
  ];

  readonly eventForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: this.fb.nonNullable.control<EventType>('Storm', Validators.required),
    description: [''],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    isActive: this.fb.nonNullable.control(true, Validators.required)
  });

  readonly warehouseForm = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    address: this.fb.nonNullable.control(''),
    location: this.fb.control<GeoLocation | null>(null, Validators.required),
    isActive: this.fb.nonNullable.control(true, Validators.required)
  });

  readonly itemForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    unit: ['', Validators.required],
    perishable: this.fb.nonNullable.control(false)
  });

  ngOnInit(): void {
    this.loadEvents();
    this.loadWarehouses();
    this.loadItems();
  }

  get dialogTitle(): string {
    const action = this.editingId ? 'Cập nhật' : 'Thêm mới';
    const labels: Record<CatalogTab, string> = {
      events: 'sự kiện',
      warehouses: 'kho hàng',
      items: 'vật tư'
    };
    return `${action} ${labels[this.activeTab]}`;
  }

  setActiveTab(value: string | number): void {
    if (value === 'events' || value === 'warehouses' || value === 'items') {
      this.activeTab = value;
    }
  }

  openCreateDialog(): void {
    this.editingId = null;
    this.eventForm.reset({
      name: '',
      type: 'Storm',
      description: '',
      startTime: '',
      endTime: '',
      isActive: true
    });
    this.warehouseForm.reset({ name: '', address: '', location: null, isActive: true });
    this.itemForm.reset({ name: '', category: '', unit: '', perishable: false });
    this.dialogVisible = true;
  }

  editEvent(event: EventRow): void {
    this.editingId = event.id;
    this.eventForm.reset({
      name: event.name,
      type: event.type ?? 'Storm',
      description: event.description ?? '',
      startTime: this.toLocalDateTime(event.startTime),
      endTime: this.toLocalDateTime(event.endTime),
      isActive: event.isActive ?? true
    });
    this.dialogVisible = true;
  }

  editWarehouse(warehouse: Warehouse): void {
    this.editingId = warehouse.id;
    this.warehouseForm.reset({
      name: warehouse.name,
      address: warehouse.address ?? '',
      location: warehouse.location ?? null,
      isActive: warehouse.isActive ?? true
    });
    this.dialogVisible = true;
  }

  editItem(item: ItemRow): void {
    this.editingId = item.id;
    this.itemForm.reset({
      name: item.name,
      category: item.category ?? '',
      unit: item.unit,
      perishable: item.perishable ?? false
    });
    this.dialogVisible = true;
  }

  saveCatalogEntry(): void {
    const form = this.getActiveForm();
    if (form.invalid || this.saving) {
      form.markAllAsTouched();
      return;
    }

    this.saving = true;
    switch (this.activeTab) {
      case 'events': {
        const values = this.eventForm.getRawValue();
        const payload: EventRow = {
          id: this.editingId ?? '',
          name: values.name.trim(),
          type: values.type,
          description: values.description.trim(),
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          isActive: values.isActive
        };
        const request = this.editingId
          ? this.catalog.updateEvent(this.editingId, payload)
          : this.catalog.createEvent(payload);
        request.subscribe({
          next: () => this.finishSave('Sự kiện đã được lưu.', 'events'),
          error: (error: unknown) => this.handleSaveError(error)
        });
        break;
      }
      case 'warehouses': {
        const values = this.warehouseForm.getRawValue();
        if (!values.location) {
          this.saving = false;
          this.warehouseForm.controls.location.markAsTouched();
          return;
        }
        const payload: Warehouse = {
          id: this.editingId ?? '',
          name: values.name.trim(),
          address: values.address.trim() || null,
          location: values.location,
          isActive: values.isActive
        };
        const request = this.editingId
          ? this.catalog.updateWarehouse(this.editingId, payload)
          : this.catalog.createWarehouse(payload);
        request.subscribe({
          next: () => this.finishSave('Kho hàng đã được lưu.', 'warehouses'),
          error: (error: unknown) => this.handleSaveError(error)
        });
        break;
      }
      case 'items': {
        const values = this.itemForm.getRawValue();
        const payload: ItemRow = {
          id: this.editingId ?? '',
          name: values.name.trim(),
          category: values.category.trim(),
          unit: values.unit.trim(),
          perishable: values.perishable
        };
        const request = this.editingId
          ? this.catalog.updateItem(this.editingId, payload)
          : this.catalog.createItem(payload);
        request.subscribe({
          next: () => this.finishSave('Vật tư đã được lưu.', 'items'),
          error: (error: unknown) => this.handleSaveError(error)
        });
        break;
      }
    }
  }

  confirmDelete(tab: CatalogTab, id: string, name: string): void {
    this.confirmation.confirm({
      header: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa “${name}”? Thao tác này không thể hoàn tác.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCatalogEntry(tab, id)
    });
  }

  onLocationChange(location: GeoLocation): void {
    this.warehouseForm.controls.location.setValue(location);
    this.warehouseForm.controls.location.markAsTouched();
  }

  formatEventType(type?: EventType): string {
    return this.eventTypes.find((option) => option.value === type)?.label ?? 'Chưa phân loại';
  }

  retry(tab: CatalogTab): void {
    if (tab === 'events') this.loadEvents();
    if (tab === 'warehouses') this.loadWarehouses();
    if (tab === 'items') this.loadItems();
  }

  private getActiveForm() {
    switch (this.activeTab) {
      case 'events': return this.eventForm;
      case 'warehouses': return this.warehouseForm;
      case 'items': return this.itemForm;
    }
  }

  private loadEvents(): void {
    this.loading.events = true;
    this.loadErrors.events = false;
    this.catalog.events().subscribe({
      next: (events) => { this.events = events; this.loading.events = false; },
      error: (error: unknown) => this.handleLoadError('events', error)
    });
  }

  private loadWarehouses(): void {
    this.loading.warehouses = true;
    this.loadErrors.warehouses = false;
    this.catalog.warehouses().subscribe({
      next: (warehouses) => { this.warehouses = warehouses; this.loading.warehouses = false; },
      error: (error: unknown) => this.handleLoadError('warehouses', error)
    });
  }

  private loadItems(): void {
    this.loading.items = true;
    this.loadErrors.items = false;
    this.catalog.items().subscribe({
      next: (items) => { this.items = items; this.loading.items = false; },
      error: (error: unknown) => this.handleLoadError('items', error)
    });
  }

  private deleteCatalogEntry(tab: CatalogTab, id: string): void {
    if (this.deletingId) return;
    this.deletingId = id;
    const request = tab === 'events'
      ? this.catalog.deleteEvent(id)
      : tab === 'warehouses'
        ? this.catalog.deleteWarehouse(id)
        : this.catalog.deleteItem(id);
    request.subscribe({
      next: () => {
        this.deletingId = null;
        this.messages.add({ severity: 'success', summary: 'Đã xóa', detail: 'Dữ liệu đã được xóa.' });
        this.retry(tab);
      },
      error: (error: unknown) => {
        this.deletingId = null;
        this.showError('Không thể xóa dữ liệu', error);
      }
    });
  }

  private finishSave(detail: string, tab: CatalogTab): void {
    this.saving = false;
    this.dialogVisible = false;
    this.messages.add({ severity: 'success', summary: 'Thành công', detail });
    this.retry(tab);
  }

  private handleSaveError(error: unknown): void {
    this.saving = false;
    this.showError('Không thể lưu dữ liệu', error);
  }

  private handleLoadError(tab: CatalogTab, error: unknown): void {
    this.loading[tab] = false;
    this.loadErrors[tab] = true;
    this.showError('Không tải được dữ liệu', error);
  }

  private showError(summary: string, error: unknown): void {
    this.messages.add({ severity: 'error', summary, detail: extractErrorMessage(error) });
  }

  private toLocalDateTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.slice(0, 16);
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
