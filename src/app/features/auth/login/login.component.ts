import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-login',
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
          <h2>Kết nối nhu cầu cứu trợ<br>với kho hàng và tình nguyện viên</h2>
          <p>Gửi yêu cầu, điều phối vật tư và theo dõi giao nhận trên cùng một nền tảng.</p>
        </div>
        <div class="auth-copyright">© 2026 Nhóm 1</div>
      </aside>

      <main class="auth-form">
        <section class="auth-card">
          <h1>Đăng nhập</h1>
          <p class="auth-subtitle">Chào mừng bạn quay lại</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="auth-fields">
              <div class="field">
                <label for="login-email">Email<span class="required">*</span></label>
                <input
                  id="login-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  [class.invalid]="email.invalid && email.touched"
                  [attr.aria-invalid]="email.invalid && email.touched"
                  [attr.aria-describedby]="email.invalid && email.touched ? 'login-email-error' : null"
                >
                <span
                  *ngIf="email.hasError('required') && email.touched"
                  id="login-email-error"
                  class="field-error"
                >Vui lòng nhập email.</span>
                <span
                  *ngIf="email.hasError('email') && email.touched"
                  id="login-email-error"
                  class="field-error"
                >Email không đúng định dạng.</span>
              </div>

              <div class="field">
                <label for="login-password">Mật khẩu<span class="required">*</span></label>
                <input
                  id="login-password"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  [class.invalid]="password.invalid && password.touched"
                  [attr.aria-invalid]="password.invalid && password.touched"
                  [attr.aria-describedby]="password.invalid && password.touched ? 'login-password-error' : null"
                >
                <span
                  *ngIf="password.hasError('required') && password.touched"
                  id="login-password-error"
                  class="field-error"
                >Vui lòng nhập mật khẩu.</span>
              </div>

              <p-button
                type="submit"
                label="Đăng nhập"
                styleClass="auth-submit"
                [style]="{ width: '100%' }"
                [loading]="submitting"
                [disabled]="submitting"
              ></p-button>

              <p class="auth-switch">Chưa có tài khoản? <a routerLink="/register">Đăng ký</a></p>
            </div>
          </form>
        </section>
      </main>
    </div>
    <p-toast position="top-right"></p-toast>
  `,
  styleUrl: '../auth-page.scss'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  submitting = false;

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.submitting = false;
        void this.router.navigateByUrl(this.auth.getDefaultRouteByRole(user.role));
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.messages.add({
          severity: 'error',
          summary: 'Đăng nhập không thành công',
          detail: extractErrorMessage(error)
        });
      }
    });
  }
}
