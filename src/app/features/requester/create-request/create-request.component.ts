import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CatalogService } from '../../../core/services/catalog.service';
import { ReliefRequestService } from '../../../core/services/relief-request.service';
import { CreateReliefRequestDto, DisasterEvent, GeoLocation, Item } from '../../../core/models/models';
import { extractErrorMessage } from '../../../core/utils/api-error.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker.component';
import { UrgencyBadgeComponent } from '../../../shared/components/urgency-badge/urgency-badge.component';

const integerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  Number.isInteger(Number(control.value)) ? null : { integer: true };

type RequestItemGroup = FormGroup<{
  itemId: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    EmptyStateComponent,
    InputNumberModule,
    MapPickerComponent,
    SelectModule,
    UrgencyBadgeComponent
  ],
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss'
})
export class CreateRequestComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly reliefRequests = inject(ReliefRequestService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  events: DisasterEvent[] = [];
  items: Item[] = [];
  eventsLoading = true;
  itemsLoading = true;
  eventsError = false;
  itemsError = false;
  submitting = false;
  locating = false;
  selectedLocation: GeoLocation | null = null;
  readonly urgencyLevels = [1, 2, 3, 4, 5] as const;

  readonly form = this.fb.group({
    phone: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\+?[0-9]{9,15}$/)
    ]),
    eventId: this.fb.control<string | null>(null),
    urgency: this.fb.nonNullable.control<1 | 2 | 3 | 4 | 5>(3, [
      Validators.required,
      Validators.min(1),
      Validators.max(5)
    ]),
    affectedPeople: this.fb.nonNullable.control(1, [
      Validators.required,
      Validators.min(1),
      integerValidator
    ]),
    longitude: this.fb.control<number | null>(null, Validators.required),
    latitude: this.fb.control<number | null>(null, Validators.required),
    items: this.fb.array<RequestItemGroup>([this.createItemRow()], Validators.minLength(1))
  });

  constructor() {
    this.loadEvents();
    this.loadItems();
  }

  get itemRows(): FormArray<RequestItemGroup> {
    return this.form.controls.items;
  }

  get locationControlInvalid(): boolean {
    return (this.form.controls.longitude.invalid || this.form.controls.latitude.invalid)
      && (this.form.controls.longitude.touched || this.form.controls.latitude.touched);
  }

  loadEvents(): void {
    this.eventsLoading = true;
    this.eventsError = false;
    this.catalog.events().subscribe({
      next: (events) => {
        this.events = events;
        this.eventsLoading = false;
      },
      error: (error: unknown) => {
        this.eventsLoading = false;
        this.eventsError = true;
        this.showError('Không tải được danh sách sự kiện', error);
      }
    });
  }

  loadItems(): void {
    this.itemsLoading = true;
    this.itemsError = false;
    this.catalog.items().subscribe({
      next: (items) => {
        this.items = items;
        this.itemsLoading = false;
      },
      error: (error: unknown) => {
        this.itemsLoading = false;
        this.itemsError = true;
        this.showError('Không tải được danh mục vật tư', error);
      }
    });
  }

  itemOptionsFor(rowIndex: number): Array<{ id: string; label: string }> {
    const currentItemId = this.itemRows.at(rowIndex).controls.itemId.value;
    const selectedItemIds = new Set(
      this.itemRows.controls
        .filter((_, index) => index !== rowIndex)
        .map((row) => row.controls.itemId.value)
        .filter((itemId) => itemId.length > 0)
    );
    return this.items
      .filter((item) => item.id === currentItemId || !selectedItemIds.has(item.id))
      .map((item) => ({ id: item.id, label: `${item.name} (${item.unit})` }));
  }

  addItemRow(): void {
    const selectedItemIds = new Set(this.itemRows.controls.map((row) => row.controls.itemId.value));
    if (!this.items.some((item) => !selectedItemIds.has(item.id))) {
      this.messages.add({
        severity: 'warn',
        summary: 'Không còn vật tư để chọn',
        detail: 'Mỗi vật tư chỉ được chọn một lần trong yêu cầu.'
      });
      return;
    }
    this.itemRows.push(this.createItemRow());
  }

  removeItemRow(index: number): void {
    if (this.itemRows.length > 1) this.itemRows.removeAt(index);
  }

  setUrgency(level: 1 | 2 | 3 | 4 | 5): void {
    this.form.controls.urgency.setValue(level);
    this.form.controls.urgency.markAsTouched();
  }

  onLocationChange(location: GeoLocation): void {
    this.selectedLocation = location;
    this.form.patchValue({
      longitude: location.longitude,
      latitude: location.latitude
    });
    this.form.controls.longitude.markAsTouched();
    this.form.controls.latitude.markAsTouched();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.messages.add({
        severity: 'error',
        summary: 'Không hỗ trợ định vị',
        detail: 'Trình duyệt này không cung cấp dịch vụ định vị.'
      });
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locating = false;
        this.onLocationChange({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        });
      },
      (error) => {
        this.locating = false;
        const detail = error.code === error.PERMISSION_DENIED
          ? 'Vui lòng cho phép trình duyệt truy cập vị trí hoặc chọn điểm trực tiếp trên bản đồ.'
          : 'Không lấy được vị trí hiện tại. Vui lòng thử lại hoặc chọn điểm trên bản đồ.';
        this.messages.add({ severity: 'error', summary: 'Không lấy được vị trí', detail });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  submit(): void {
    if (this.form.invalid || this.submitting || this.eventsLoading || this.itemsLoading) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const itemIds = values.items.map((item) => item.itemId);
    if (itemIds.some((itemId) => !itemId) || new Set(itemIds).size !== itemIds.length) {
      this.form.controls.items.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Kiểm tra danh sách vật tư',
        detail: 'Chọn ít nhất một vật tư và không chọn trùng vật tư.'
      });
      return;
    }
    if (values.longitude === null || values.latitude === null) {
      this.form.controls.longitude.markAsTouched();
      this.form.controls.latitude.markAsTouched();
      return;
    }

    const payload: CreateReliefRequestDto = {
      phone: values.phone.trim(),
      eventId: values.eventId || null,
      urgency: values.urgency,
      affectedPeople: values.affectedPeople,
      longitude: values.longitude,
      latitude: values.latitude,
      items: values.items.map(({ itemId, quantity }) => ({ itemId, quantity }))
    };

    this.submitting = true;
    this.reliefRequests.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.messages.add({
          severity: 'success',
          summary: 'Đã gửi yêu cầu',
          detail: 'Yêu cầu của bạn đang được tiếp nhận.'
        });
        void this.router.navigate(['/requester/my']);
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.showError('Không gửi được yêu cầu', error);
      }
    });
  }

  private createItemRow(): RequestItemGroup {
    return this.fb.nonNullable.group({
      itemId: ['', Validators.required],
      quantity: this.fb.nonNullable.control(1, [
        Validators.required,
        Validators.min(1),
        integerValidator
      ])
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
