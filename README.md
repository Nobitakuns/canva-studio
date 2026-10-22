# Canva Pro Design Studio 🎨

> **Note**: coppy paste by VN  
> **Repository**: [https://github.com/Nobitakuns/canva-studio](https://github.com/Nobitakuns/canva-studio)  
> 📖 **Xem hướng dẫn chi tiết A-Z**: [HUONG_DAN_CAI_DAT.md](HUONG_DAN_CAI_DAT.md)

Ứng dụng web thiết kế đồ họa trực tuyến tái hiện 100% công năng, tính năng và giao diện của **[Canva.com](https://www.canva.com/)**, kết hợp công nghệ phân tích ngược từ **[REA (Reverse Engineer Anything)](https://github.com/morluto/rea)**.

Tối ưu hóa hoàn hảo cho cả trình duyệt máy tính (Desktop) lẫn điện thoại di động (Mobile).

---

## 🌟 Tính Năng Nổi Bật (100% Canva.com Fidelity)

1. **Giao diện & Thanh Điều hướng Chuẩn Canva**:
   - Logo Canva chữ ký chuyển sắc Cyan – Purple (`#00c4cc` ➔ `#7d2ae8`).
   - Đổi cỡ & Magic Switch (Instagram 1080x1080, Story 1080x1920, YouTube Thumbnail 1280x720, Poster, Facebook Banner).
   - Tự động lưu đám mây (`✔ Đã lưu tất cả thay đổi`), Hoàn tác `↺` (Ctrl+Z) và Làm lại `↻` (Ctrl+Y).
   - Tải xuống đa định dạng: **PNG** (1x, 2x Retina, hỗ trợ nền trong suốt), **JPG**.

2. **Cột Công cụ Dock & Drawer Trượt**:
   - 🎨 **Thiết kế**: Kho mẫu có sẵn (Quảng bá Pro, Siêu Sale 50%, Cà phê & Ẩm thực).
   - 🧩 **Thành phần**: Hình chữ nhật, hình bo góc, hình tròn, tam giác, ngôi sao, bảng màu linh hoạt.
   - 🔤 **Văn bản**: Thêm tiêu đề lớn, tiêu đề phụ, nội dung và các bộ chữ phối sẵn nghệ thuật.
   - 📤 **Tải lên**: Tải ảnh trực tiếp từ máy tính/điện thoại và chèn ngay vào thiết kế.
   - 📑 **Lớp (Layers)**: Quản lý thứ tự hiển thị z-index, đưa lên trên/xuống dưới.
   - 🪄 **Magic AI Studio**: Tự động sinh thiết kế và màu sắc từ mô tả văn bản.

3. **Thanh Công cụ Ngữ cảnh Động (Contextual Toolbar)**:
   - Tự động thay đổi theo đối tượng được chọn: Phông chữ (Inter, Montserrat, Playfair Display, Roboto, Oswald, Dancing Script), cỡ chữ, màu sắc, in đậm/nghiêng/gạch chân, căn lề, căn giữa trang, nhân bản và xóa.

4. **Trang Vẽ Artboard & Khung Chọn Tương Tác**:
   - **8 tay cầm co giãn (Resize Handles)** hỗ trợ co giãn cỡ chữ theo tỷ lệ.
   - **Tay cầm xoay 360 độ** kèm tự động hít góc vuông (0°, 90°, 180°, 270°).
   - **Đường gióng thông minh (Smart Purple Snapping Guides)** tự động căn giữa và căn lề.
   - Nhấp đúp chuột để chỉnh sửa văn bản trực tiếp (Inline text editing).
   - Phím tắt: `Delete`/`Backspace`, `Ctrl+C`, `Ctrl+V`, phím mũi tên di chuyển pixel.

5. **Tối ưu 100% Trình duyệt Di động (Canva Mobile App)**:
   - Nút tròn nổi lớn `[ ➕ ]` mở Bottom Sheet Drawer trượt mượt mà.
   - Artboard tự động co giãn vừa vặn màn hình điện thoại (scale 28%), không bị tràn khung.
   - Cử chỉ chạm ngón tay co giãn, di chuyển và xoay đối tượng.

6. **Tích hợp REA (Reverse Engineer Anything)**:
   - Trích xuất bảng màu, cấu trúc DOM và tài nguyên từ bất kỳ website nào để tái hiện thành các layer thiết kế trên Artboard.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY CHI TIẾT

> Xem file hướng dẫn mở rộng đầy đủ hình ảnh và cách giải quyết sự cố tại: [HUONG_DAN_CAI_DAT.md](HUONG_DAN_CAI_DAT.md)

### 1. Yêu Cầu Cần Có
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị 20 LTS hoặc 22 LTS).  
  *Nếu máy chưa có Node.js: Truy cập [https://nodejs.org/](https://nodejs.org/) tải bản LTS và cài đặt chỉ trong 1 phút.*
- **Git** (nếu cài đặt qua clone GitHub).

---

### 2. Tải Mã Nguồn

#### Cách A: Tải qua Git (Khuyên dùng)
```bash
git clone https://github.com/Nobitakuns/canva-studio.git
cd canva-studio
```

#### Cách B: Dùng thư mục có sẵn trên máy
```bash
cd "/Users/masterdzj/Documents/web/canvas"
```

---

### 3. Cài Đặt Thư Viện (Dependencies)
Chạy lệnh sau tại thư mục dự án:
```bash
npm install
```

---

### 4. Khởi Chạy Ứng Dụng

#### Cách 1: Bấm đúp 1-Click trên macOS (Dễ nhất)
Nhấp đúp chuột vào file:
- `Start_Canva.command` hoặc `Khởi_Động_Canva.command`

Server sẽ tự động kích hoạt và mở ngay trình duyệt tại `http://localhost:3030/`.

#### Cách 2: Chạy lệnh qua Terminal / Command Prompt
```bash
npm start
```
hoặc:
```bash
node server.js
```

Sau khi màn hình thông báo khởi động thành công, mở trình duyệt:
- **Trên máy tính**: Mở [http://localhost:3030/](http://localhost:3030/)
- **Trên điện thoại** (kết nối cùng Wi-Fi): Nhập `http://<IP_MÁY_TÍNH>:3030/` (ví dụ `http://192.168.1.15:3030/`).

---

### 5. Hướng Dẫn Sử Dụng Trên Điện Thoại Di Động
1. Đảm bảo điện thoại và máy tính kết nối **chung một mạng Wi-Fi**.
2. Tìm địa chỉ IP máy tính:
   - **macOS**: Chạy lệnh `ipconfig getifaddr en0` trên Terminal.
   - **Windows**: Chạy lệnh `ipconfig` trên CMD (tìm dòng `IPv4 Address`).
3. Mở trình duyệt Safari / Chrome trên điện thoại, truy cập `http://<IP_MÁY_TÍNH>:3030`.
4. Bấm nút **Chia sẻ > Thêm vào Màn hình chính (Add to Home Screen)** để sử dụng như một App Canva độc lập!

---

## 🛠️ Công Nghệ Sử Dụng
- **Frontend**: Vanilla JS (ES6+), HTML5 Canvas, SVG Snapping Engine, CSS3 Flexbox/Grid, Responsive Touch Events.
- **Backend**: Node.js, Express.js.
- **Reverse Engineering Engine**: [REA (Reverse Engineer Anything)](https://github.com/morluto/rea) v6.7.0.

---

## 📌 Ghi Chú Bản Quyền
- Tác giả: **Duy Nguyễn (Nobitakuns)**
- Ghi chú: `coppy paste by VN`
- Repository: [https://github.com/Nobitakuns/canva-studio](https://github.com/Nobitakuns/canva-studio)
