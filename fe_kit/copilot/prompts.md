# Prompt cho Copilot Chat (dán lần lượt, xong bước nào commit bước đó)

> Mẹo: trong Copilot Chat, gõ `#file:design/xxx.html` để đính file mockup, hoặc kéo ảnh trong `design/screenshots/` vào khung chat.
> Mỗi prompt đều kết thúc bằng: "Trước khi code, liệt kê file sẽ tạo/sửa. Không đổi tên field so với models.ts."

---

## Prompt 1 – Khung app (layout + routing + theme)

```
Đọc #file:.github/copilot-instructions.md, #file:design/styles.css và #file:design/coordinator-requests.html.
Tạo khung app Angular:
1. Cấu hình PrimeNG (provider theme, primeicons), thêm design token trong styles.scss theo styles.css (biến CSS --primary, --bg...).
2. Component layout/shell: sidebar 240px (logo ReliefHub, menu theo role, mục Đăng xuất ở cuối), header 60px (tên sự kiện, chuông thông báo, avatar + tên + role), vùng <router-outlet>. Giống mockup.
3. Menu theo role:
   - Requester: Gửi yêu cầu (/requester/new), Yêu cầu của tôi (/requester/requests), Thông báo (/notifications)
   - Volunteer: Nhiệm vụ của tôi (/volunteer/assignments), Hồ sơ của tôi (/volunteer/profile), Thông báo
   - Coordinator: Yêu cầu cứu trợ (/coordinator/requests), Tình nguyện viên (/coordinator/volunteers), Tồn kho (/inventory), Thông báo
   - Admin: như Coordinator + Danh mục (/admin/catalog)
4. Routing: /login, /register ngoài shell; các route còn lại trong shell. Tạo component rỗng tạm cho từng route.
5. Component dùng chung trong shared/: status-tag (theo màu trạng thái trong instructions), urgency-badge, empty-state.
Responsive: dưới 768px ẩn sidebar, có nút hamburger mở sidebar dạng drawer.
```

## Prompt 2 – Đăng nhập, đăng ký, phân quyền

```
Đọc #file:design/login.html, #file:design/register.html, #file:src/app/core/models/models.ts.
1. AuthService: login (POST /auth/login), register (POST /auth/register), refresh (POST /auth/refresh), logout. Lưu AuthResponse vào signal + localStorage.
2. authInterceptor: gắn Bearer token; gặp 401 thì refresh 1 lần rồi gửi lại, thất bại thì logout về /login.
3. authGuard và roleGuard(roles: Role[]); gắn vào routes của Prompt 1.
4. Màn Login và Register giống mockup (2 cột, bên trái nền xanh gradient). Register có radio card Requester / Volunteer.
5. Lỗi: 401 → "Email hoặc mật khẩu không đúng."; 409 → "Email đã được sử dụng" dưới ô email; 400 → hiện lỗi theo field. Mật khẩu tối thiểu 12 ký tự (validate phía client).
6. Login thành công điều hướng theo role (xem instructions). Viết hàm extractErrorMessage(err) trong core/ đọc được cả ProblemDetails và { message }.
```

## Prompt 3 – Map picker dùng chung

```
Tạo shared/map-picker component bằng Leaflet + OpenStreetMap:
- Input: value { longitude, latitude } | null, readonly?: boolean, radiusKm?: number.
- Output: valueChange khi click bản đồ (đặt/di chuyển marker).
- Nút "Dùng vị trí hiện tại" (navigator.geolocation).
- Hiển thị toạ độ ở góc trên phải giống #file:design/requester-new-request.html.
- Chú ý Leaflet dùng [lat, lng], component trả ra { longitude, latitude }.
- Sửa lỗi icon marker mặc định của Leaflet khi build Angular.
Thêm shared/map-view hiển thị nhiều marker (type: request | urgent | warehouse | volunteer) có legend và popup.
```

## Prompt 4 – Gửi yêu cầu cứu trợ (Requester)

```
Làm màn /requester/new giống #file:design/requester-new-request.html.
- Bên trái: map-picker. Bên phải: form phone, event (GET /events, không bắt buộc), urgency (segmented 1–5), affectedPeople, danh sách vật tư (GET /items; FormArray itemId + quantity, nút Thêm/Xoá).
- Validate: phone bắt buộc; phải chọn vị trí; ít nhất 1 vật tư; quantity > 0; không chọn trùng vật tư.
- Submit: POST /relief-requests (CreateReliefRequest). Thành công → toast "Đã gửi yêu cầu" và chuyển /requester/requests. 400 → lỗi theo field.
- Disable nút khi đang gửi.
```

## Prompt 5 – Yêu cầu của tôi (Requester)

```
Làm màn /requester/requests giống #file:design/requester-my-requests.html.
- GET /relief-requests/mine, p-table: thời gian, vật tư (tóm tắt), urgency-badge, số người, tiến độ (tổng fulfilled/needed), status-tag.
- Nút "Hủy" chỉ khi status = Pending: confirm dialog → POST /relief-requests/{id}/cancel → reload. 409 → toast "Yêu cầu không thể hủy ở trạng thái hiện tại".
- Lọc theo trạng thái phía client. Có loading, empty-state ("Bạn chưa gửi yêu cầu nào").
```

## Prompt 6 – Yêu cầu cứu trợ (Coordinator/Admin)

```
Làm màn /coordinator/requests giống #file:design/coordinator-requests.html.
- 4 thẻ thống kê (đếm theo status/urgency từ dữ liệu GET /relief-requests).
- Cột trái: p-table có tìm kiếm (tên, SĐT), lọc status, lọc urgency, phân trang. Nút "Phân công" chỉ cho status Pending.
- Cột phải: map-view hiển thị yêu cầu (urgency 4–5 màu đỏ) và kho (GET /warehouses). Click dòng bảng → highlight marker và mở popup.
```

## Prompt 7 – Dialog phân công

```
Làm AssignDialogComponent (p-dialog) mở từ nút "Phân công", giống #file:design/coordinator-assign.html.
- Hiện tóm tắt yêu cầu.
- Chọn kho (GET /warehouses, chỉ kho hoạt động) → GET /inventories?warehouseId= để lấy available từng vật tư.
- Chọn TNV (GET /volunteers, chỉ status Available; hiển thị tên · status · currentLoad).
- Bảng vật tư: Cần (quantityNeeded - quantityFulfilled), Khả dụng tại kho, ô Giao (p-inputnumber). Validate 0 < giao ≤ min(cần, khả dụng), báo đỏ "Vượt tồn kho khả dụng".
- ETA (datetime, không bắt buộc), Ghi chú.
- POST /assignments (CreateAssignmentRequest). 201 → toast + đóng dialog + reload bảng. 409 → toast lỗi hết hàng / trạng thái không hợp lệ.
- Disable "Xác nhận phân công" khi form invalid hoặc đang gửi.
```

## Prompt 8 – Nhiệm vụ của tôi (Volunteer)

```
Làm màn /volunteer/assignments giống #file:design/volunteer-assignments.html.
- GET /assignments/mine, tab: Đang thực hiện (Pending/Accepted/InTransit), Hoàn thành (Delivered), Thất bại (Failed).
- Mỗi nhiệm vụ là 1 card: tiêu đề, status-tag, timeline 3 bước, kho, người nhận, vật tư, ETA, ô ghi chú.
- Nút theo trạng thái: Pending → "Nhận nhiệm vụ" (Accepted); Accepted → "Bắt đầu giao" (InTransit); InTransit → "Đã giao xong" (Delivered); luôn có "Báo thất bại" (Failed, bắt buộc nhập ghi chú).
- PATCH /assignments/{id}/status { status, note }. 409 → toast "Không thể chuyển trạng thái". Thành công → reload.
```

## Prompt 9 – Hồ sơ của tôi (Volunteer)

```
Làm màn /volunteer/profile giống #file:design/volunteer-profile.html.
- GET /volunteers/me. Card trạng thái: switch Available/Offline → PATCH /volunteers/me/status; nếu status = Busy thì khoá switch và ghi "Đang có nhiệm vụ".
- Form: họ tên/email (chỉ đọc), kỹ năng (chips chọn nhiều, danh sách cố định: FirstAid, Driving, Swimming, Cooking, Logistics – hiển thị tiếng Việt), bán kính km (> 0), vị trí (map-picker có radiusKm).
- Lưu: PUT /volunteers/me. 400 → lỗi theo field.
```

## Prompt 10 – Thông báo

```
Làm màn /notifications giống #file:design/notifications.html.
- GET /notifications/mine, tab Tất cả / Chưa đọc (lọc theo isRead).
- Icon + màu theo type (AssignmentCreated, Delivered, ... – mặc định icon info), thời gian dạng "5 phút trước".
- Badge số chưa đọc trên menu và chấm đỏ trên chuông ở header (dùng chung 1 NotificationService, polling 60 giây).
- Không gọi API đánh dấu đã đọc (chưa có endpoint).
```

## Prompt 11 – Tồn kho (Coordinator/Admin)

```
Làm màn /inventory giống #file:design/inventory.html.
- Select kho (GET /warehouses) → GET /inventories?warehouseId=.
- Bảng: vật tư, đơn vị, tồn, đã giữ, tồn an toàn, khả dụng (đỏ nếu < 10), nút Sửa.
- Dialog sửa: quantityOnHand, safetyStock (>= 0). quantityCommitted chỉ đọc. PUT /inventories (UpsertInventoryRequest).
- 409 → "Tồn không được nhỏ hơn số đã giữ". Thêm nút "Thêm vật tư vào kho" (chọn item chưa có trong kho).
```

## Prompt 12 – Tình nguyện viên + Danh mục

```
1. Màn /coordinator/volunteers giống #file:design/coordinator-volunteers.html: GET /volunteers, bảng có avatar chữ cái, kỹ năng (chips), status-tag, currentLoad, bán kính; lọc theo status và kỹ năng.
2. Màn /admin/catalog giống #file:design/admin-catalog.html: 3 tab Sự kiện / Kho / Vật tư, mỗi tab p-table + nút "Thêm mới" + Sửa/Xoá (p-dialog form).
   - Kho có map-picker chọn vị trí.
   - Xoá có confirm; 409 → toast "Đang được sử dụng, không thể xoá".
   - Dùng GET/POST/PUT/DELETE của /events, /warehouses, /items (chỉ role Admin).
```

---

## Prompt sửa lỗi (dùng bất cứ lúc nào)

```
Lỗi: [dán lỗi console / response từ tab Network]
Bước tái hiện: [màn nào, bấm gì]
Kỳ vọng: [...]  Thực tế: [...]
Tìm nguyên nhân gốc và giải thích trước, sau đó sửa tối thiểu, không sửa file không liên quan.
```

## Prompt chỉnh giao diện cho giống mockup

```
So sánh màn hiện tại với #file:design/[tên].html (và ảnh đính kèm).
Liệt kê các điểm khác (bố cục, khoảng cách, màu, câu chữ), rồi sửa SCSS/template cho giống. Không đổi logic.
```
