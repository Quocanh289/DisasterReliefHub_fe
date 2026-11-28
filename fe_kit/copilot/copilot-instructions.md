# Copilot instructions – ReliefHub Web (Angular)

## Dự án
Nền tảng điều phối tình nguyện viên & vật tư cứu trợ thiên tai. Frontend Angular gọi REST API backend .NET tại `http://localhost:8080/api`.
Roles: `Requester`, `Volunteer`, `Coordinator`, `Admin`. Giao diện tiếng Việt.

## Stack & quy ước
- Angular (standalone components, signals khi phù hợp), TypeScript strict, SCSS.
- UI: **PrimeNG** (p-table, p-dialog, p-select, p-inputnumber, p-tag, p-toast, p-button, p-tabs) + primeicons.
- Bản đồ: **Leaflet** + OpenStreetMap tiles. Leaflet dùng `[lat, lng]`; API dùng `longitude`, `latitude` → luôn chuyển đổi đúng chiều.
- Cấu trúc thư mục:
  - `src/app/core/` – models, services gọi API, interceptor, guards, AuthService
  - `src/app/layout/` – shell (sidebar + header)
  - `src/app/features/<feature>/` – auth, requester, volunteer, coordinator, admin, notifications
  - `src/app/shared/` – component dùng chung (status-tag, urgency-badge, map-picker, empty-state)
- Mỗi resource một service (`ReliefRequestService`, `AssignmentService`, …), trả `Observable<T>` đúng interface trong `core/models/models.ts`.
- Component **không** gọi `HttpClient` trực tiếp.
- `environment.apiUrl = 'http://localhost:8080/api'`.

## Thiết kế (bắt buộc làm giống mockup)
- Mockup HTML nằm ở `design/*.html`, style ở `design/styles.css`, ảnh ở `design/screenshots/`.
- Khi được yêu cầu làm một màn hình, **đọc file mockup tương ứng** và làm bố cục, khoảng cách, màu, câu chữ giống mockup.
- Design token (map sang biến CSS / theme PrimeNG):
  - primary `#1E6FD9`, warning `#F59E0B`, danger `#DC2626`, success `#16A34A`
  - nền trang `#F5F7FA`, card trắng, viền `#E5E7EB`, chữ `#1F2937`, chữ phụ `#6B7280`
  - bo góc card 10px, input/button 6px; font Inter; khoảng cách theo bội số 8px
- Layout: sidebar trái 240px (menu theo role), header 60px (tên sự kiện, chuông thông báo, avatar + role), nội dung padding 24px, dùng card.
- Responsive: dưới 768px ẩn sidebar (thay bằng menu hamburger), các lưới 2 cột thành 1 cột.
- Dòng chữ nhỏ ghi chú API / mã lỗi trong mockup là ghi chú cho dev, **không** hiển thị trên UI thật.

## Màu trạng thái (dùng component `status-tag`)
- Request: Pending = info (xanh), đang xử lý/đã phân công = warn (cam), Fulfilled = success, Cancelled = neutral.
- Assignment: Pending = info, Accepted/InTransit = warn, Delivered = success, Failed = danger.
- Volunteer: Available = success, Busy = warn, Offline = neutral.
- Urgency: 1–2 xanh nhạt, 3 cam, 4–5 đỏ (component `urgency-badge`).

## Auth
- Login trả `{ userId, fullName, email, role, accessToken, refreshToken }` → lưu vào `AuthService` (signal) + localStorage.
- `authInterceptor`: gắn `Authorization: Bearer <accessToken>`. Khi 401: gọi `POST /auth/refresh` một lần, thành công thì gửi lại request, thất bại thì logout về `/login`.
- `roleGuard(['Coordinator','Admin'])` cho route theo role. Sau login điều hướng: Requester → `/requester/new`, Volunteer → `/volunteer/assignments`, Coordinator/Admin → `/coordinator/requests`.

## Xử lý lỗi
- Dựa vào **HTTP status** là chính: 400 lỗi nhập, 401 hết phiên, 403 không có quyền, 404 không tìm thấy, 409 xung đột (hết hàng, sai trạng thái, trùng email…).
- Body lỗi có thể là `ProblemDetails` (`title`, `detail`, `errors`) hoặc `{ message }` → viết hàm `extractErrorMessage(err)` đọc cả hai, hiển thị bằng `p-toast` hoặc dưới field.
- Validation `errors` (key theo tên field) → gắn lỗi vào đúng form control.

## Trạng thái màn hình
Mỗi màn có: loading (skeleton/spinner), lỗi (thông báo + nút thử lại), rỗng (empty-state), và disable nút khi đang gửi để tránh bấm 2 lần.

## Không làm
- Không thêm thư viện UI khác ngoài PrimeNG.
- Không tự đổi tên field / route so với `models.ts` và API contract.
- Không gọi endpoint không có trong contract (`GET /skills`, `PATCH /notifications/{id}/read` chưa tồn tại).
- Không để `TODO`, không hard-code token.
