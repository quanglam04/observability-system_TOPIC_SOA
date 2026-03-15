# Microservices Observability with Grafana Stack

Dự án này triển khai hệ thống giám sát toàn diện (Observability) cho kiến trúc Microservices sử dụng bộ công cụ hiện đại từ Grafana Labs.

## Kiến trúc hệ thống

Hệ thống bao gồm 3 service NodeJS giao tiếp nối tiếp nhau để minh họa luồng dữ liệu (Request Flow):

- **API Gateway**: Tiếp nhận request từ Client.
- **User Service**: Xử lý logic nghiệp vụ người dùng.
- **Notification Service**: Gửi thông báo hệ thống.

Dữ liệu giám sát được thu thập bởi **Grafana Alloy** và đẩy về các kho lưu trữ chuyên biệt:

- **Loki**: Lưu trữ Logs hệ thống và ứng dụng.
- **Mimir**: Lưu trữ Metrics hiệu năng (CPU, RAM, Request Rate).
- **Tempo**: Lưu trữ Traces (Spans) để theo dõi luồng request.
- **Grafana**: Hiển thị Dashboard để quan sát và phân tích dữ liệu.

## Tổng quan

![anh](/public/system-design.png)

## Hướng dẫn cài đặt và khởi chạy

### 1. Yêu cầu hệ thống

- Docker & Docker Compose.
- NodeJS v20+.

### 2. Khởi chạy toàn bộ hệ thống

```bash
docker-compose up -d --build
```

## Truy cập

| Dịch vụ          | Địa chỉ truy cập (URL)   | Chức năng chính                                          |
| :--------------- | :----------------------- | :------------------------------------------------------- |
| **Grafana**      | `http://localhost:3000`  | Giao diện quan sát Dashboard, phân tích Logs/Traces      |
| **Alloy UI**     | `http://localhost:12345` | Kiểm tra trạng thái và cấu hình của các Pipeline dữ liệu |
| **Loki API**     | `http://localhost:3100`  | Endpoint lưu trữ và truy vấn Logs                        |
| **Tempo API**    | `http://localhost:3200`  | Endpoint lưu trữ và truy vấn Traces                      |
| **Mimir API**    | `http://localhost:9009`  | Endpoint lưu trữ và truy vấn Metrics                     |
| **API Gateway**  | `http://localhost:8000`  | Điểm tiếp nhận request đầu vào của hệ thống              |
| **User Service** | `http://localhost:8002`  | Service xử lý logic người dùng (Internal/Demo)           |
| **Notification** | `http://localhost:8001`  | Service gửi thông báo (Internal/Demo)                    |

## Kết quả

![anh](/public/result.png)

<p align="center"><em>Giao diện Grafana Dashboard</em></p>

---

### Xem Metrics (CPU, RAM, Request Rate)

Dashboard chính hiển thị 4 panel metrics:

| Panel                  | Mô tả                                 | Cách đọc                           |
| :--------------------- | :------------------------------------ | :--------------------------------- |
| **HTTP Requests/giây** | Số request mỗi giây theo từng service | Đỉnh cao = traffic lớn             |
| **RAM Usage (MB)**     | Lượng RAM đang dùng                   | Tăng liên tục = có thể memory leak |
| **CPU Usage**          | Mức độ sử dụng CPU                    | Spike cao = xử lý nặng             |
| **Total Requests**     | Tổng số request từ khi khởi động      | Dùng để so sánh giữa các service   |

**Lọc theo service:** Dùng dropdown **Service** ở góc trên trái để chọn `api-gateway`, `user-service`, hoặc `notification-service`.

---

### Xem Logs

Cuộn xuống phần **Logs** trên Dashboard, hoặc vào **Explore → Loki** để query chi tiết hơn.

**Các query Loki hay dùng:**

```logql
# Xem tất cả log của 1 service
{service="api-gateway"}

# Chỉ xem log lỗi
{service="api-gateway"} | json | level="error"

# Tìm log theo đường dẫn API cụ thể
{service="user-service"} | json | path="/api/users/login"

# Xem log của tất cả service cùng lúc
{service=~"api-gateway|user-service|notification-service"} | json

# Tìm log theo từ khóa (substring, không cần parse JSON)
{service="api-gateway"} |= "error"

# Loại trừ log theo từ khóa
{service="api-gateway"} != "health check"

# Xem log theo method HTTP
{service="api-gateway"} | json | method="POST"

# Xem log lỗi của tất cả service (dùng docker label)
{job="docker"} | json | level="error"

# Lọc theo nhiều điều kiện
{service="user-service"} | json | level="error" | method="POST"

# Đếm số lỗi theo từng service trong 5 phút
sum by (service) (count_over_time({job="docker"} | json | level="error" [5m]))

# Tìm log chứa traceId cụ thể (khi điều tra 1 request)
{job="docker"} | json | traceId="abc123xyz"

# Xem log trong khoảng thời gian có nhiều lỗi
{job="docker"} | json | level="error" | message=~".*timeout.*|.*connection.*|.*refused.*"
```

---

### Trace một Request (Tracing)

Tracing giúp theo dõi một request đi qua bao nhiêu service, mất bao lâu ở mỗi bước.

**Cách trace:**

1. Vào **Explore → Tempo**
2. Chọn **Search** tab
3. Chọn **Service Name** → ví dụ `api-gateway`
4. Bấm **Run query**
5. Click vào một **Trace ID** để xem chi tiết từng span

**Hoặc dùng TraceQL:**

```traceql
# Tìm tất cả trace của api-gateway
{resource.service.name="api-gateway"}

# Tìm trace chậm hơn 500ms (1 service cụ thể)
{resource.service.name="api-gateway"} | duration > 500ms

# Tìm trace chậm hơn 500ms (tất cả service)
{} | duration > 500ms

# Tìm trace có lỗi (1 service cụ thể)
{resource.service.name="api-gateway"} | status = error

# Tìm trace có lỗi (tất cả service)
{} | status = error

# Kết hợp lỗi và chậm
{} | status = error && duration > 500ms

# Tìm trace theo traceId cụ thể (từ log nhảy sang)
{} | traceId = "abc123xyz"

# Tìm trace của nhiều service cùng lúc
{resource.service.name=~"api-gateway|user-service"}

# Tìm trace chậm và có lỗi của 1 service cụ thể
{resource.service.name="user-service"} | duration > 1s && status = error
```

---
