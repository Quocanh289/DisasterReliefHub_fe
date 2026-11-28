# ReliefHub FE Kit – Bộ mẫu để code Angular với Copilot

Bộ kit này dựa trên **API contract Nhóm 1** (`http://localhost:8080/api`). Bạn chỉ cần đưa từng phần cho Copilot theo các bước bên dưới.

## Nội dung

| Thư mục / file | Dùng để làm gì |
|---|---|
| `design/index.html` | Mở bằng trình duyệt để xem danh sách 12 màn hình |
| `design/*.html` + `design/styles.css` | **Bản thiết kế** dạng HTML tĩnh. Copilot đọc được code, nên bảo nó "làm giống file này" |
| `design/screenshots/*.png` | Ảnh từng màn (PC 1440px, kèm 2 ảnh SP). Kéo ảnh vào Copilot Chat để nó nhìn theo |
| `copilot/copilot-instructions.md` | Quy ước dự án. Copy vào `.github/copilot-instructions.md` trong repo Angular, Copilot sẽ tự đọc mỗi lần chat |
| `copilot/prompts.md` | Prompt cho từng bước, copy dán vào Copilot Chat |
| `starter/models.ts` | Interface TypeScript khớp với API contract. Copy vào `src/app/core/models/` |

## 12 màn hình

| # | Màn hình | Role | API |
|---|---|---|---|
| 1 | Đăng nhập | Public | POST /auth/login |
| 2 | Đăng ký | Public | POST /auth/register |
| 3 | Gửi yêu cầu cứu trợ | Requester | POST /relief-requests, GET /events, GET /items |
| 4 | Yêu cầu của tôi | Requester | GET /relief-requests/mine, POST /relief-requests/{id}/cancel |
| 5 | Nhiệm vụ của tôi | Volunteer | GET /assignments/mine, PATCH /assignments/{id}/status |
| 6 | Hồ sơ của tôi | Volunteer | GET/PUT /volunteers/me, PATCH /volunteers/me/status |
| 7 | Thông báo | Mọi role | GET /notifications/mine |
| 8 | Yêu cầu cứu trợ (điều phối) | Coordinator, Admin | GET /relief-requests, GET /warehouses |
| 9 | Phân công (dialog trên màn 8) | Coordinator, Admin | GET /inventories, GET /volunteers, POST /assignments |
| 10 | Tình nguyện viên | Coordinator, Admin | GET /volunteers |
| 11 | Tồn kho | Coordinator, Admin | GET/PUT /inventories, GET /warehouses |
| 12 | Danh mục (Sự kiện / Kho / Vật tư) | Admin | CRUD /events, /warehouses, /items |

## Quy trình code (làm theo thứ tự)

**Bước 0 – Chuẩn bị (1 lần)**
1. Backend chạy được ở `http://localhost:8080` (Swagger mở được).
2. Tạo project: `ng new reliefhub-web --standalone --routing --style=scss`
3. Cài thư viện: `npm i primeng @primeng/themes primeicons leaflet` và `npm i -D @types/leaflet`
4. Copy `copilot/copilot-instructions.md` → `.github/copilot-instructions.md`
5. Copy `starter/models.ts` → `src/app/core/models/models.ts`
6. Copy thư mục `design/` vào gốc repo (để Copilot đọc được khi bạn nhắc tên file).

**Bước 1 – Khung app (1 lần)**: Prompt 1 → design token, layout (sidebar + header), routing theo role.
**Bước 2 – Đăng nhập / phân quyền (1 lần)**: Prompt 2 → AuthService, interceptor, guard, màn Login / Register.
**Bước 3 trở đi – Từng màn hình**: Prompt 3 → 12. Mỗi màn làm theo vòng:
1. Dựng giao diện giống file mockup, dùng **dữ liệu giả** trước.
2. Nối API thật.
3. Xử lý trạng thái: loading, lỗi (đọc HTTP status), danh sách rỗng, validation.
4. Test happy flow + bad flow trên trình duyệt.
5. Commit, sang màn tiếp theo.

**Thứ tự gợi ý** (theo luồng demo): Login → Gửi yêu cầu → Yêu cầu của tôi → Yêu cầu cứu trợ (điều phối) → Phân công → Nhiệm vụ của tôi → Hồ sơ TNV → Thông báo → Tồn kho → Tình nguyện viên → Danh mục.

## Kiểm tra code Copilot sinh ra

- Đúng route, đúng tên field như `api-contract` và `models.ts`. Không để Copilot tự đặt tên mới.
- Gọi API qua service, component không gọi `HttpClient` trực tiếp.
- Có xử lý lỗi theo **HTTP status** (400 / 401 / 403 / 404 / 409). Contract ghi rõ body lỗi chưa thống nhất (`ProblemDetails` hoặc `{ message }`), nên đọc cả hai.
- Tọa độ gửi lên đúng thứ tự `longitude`, `latitude`. Leaflet dùng `[lat, lng]`, dễ đảo ngược.
- Nút nào chỉ dành cho role nào thì ẩn đúng (ví dụ "Hủy" chỉ khi request `Pending`).

## Lưu ý về mockup

- Bản đồ trong mockup chỉ là **hình minh họa**. Khi code dùng **Leaflet + OpenStreetMap**.
- Các dòng chú thích nhỏ màu xám (ghi API, mã lỗi) là ghi chú cho lập trình viên, **không đưa lên giao diện thật**.
- Tên trạng thái tiếng Việt chỉ là đề xuất. Giá trị enum thật lấy theo backend (xem `models.ts`, sửa lại nếu khác).
