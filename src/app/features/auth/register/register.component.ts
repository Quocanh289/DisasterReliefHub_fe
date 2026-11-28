import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PublicRole } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, ToastModule],
  template: `
    <div class="auth-page">
      <aside class="auth-side">
        <a class="brand" routerLink="/" aria-label="ReliefHub - Trang chủ">
          <span class="brand-logo"><i class="pi pi-plus" aria-hidden="true"></i></span>
          <span>ReliefHub</span>
        </a>
        <div class="auth-intro">
          <h2>Tham gia cùng chúng tôi</h2>
          <p>Đăng ký để gửi yêu cầu cứu trợ hoặc trở thành tình nguyện viên.</p>
        </div>
        <div class="auth-copyright">© 2026 Nhóm 1</div>
      </aside>

      <main class="auth-form">
        <section class="auth-card">
          <h1>Tạo tài khoản</h1>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="auth-fields">
              <div class="field">
                <label for="register-name">Họ tên<span class="required">*</span></label>
                <input
                  id="register-name"
                  type="text"
                  formControlName="fullName"
                  autocomplete="name"
                  [class.invalid]="fullName.invalid && fullName.touched"
                  [attr.aria-invalid]="fullName.invalid && fullName.touched"
                  [attr.aria-describedby]="fullName.invalid && fullName.touched ? 'register-name-error' : null"
                >
                <span
                  *ngIf="fullName.hasError('required') && fullName.touched"
                  id="register-name-error"
                  class="field-error"
                >Vui lòng nhập họ tên.</span>
              </div>

              <div class="field">
                <label for="register-email">Email<span class="required">*</span></label>
                <input
                  id="register-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  [class.invalid]="email.invalid && email.touched"
                  [attr.aria-invalid]="email.invalid && email.touched"
                  [attr.aria-describedby]="email.invalid && email.touched ? 'register-email-error' : null"
                >
                <span
                  *ngIf="email.hasError('required') && email.touched"
                  id="register-email-error"
                  class="field-error"
                >Vui lòng nhập email.</span>
                <span
                  *ngIf="email.hasError('email') && email.touched"
                  id="register-email-error"
                  class="field-error"
                >Email không đúng định dạng.</span>
              </div>

              <div class="field">
                <label for="register-password">Mật khẩu<span class="required">*</span></label>
                <input
                  id="register-password"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  [class.invalid]="password.invalid && password.touched"
                  [attr.aria-invalid]="password.invalid && password.touched"
                  [attr.aria-describedby]="password.invalid && password.touched ? 'register-password-error' : 'register-password-hint'"
                >
                <span id="register-password-hint" class="field-hint">Tối thiểu 12 ký tự</span>
                <span
                  *ngIf="password.hasError('required') && password.touched"
                  id="register-password-error"
                  class="field-error"
                >Vui lòng nhập mật khẩu.</span>
                <span
                  *ngIf="password.hasError('minlength') && !password.hasError('required') && password.touched"
                  id="register-password-error"
                  class="field-error"
                >Mật khẩu phải có ít nhất 12 ký tự.</span>
              </div>

              <fieldset class="role-field">
                <legend>Bạn là<span class="required">*</span></legend>
                <div class="role-cards">
                  <label class="role-card" [class.selected]="role.value === 'Requester'">
                    <input type="radio" formControlName="role" value="Requester">
                    <span class="role-indicator" aria-hidden="true"></span>
                    <span>
                      <strong>Người yêu cầu</strong>
                      <span class="role-description">Gửi yêu cầu cứu trợ</span>
                    </span>
                  </label>
                  <label class="role-card" [class.selected]="role.value === 'Volunteer'">
                    <input type="radio" formControlName="role" value="Volunteer">
                    <span class="role-indicator" aria-hidden="true"></span>
                    <span>
                      <strong>Tình nguyện viên</strong>
                      <span class="role-description">Nhận nhiệm vụ giao hàng</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <p-button
                type="submit"
                label="Đăng ký"
                styleClass="auth-submit"
                [style]="{ width: '100%' }"
                [loading]="submitting"
                [disabled]="submitting"
              ></p-button>

              <p class="auth-switch">Đã có tài khoản? <a routerLink="/login">Đăng nhập</a></p>
            </div>
          </form>
        </section>
      </main>
    </div>
    <p-toast position="top-right"></p-toast>
  `,
  styleUrl: '../auth-page.scss'
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    role: this.formBuilder.nonNullable.control<PublicRole>('Volunteer', Validators.required)
  });
  submitting = false;

  get fullName() {
    return this.form.controls.fullName;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get role() {
    return this.form.controls.role;
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.submitting = false;
        void this.router.navigateByUrl(this.auth.getDefaultRouteByRole(user.role));
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.messages.add({
          severity: 'error',
          summary: 'Đăng ký không thành công',
          detail: extractErrorMessage(error)
        });
      }
    });
  }
}
