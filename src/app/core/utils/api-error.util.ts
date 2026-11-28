import { HttpErrorResponse } from '@angular/common/http';
import { LegacyErrorMessage, ProblemDetails } from '../models/models';

export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Đã xảy ra lỗi không mong muốn.';
  }

  const body = isRecord(error.error) ? error.error as ProblemDetails & LegacyErrorMessage : null;
  if (body?.errors) {
    const firstError = Object.values(body.errors).find((messages) => messages?.length)?.[0];
    if (firstError) return firstError;
  }
  if (body?.detail) return body.detail;
  if (body?.title) return body.title;
  if (body?.message) return body.message;

  const fallbacks: Record<number, string> = {
    400: 'Thông tin gửi lên không hợp lệ.',
    401: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy dữ liệu yêu cầu.',
    409: 'Dữ liệu xung đột với trạng thái hiện tại.',
    500: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.'
  };
  return fallbacks[error.status] ?? 'Không thể hoàn thành yêu cầu.';
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof HttpErrorResponse) || !isRecord(error.error) || !isRecord(error.error['errors'])) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.error['errors'])) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      fieldErrors[field] = messages[0];
    }
  }
  return fieldErrors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
