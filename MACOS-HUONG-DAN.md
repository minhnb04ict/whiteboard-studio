# Whiteboard Studio — macOS 1.9.0

Gói mã nguồn này có bộ build ứng dụng **Whiteboard Studio.app**. Đây chưa phải binary macOS đã biên dịch. Build phải thực hiện trên máy Mac; môi trường phát triển hiện tại là Linux, chưa biên dịch/chạy AppKit/WebKit trên Mac.

## Máy dùng ứng dụng sau khi build

- macOS **13.5 trở lên**.
- Dùng gói `macOS-arm64` cho Apple Silicon (M1/M2/M3/M4...), hoặc `macOS-x64` cho Mac Intel. Không trộn gói; hiện không phải Universal app.
- Ứng dụng đóng kèm Node 24.11.1, Python 3.12.10, thư viện render, FFmpeg và Piper 1.3.0. Máy nhận không phải tự cài Node, Python hoặc uv. Model giọng chọn và tải trong ứng dụng như Windows, không đóng kèm toàn bộ model.
- Cửa sổ dùng WebKit có sẵn của macOS, mở máy chủ `127.0.0.1:3000`; không cần Chrome. Các trình duyệt khác trên máy không bị quản lý/tắt.
- Đóng cửa sổ chính hoặc Cmd+Q sẽ dừng phiên, máy chủ và các tiến trình Python/FFmpeg thuộc phiên. Thu nhỏ hoặc Cmd+R không tắt máy chủ. Nếu cổng đã có chương trình khác sử dụng, ứng dụng báo lỗi và không tự giết chương trình đó.

## Chuẩn bị máy BUILD (một lần)

Cần Internet, Node.js **22+** và Xcode Command Line Tools. Cài Node từ https://nodejs.org/en/download rồi mở Terminal mới. Trong Terminal:

```bash
xcode-select --install
```

Đợi cài xong. Cài **uv** theo hướng dẫn chính thức https://docs.astral.sh/uv/getting-started/installation/ rồi mở Terminal mới. Có thể dùng lệnh cài chính thức:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Kiểm tra:

```bash
node --version
uv --version
xcrun --find swiftc
```

Chạy Terminal và Node cùng kiến trúc máy: arm64 trên Apple Silicon, x64 trên Intel; không chọn Open using Rosetta để build bản arm64. Muốn hai gói, thực hiện build trên hai máy/runner cùng kiến trúc tương ứng. Không có chức năng cross-build từ Windows/Linux.

## Build

1. Giải nén **toàn bộ** source ZIP. Mở Terminal ở thư mục `whiteboard-studio` (thư mục chứa package.json).
2. Chạy:

```bash
npm run build:mac
```

Không cần chạy `npm run setup` để build: bộ build tự tải Node/Python đúng kiến trúc và cài thư viện vào bundle; không dùng .venv của máy build. Có thể nhấp `build-macos.command` thay thế. Nếu file không có quyền chạy sau khi copy:

```bash
chmod +x build-macos.command
./build-macos.command
```

3. Kết quả:

- Apple Silicon: `release/WhiteboardStudio-macOS-arm64/Whiteboard Studio.app` và `release/WhiteboardStudio-macOS-arm64.zip`.
- Intel: `release/WhiteboardStudio-macOS-x64/Whiteboard Studio.app` và `release/WhiteboardStudio-macOS-x64.zip`.

Bộ build kiểm SHA256 Node, chỉ cài wheel nhị phân, biên dịch launcher native, sao chép app sang đường dẫn khác có khoảng trắng/tiếng Việt rồi kiểm Sharp, Python, thư viện native, phát âm Việt/Anh và xuất H.264 thật. Nếu một bước lỗi, build dừng, không báo gói sẵn sàng. Python được sao chép dạng standalone với symlink tương đối; không chép venv có đường dẫn tuyệt đối từ máy build.

Mỗi lần build dùng thư mục tạm mới. App cũ trong release được đổi tên backup, không xóa dữ liệu người dùng. Gói portable không sao chép .env thật, data, models hoặc node_modules từ máy build. Người nhận phải nhập khóa AI của mình; giọng có thể tải từ thư viện Piper.

## Mở ứng dụng và khóa AI

1. Giải nén ZIP portable, kéo **Whiteboard Studio.app** vào Applications, rồi mở.
2. Nếu macOS chặn vì ứng dụng chưa được Apple xác minh, dùng **System Settings → Privacy & Security → Open Anyway** nếu bạn tin cậy chính bản mình build. Không tắt Gatekeeper toàn hệ thống. Tùy chính sách máy/quản trị, có thể cần bản Developer ID ký và notarize.
3. Menu **Whiteboard Studio → Cấu hình khóa AI…** mở .env riêng bằng TextEdit. Nhập khóa ở `AGNES_API_KEY=...`, giữ file dạng plain text và lưu đúng tên `.env` (không thêm .txt). Thoát rồi mở lại ứng dụng sau khi sửa cấu hình.
4. Chia cảnh, đề xuất/copy prompt, nhập ảnh, tạo lời đọc và xuất video như bản Windows. Bản này vẫn không tạo ảnh trực tiếp qua API. Sao chép prompt dùng cầu nối clipboard native; tải ảnh vào bằng bảng chọn tệp của hệ thống. Lưu video/ZIP/SRT bằng hộp Save của macOS.

Dữ liệu riêng của mỗi tài khoản nằm tại:

```text
~/Library/Application Support/Whiteboard Studio/
  .env
  data/
  models/piper/
  desktop.log
```

Có mục **Mở thư mục dữ liệu** trong menu ứng dụng. Thay .app không xóa thư mục này. Muốn chuyển dự án từ Windows, thoát cả hai bản, sao chép nội dung `data` và `models/piper` cũ vào thư mục tương ứng trên Mac; không sao chép đường dẫn runtime Windows hoặc ghi đè .env riêng của Mac. Không đóng gói thư mục dữ liệu cá nhân vào ZIP phát hành.

## Ký và phát hành

Build tự ký **ad-hoc** để dùng/thử tại chỗ, không phải chứng thực Developer ID và không notarize. Chữ ký ad-hoc không bảo đảm máy khác sẽ tự tin cậy ứng dụng. Phát hành rộng cần Apple Developer ID, ký nested code và notarization theo hướng dẫn Apple. Không có khóa/chứng chỉ cá nhân nào được đưa vào source.

## Checklist trên máy Mac thật trước khi chia sẻ

- Build native đúng kiến trúc và kiểm runtime/relocation thành công; mở từ Applications trên máy không có Node/Python/uv.
- Mở/đóng/mở lại app; cổng 3000 được trả lại, dữ liệu giữ nguyên. Thử Cmd+Q khi đang render; không còn Python/FFmpeg của phiên.
- Mở phiên thứ hai chỉ đưa phiên cũ lên trước. Cổng do ứng dụng khác chiếm phải báo lỗi và giữ ứng dụng đó.
- Nhập TXT/SRT, tạo dự án, chia cảnh/prompt bằng khóa hợp lệ; thử khóa sai/quá tải và Hủy.
- Nhập ảnh cảnh/ảnh mẫu, copy prompt, lưu ZIP/SRT/MP4 bằng Save panel, hủy bảng chọn tệp không gây lỗi. Đặc biệt kiểm download native trực tiếp, clipboard và WebKit.
- Tải một giọng Việt và một giọng Anh, tạo audio thật và xuất Full HD có âm thanh; kiểm màu nền và thời lượng. Các test phonemizer lúc build không thay thế kiểm phát giọng bằng model thật.
- Kiểm Activity Monitor sau khi đóng và thử khi đường dẫn/tên tài khoản có dấu/khoảng trắng. Kiểm Gatekeeper trên máy khác nếu phân phối.

## Nguồn kỹ thuật

- Node 24 yêu cầu macOS 13.5: https://nodejs.org/en/blog/migrations/v22-to-v24
- uv managed Python: https://docs.astral.sh/uv/guides/install-python/ và https://docs.astral.sh/uv/reference/cli/
- Piper 1.3.0 có wheel ARM64/Intel: https://pypi.org/project/piper-tts/1.3.0/
- AppKit vòng đời cửa sổ: https://developer.apple.com/documentation/appkit/nsapplicationdelegate/applicationshouldterminateafterlastwindowclosed(_:)
- WebKit download: https://developer.apple.com/documentation/webkit/wkdownloaddelegate
