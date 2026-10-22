# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG CANVA PRO DESIGN STUDIO CHI TIẾT TỪ A - Z 🎨

> **Ghi chú**: `coppy paste by VN`  
> **Dự án**: Canva Pro Design Studio (Web Clone 100% Canva.com + Tích hợp REA)  
> **Repository**: [https://github.com/Nobitakuns/canva-studio](https://github.com/Nobitakuns/canva-studio)

---

## MỤC LỤC
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt môi trường Node.js (Dành cho máy mới)](#2-cài-đặt-môi-trường-nodejs-dành-cho-máy-mới)
3. [Tải và cài đặt mã nguồn dự án](#3-tải-và-cài-đặt-mã-nguồn-dự-án)
4. [Cách khởi chạy ứng dụng](#4-cách-khởi-chạy-ứng-dụng)
5. [Hướng dẫn sử dụng trên điện thoại (Mobile)](#5-hướng-dẫn-sử-dụng-trên-điện-thoại-mobile)
6. [Hướng dẫn sử dụng các tính năng thiết kế](#6-hướng-dẫn-sử-dụng-các-tính-năng-thiết-kế)
7. [Khắc phục sự cố thường gặp (FAQ & Troubleshooting)](#7-khắc-phục-sự-cố-thường-gặp-faq--troubleshooting)

---

## 1. Yêu Cầu Hệ Thống

Ứng dụng hoạt động mượt mà trên mọi hệ điều hành phổ biến:
* **Hệ điều hành máy chủ (Server)**:
  * macOS (Apple Silicon M1/M2/M3/M4 hoặc Intel)
  * Windows 10 / Windows 11
  * Linux (Ubuntu, Debian, Fedora, Arch,...)
* **Môi trường chạy**: Node.js phiên bản **18.x** trở lên (khuyên dùng Node.js 20 LTS hoặc Node.js 22 LTS).
* **Trình duyệt truy cập**:
  * **Máy tính**: Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox, Brave.
  * **Điện thoại / Tablet**: Safari (iOS / iPadOS), Chrome (Android / iOS).

---

## 2. Cài Đặt Môi Trường Node.js (Dành Cho Máy Mới)

Nếu máy tính của bạn chưa có sẵn Node.js, hãy làm theo hướng dẫn sau:

### 👉 Trên máy Mac (macOS):
* **Cách 1 (Khuyên dùng - Nhanh nhất)**:
  1. Truy cập trang chủ: [https://nodejs.org/](https://nodejs.org/)
  2. Bấm tải bản **LTS (Long Term Support)** với file `.pkg`.
  3. Mở file vừa tải về và bấm *Tiếp tục (Continue)* theo hướng dẫn để cài đặt.
* **Cách 2 (Dùng Homebrew qua Terminal)**:
  ```bash
  brew install node
  ```

### 👉 Trên máy Windows:
1. Truy cập trang chủ: [https://nodejs.org/](https://nodejs.org/)
2. Bấm tải bản **LTS Windows Installer (.msi)**.
3. Chạy file cài đặt, chọn *Next* liên tục và nhấn *Finish*.

### 🔍 Kiểm tra cài đặt thành công:
Mở Terminal (macOS) hoặc Command Prompt (cmd trên Windows), gõ 2 lệnh sau:
```bash
node -v
npm -v
```
Nếu màn hình hiện số phiên bản (ví dụ: `v22.23.3` và `10.9.2`) tức là bạn đã sẵn sàng!

---

## 3. Tải Và Cài Đặt Mã Nguồn Dự Án

Bạn có thể sử dụng bất kỳ cách nào trong 3 cách sau:

### 🟢 Cách A: Sử dụng thư mục có sẵn trên máy của bạn
Nếu bạn đang ở máy tính cá nhân đã được tạo sẵn dự án tại thư mục:
```bash
cd "/Users/masterdzj/Documents/web/canvas"
```
Mọi thư viện `node_modules` đã được cài đặt sẵn 100%, bạn có thể bỏ qua bước `npm install` và tiến hành khởi chạy ngay.

---

### 🟢 Cách B: Tải về từ GitHub (Dành cho máy khác hoặc bạn bè)
1. Mở Terminal / Command Prompt và sao chép mã nguồn:
   ```bash
   git clone https://github.com/Nobitakuns/canva-studio.git
   cd canva-studio
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```

---

### 🟢 Cách C: Sử dụng file nén `canvas-studio-full.zip`
1. Tìm file `canvas-studio-full.zip` trong thư mục `Documents/web/`.
2. Nhấp đúp chuột để giải nén (hoặc chuột phải chọn *Extract Here*).
3. Mở Terminal trỏ vào thư mục giải nén:
   ```bash
   cd canvas-studio
   npm install
   ```

---

## 4. Cách Khởi Chạy Ứng Dụng

### ⚡ Cách 1: Khởi động 1-Click trên macOS (Dễ nhất - Không cần gõ lệnh)
Trong thư mục dự án đã có sẵn 2 file khởi động nhanh:
- `Start_Canva.command`
- `Khởi_Động_Canva.command`

**Thao tác**:
1. Nhấp đúp chuột (Double-click) vào file `Start_Canva.command`.
2. Hệ thống sẽ tự động bật cửa sổ Terminal, khởi chạy server ngầm và **tự động mở trình duyệt web** tại trang thiết kế Canva `http://localhost:3030`.

> **Mẹo bảo mật macOS**: Nếu macOS báo thông báo "cannot be opened because it is from an unidentified developer" hoặc quyền thực thi:
> Mở Terminal và dán lệnh sau một lần duy nhất:
> ```bash
> chmod +x /Users/masterdzj/Documents/web/canvas/*.command
> ```

---

### ⚡ Cách 2: Khởi chạy bằng lệnh Terminal / CMD
Mở Terminal và gõ:
```bash
cd "/Users/masterdzj/Documents/web/canvas"
npm start
```
*(hoặc dùng lệnh `node server.js`)*

Màn hình sẽ hiển thị:
```text
=====================================================
🎨 CANVA PRO STUDIO - REA EDITION (100% REPLICA)
=====================================================
⚡ Local:    http://localhost:3030
🌐 Network:  http://192.168.1.15:3030  (cho điện thoại)
-----------------------------------------------------
> Note: coppy paste by VN
=====================================================
```
Bây giờ, mở trình duyệt của bạn lên và gõ: **`http://localhost:3030`**.

---

### ⚡ Cách 3: Chạy ẩn vĩnh viễn với PM2 (Tự động khởi động cùng máy)
Nếu bạn muốn server luôn chạy ngầm kể cả khi tắt Terminal:
```bash
npm install -g pm2
cd "/Users/masterdzj/Documents/web/canvas"
pm2 start server.js --name "canva-studio"
pm2 save
pm2 startup
```
- Xem trạng thái: `pm2 status`
- Dừng ứng dụng: `pm2 stop canva-studio`
- Khởi động lại: `pm2 restart canva-studio`

---

## 5. Hướng Dẫn Sử Dụng Trên Điện Thoại (Mobile)

Ứng dụng được tối ưu hóa đặc biệt với giao diện **Canva Mobile App**:

### 📱 Bước 1: Kết nối chung mạng Wi-Fi
Đảm bảo điện thoại của bạn và máy tính đang cùng kết nối vào **một mạng Wi-Fi gia đình / văn phòng**.

### 📱 Bước 2: Lấy địa chỉ IP của máy tính
- **Trên macOS**:
  Mở Terminal và gõ:
  ```bash
  ipconfig getifaddr en0
  ```
  *(Nếu dùng Wi-Fi máy sẽ trả về dạng `192.168.1.X` hoặc `192.168.0.X`)*.
- **Trên Windows**:
  Mở CMD gõ `ipconfig`, tìm dòng `IPv4 Address`.

### 📱 Bước 3: Mở trình duyệt trên điện thoại
Mở Safari (iPhone) hoặc Chrome (Android), nhập vào thanh địa chỉ:
```text
http://<ĐỊA_CHỈ_IP_MÁY_TÍNH>:3030
```
*(Ví dụ: `http://192.168.1.15:3030`)*

### 📱 Bước 4: Trải nghiệm Canva Mobile mượt mà
1. **Nút Tròn Nổi Lớn `[ ➕ ]`**:
   - Nằm ở góc dưới bên phải màn hình.
   - Bấm vào để trượt khay menu (Bottom Sheet) chọn thêm: Chữ cái, Mẫu thiết kế, Hình khối, Tải ảnh từ thư viện điện thoại.
2. **Cảm ứng đa điểm (Touch Gestures)**:
   - Dùng ngón tay chạm chọn và kéo di chuyển đối tượng trên khung vẽ.
   - Chạm vào các chấm tròn góc để phóng to / thu nhỏ.
   - Nhấp đúp vào chữ để bàn phím ảo bật lên và sửa nội dung.
3. **Thêm vào Màn hình chính (Cài đặt như Native App)**:
   - Trên Safari iOS: Bấm nút **Chia sẻ (Share)** > Chọn **Thêm vào MH chính (Add to Home Screen)**.
   - Trên Chrome Android: Bấm menu `⋮` > Chọn **Thêm vào màn hình chính**.
   - Ứng dụng sẽ xuất hiện icon ngoài màn hình điện thoại và mở toàn màn hình (Full Screen) như app Canva tải từ App Store!

---

## 6. Hướng Dẫn Sử Dụng Các Tính Năng Thiết Kế

### 🎨 1. Thanh Công Cụ Trên Cùng (Top Navigation)
- **Đổi cỡ & Magic Switch**: Bấm vào để đổi kích thước chuẩn (Instagram 1080x1080, Story 1080x1920, YouTube Thumbnail 1280x720, Facebook Banner,...).
- **Hoàn tác / Làm lại**: Bấm `↺` (Ctrl+Z) và `↻` (Ctrl+Y).
- **Trạng thái lưu**: Đám mây tự động lưu sau mỗi thao tác (`✔ Đã lưu`).
- **Nút Chia sẻ (Share)**: Tải xuống thiết kế chất lượng cao dạng file **PNG** (có tùy chọn nền trong suốt Transparent) hoặc **JPG**.

### 🖌️ 2. Thanh Công Cụ Ngữ Cảnh (Contextual Toolbar)
Khi bạn nhấp chọn bất kỳ đối tượng nào trên trang vẽ:
- **Với Văn bản (Text)**: Đổi Font chữ (Inter, Playfair Display, Montserrat, Oswald, Dancing Script,...), tăng giảm cỡ chữ, chọn bảng màu chữ, in đậm (**B**), in nghiêng (*I*), gạch chân (<u>U</u>), căn lề (Trái/Giữa/Phải), căn giữa trang vẽ.
- **Với Hình khối (Shapes)**: Đổi màu tô, bo góc, căn lề.
- **Với Hình ảnh (Images)**: Tự do co giãn tỷ lệ giữ nguyên độ nét.

### 📐 3. Thao Tác Trực Tiếp Trên Khung Vẽ (Artboard)
- **8 Điểm Co Giãn (Handles)**: Kéo 4 góc để phóng to/thu nhỏ đồng tỷ lệ; kéo 4 cạnh để kéo dãn chiều ngang/chiều dọc.
- **Tay Cầm Xoay 360°**: Kéo tay xoay phía trên để xoay đối tượng; tự động hít (snap) khi về gần góc vuông 0°, 90°, 180°, 270°.
- **Thước Kẻ Thông Minh (Purple Smart Guides)**: Tự động xuất hiện đường viền tím khi đối tượng thẳng hàng hoặc nằm chính giữa khung vẽ.
- **Phím Tắt Tiện Lợi**:
  - `Delete` hoặc `Backspace`: Xóa đối tượng đang chọn.
  - `Ctrl + C` / `Cmd + C`: Sao chép đối tượng.
  - `Ctrl + V` / `Cmd + V`: Dán đối tượng.
  - `Phím mũi tên`: Dịch chuyển đối tượng từng pixel cực chuẩn xác.

### 🪄 4. Tích Hợp REA (Reverse Engineer Anything)
- Bấm vào mục **REA Inspector** trên thanh công cụ bên trái.
- Nhập URL của một trang web bất kỳ.
- Công nghệ REA sẽ quét và trích xuất bảng màu, cấu trúc giao diện và hình ảnh để đưa trực tiếp lên trang vẽ của bạn!

---

## 7. Khắc Phục Sự Cố Thường Gặp (FAQ & Troubleshooting)

### ❓ Câu 1: Báo lỗi "EADDRINUSE: address already in use :::3030"?
* **Nguyên nhân**: Đang có một tiến trình server khác chạy chiếm cổng 3030.
* **Cách xử lý**:
  - Mở Terminal và tìm tiến trình đang chiếm cổng:
    ```bash
    lsof -i :3030
    ```
  - Tắt tiến trình đó:
    ```bash
    kill -9 $(lsof -t -i :3030)
    ```
  - Sau đó khởi chạy lại: `npm start`.

---

### ❓ Câu 2: Điện thoại không mở được địa chỉ IP máy tính?
* **Kiểm tra**:
  1. Đảm bảo điện thoại và máy tính kết nối cùng 1 sóng Wi-Fi (không dùng 4G/5G trên điện thoại).
  2. Tắt phần mềm VPN (nếu có đang bật trên máy tính hoặc điện thoại).
  3. Trên macOS: Vào *System Settings > Network > Firewall* kiểm tra xem tường lửa có đang chặn kết nối đến hay không.

---

### ❓ Câu 3: Làm sao để cập nhật code mới nhất từ GitHub?
Mở Terminal tại thư mục dự án và gõ:
```bash
git pull origin main
npm install
```

---

## 🏆 Thông Tin Bản Quyền & Tác Giả
- **Author**: Duy Nguyễn (Nobitakuns)
- **Ghi chú**: `coppy paste by VN`
- **GitHub Repository**: [https://github.com/Nobitakuns/canva-studio](https://github.com/Nobitakuns/canva-studio)
- **Công nghệ**: Node.js, Express, HTML5 Canvas, SVG Snapping Engine, REA Reverse Engineering.
