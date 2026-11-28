import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { InventoryItem, Item, UpsertInventoryRequest, Warehouse } from '../../../core/models/models';
import { CatalogService } from '../../../core/services/catalog.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-inventories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    EmptyStateComponent,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule
  ],
  templateUrl: './inventories.component.html',
  styleUrl: './inventories.component.scss'
})
export class InventoriesComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly messages = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  warehouses: Warehouse[] = [];
  items: Item[] = [];
  inventories: InventoryItem[] = [];
  loadingWarehouses = true;
  loadingItems = true;
  loadingInventories = false;
  warehousesError = false;
  itemsError = false;
  inventoriesError = false;
  saving = false;
  dialogVisible = false;
  editingInventory: InventoryItem | null = null;

  readonly filterForm = this.fb.nonNullable.group({
    warehouseId: [''],
    searchTerm: ['']
  });

  readonly inventoryForm = this.fb.nonNullable.group({
    warehouseId: ['', Validators.required],
    itemId: ['', Validators.required],
    quantityOnHand: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    quantityCommitted: this.fb.nonNullable.control({ value: 0, disabled: true }),
    safetyStock: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)])
  });

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadItems();
  }

  get filteredInventories(): InventoryItem[] {
    const searchTerm = this.filterForm.controls.searchTerm.value.trim().toLocaleLowerCase();
    if (!searchTerm) return this.inventories;
    return this.inventories.filter((inventory) => inventory.itemName.toLocaleLowerCase().includes(searchTerm));
  }

  get availableItems(): Item[] {
    const warehouseId = this.filterForm.controls.warehouseId.value;
    const existingItemIds = new Set(
      this.inventories
        .filter((inventory) => inventory.warehouseId === warehouseId)
        .map((inventory) => inventory.itemId)
    );
    return this.items.filter((item) => !existingItemIds.has(item.id));
  }

  get selectedWarehouseName(): string {
    const warehouseId = this.filterForm.controls.warehouseId.value;
    return this.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? '';
  }

  onWarehouseChanged(warehouseId: string | null): void {
    if (!warehouseId) {
      this.inventories = [];
      this.loadingInventories = false;
      this.inventoriesError = false;
      return;
    }
    this.loadInventories(warehouseId);
  }

  loadWarehouses(): void {
    this.loadingWarehouses = true;
    this.warehousesError = false;
    this.catalog.warehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.loadingWarehouses = false;
        const selectedWarehouseId = this.filterForm.controls.warehouseId.value;
        if (selectedWarehouseId && warehouses.some((warehouse) => warehouse.id === selectedWarehouseId)) {
          this.loadInventories(selectedWarehouseId);
        } else if (warehouses.length > 0) {
          this.filterForm.controls.warehouseId.setValue(warehouses[0].id);
          this.loadInventories(warehouses[0].id);
        } else {
          this.inventories = [];
          this.loadingInventories = false;
        }
      },
      error: (error: unknown) => {
        this.loadingWarehouses = false;
        this.warehousesError = true;
        this.showError('Không tải được danh sách kho', error);
      }
    });
  }

  loadItems(): void {
    this.loadingItems = true;
    this.itemsError = false;
    this.catalog.items().subscribe({
      next: (items) => {
        this.items = items;
        this.loadingItems = false;
      },
      error: (error: unknown) => {
        this.loadingItems = false;
        this.itemsError = true;
        this.showError('Không tải được danh mục vật tư', error);
      }
    });
  }

  loadInventories(warehouseId = this.filterForm.controls.warehouseId.value): void {
    if (!warehouseId) return;
    this.loadingInventories = true;
    this.inventoriesError = false;
    this.catalog.inventories(warehouseId).subscribe({
      next: (inventories) => {
        this.inventories = inventories;
        this.loadingInventories = false;
      },
      error: (error: unknown) => {
        this.loadingInventories = false;
        this.inventoriesError = true;
        this.showError('Không tải được tồn kho', error);
      }
    });
  }

  openCreateDialog(): void {
    const warehouseId = this.filterForm.controls.warehouseId.value;
    if (!warehouseId) {
      this.messages.add({
        severity: 'warn',
        summary: 'Chưa chọn kho',
        detail: 'Vui lòng chọn kho hàng trước khi thêm tồn kho.'
      });
      return;
    }
    if (this.loadingItems || this.itemsError || this.availableItems.length === 0) {
      this.messages.add({
        severity: this.itemsError ? 'error' : 'warn',
        summary: this.itemsError ? 'Không tải được vật tư' : 'Không có vật tư mới',
        detail: this.itemsError
          ? 'Hãy tải lại danh mục vật tư rồi thử lại.'
          : 'Tất cả vật tư đã có tồn kho tại kho này.'
      });
      return;
    }

    this.editingInventory = null;
    this.inventoryForm.reset({
      warehouseId,
      itemId: '',
      quantityOnHand: 0,
      quantityCommitted: 0,
      safetyStock: 0
    });
    this.inventoryForm.controls.warehouseId.disable();
    this.inventoryForm.controls.itemId.enable();
    this.dialogVisible = true;
  }

  editInventory(inventory: InventoryItem): void {
    this.editingInventory = inventory;
    this.inventoryForm.reset({
      warehouseId: inventory.warehouseId,
      itemId: inventory.itemId,
      quantityOnHand: inventory.quantityOnHand,
      quantityCommitted: inventory.quantityCommitted,
      safetyStock: inventory.safetyStock
    });
    this.inventoryForm.controls.warehouseId.disable();
    this.inventoryForm.controls.itemId.disable();
    this.dialogVisible = true;
  }

  saveInventory(): void {
    if (this.inventoryForm.invalid || this.saving) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    const values = this.inventoryForm.getRawValue();
    const payload: UpsertInventoryRequest = {
      warehouseId: values.warehouseId,
      itemId: values.itemId,
      quantityOnHand: values.quantityOnHand,
      safetyStock: values.safetyStock
    };

    this.saving = true;
    this.catalog.upsertInventory(payload).subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messages.add({
          severity: 'success',
          summary: 'Đã cập nhật tồn kho',
          detail: 'Số lượng vật tư đã được lưu.'
        });
        this.loadInventories(payload.warehouseId);
      },
      error: (error: unknown) => {
        this.saving = false;
        this.showError('Không thể cập nhật tồn kho', error);
      }
    });
  }

  availabilityClass(available: number): string {
    if (available <= 0) return 'availability-danger';
    if (available <= 10) return 'availability-warning';
    return '';
  }

  private showError(summary: string, error: unknown): void {
    this.messages.add({
      severity: 'error',
      summary,
      detail: extractErrorMessage(error)
    });
  }
}
