# Desktop 2.0.0

Xem STUDIO-2.0-HUONG-DAN.md cho giao diện và VieNeu mới. Build đầy đủ lại từ mã nguồn 2.0, không dùng -Resume của bản cũ.

# Desktop 1.7.1 — tự tắt khi đóng cửa sổ Chrome

## Hoạt động

EXE chạy Node supervisor trong Windows Job Object, sau đó mới cho phép supervisor khởi động máy chủ local và Chrome. Chrome mở dạng app window tại 127.0.0.1:3000 với user-data-dir riêng được giữ lại, không dùng profile/tài khoản Chrome cá nhân. Việc reload trang hoặc thu nhỏ cửa sổ không dừng server.

Đóng cửa sổ ứng dụng: supervisor gửi shutdown có xác thực, dừng tiến trình sở hữu và thoát. Launcher còn theo dõi HWND cửa sổ Whiteboard Studio để xử lý trường hợp Chrome còn chạy nền hoặc mở thêm cửa sổ ngoài; sau đó đóng Job Object để dọn cả Node/Python/FFmpeg/Chrome con. Launcher cũng thoát và giải phóng cổng. Không kill theo tên chrome.exe/node.exe trên toàn máy.

Mở lại EXE để dùng tiếp. Nếu phiên đang mở, EXE thứ hai chỉ gửi yêu cầu đưa cửa sổ hiện tại lên trước. Dữ liệu trong data/models không bị xóa; profile Chrome riêng được giữ ở `%LOCALAPPDATA%\WhiteboardStudio\ChromeProfile-3000` để lưu phiên đăng nhập. Đang làm tác vụ thì đóng sẽ hủy phần đang chạy, giữ kết quả đã lưu để thử lại sau.

## Tìm Chrome

Tự tìm CHROME_PATH (nếu có), thư mục LOCALAPPDATA/Program Files/Program Files (x86)/ProgramW6432, PATH, và Windows App Paths HKCU/HKLM ở cả Registry32/64. Đọc registry bằng UTF-8 để không mất đường dẫn có dấu. Không gắn tên user hay ổ đĩa cài Chrome cố định. Nếu chưa có Chrome thì phải cài; nếu cài chỗ riêng và chưa đăng ký, đặt CHROME_PATH trong .env.

## Build trên Windows

Cập nhật toàn bộ src, scripts, desktop và các tệp mã nguồn mới. Tắt bản EXE/CMD cũ. Giữ .env/data/models và môi trường Python hiện có.

```bat
npm install
npm run build:desktop
```

Lần này cần build đầy đủ, KHÔNG dùng -Resume: phải biên dịch Launcher.cs + ProcessJob.cs và chép supervisor mới. Máy build cần Windows x64, Node >=22, Python 3.12 x64, .NET Framework C# compiler và VC++ runtime như các bản trước. Compiler dùng /codepage:65001 cho thông báo tiếng Việt.

Kết quả: release/WhiteboardStudio-Windows-x64/WhiteboardStudio.exe và release/WhiteboardStudio-Windows-x64.zip. Bản source ZIP chỉ chứa mã nguồn, không phải bản portable đã build. Runtime Node/Python/FFmpeg được gói khi build; người dùng cuối chỉ cần Windows 10/11 x64 và Chrome có sẵn.

## Kiểm tra trên máy Windows sau build

1. Mở Chrome thông thường với một tab riêng. Chạy EXE và xác nhận cửa sổ Whiteboard Studio riêng mở được cổng 3000.
2. Thu nhỏ, mở lại, Ctrl+F5: ứng dụng vẫn chạy. Nhấp EXE lần hai: cửa sổ hiện tại được đưa lên, không tạo server mới.
3. Đóng cửa sổ ứng dụng: chờ khoảng vài giây, kiểm tra URL không còn kết nối; Chrome thông thường không đóng. Mở lại EXE, dự án cũ còn nguyên.
4. Đang tạo giọng/render/tải giọng: đóng ứng dụng, kiểm tra nhóm Node/Python/FFmpeg con thoát. Kết quả đã lưu vẫn có để thử lại.
5. Mở link ngoài từ ứng dụng rồi đóng cửa sổ Whiteboard Studio chính: launcher phải dừng phiên ứng dụng cả khi Chrome nền còn sống.
6. Chạy CMD npm start chiếm 3000 rồi mở EXE: EXE phải báo bận cổng và không dừng tiến trình CMD.
7. Thử Chrome ở LOCALAPPDATA và đường dẫn có dấu/khoảng trắng; kiểm tra máy có chính sách doanh nghiệp nếu bị chặn user-data-dir hoặc Job Object.

Tham khảo thiết kế:
https://www.chromium.org/developers/creating-and-using-profiles/
https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects
https://learn.microsoft.com/en-us/windows/win32/shell/app-registration

Chưa thực thi build/EXE Windows trong môi trường Linux của lượt sửa này. Test Node có trình duyệt giả kiểm tra lifecycle thật của server/cổng và bảo toàn dữ liệu; test HWND/Job Object cần chạy trên Windows.
