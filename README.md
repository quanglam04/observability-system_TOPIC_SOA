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
