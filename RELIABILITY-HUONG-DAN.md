# Bản 1.6.5 — giới hạn chờ và phục hồi gọi Agnes

Đã sửa các điểm khiến ứng dụng trông như đứng yên khi chia cảnh/tạo ảnh/kiểm tra ảnh.

- Thời gian mặc định mỗi lượt: văn bản 90 giây, kiểm tra ảnh 120 giây, tạo ảnh 180 giây. Một deadline bao trùm kết nối, chờ header và đọc hết body; hủy sẽ ngắt cả quá trình. Budget của một lần gọi API gồm các lần thử và khoảng nghỉ: văn bản 150 giây, vision 180 giây, ảnh 240 giây. Một cảnh có thể cần nhiều bước API khác nhau, nên đây không phải tổng thời gian của cả cảnh/dự án.
- Văn bản tối đa một lần thử lại cho lỗi kết nối hoặc quá tải xác định. Lỗi timeout dừng để kiểm tra trước khi gửi lại. Giá trị cũ AGNES_RETRIES=3 được giới hạn còn 1. Ảnh không tự gửi lại khi đứt mạng/timeout vì không biết máy chủ đã tạo hay chưa. Phản hồi quá tải 429/503 rõ ràng vẫn dùng retry/cooldown giới hạn và một lượt kiểm tra phục hồi của queue.
- Nhật ký cập nhật mỗi 10 giây, phân biệt đang chờ máy chủ/đang nhận dữ liệu, báo HTTP và thời gian hoàn thành. Lỗi DNS/kết nối có mã mạng nếu nhận được từ Node. Không ghi API key.
- Không dùng vòng sửa cấu trúc nội dung để thử lại lỗi mạng/chia cảnh timeout. Lỗi dịch vụ/kết nối/token sẽ dừng batch, giữ cảnh thành công, đánh lỗi cảnh hiện tại và để nguyên phần chưa làm để thử tiếp.
- Ảnh tạm đã lưu được giữ khi kiểm tra ảnh timeout; thử lại dùng cùng ảnh, tránh tốn lượt tạo mới. Download URL ảnh có deadline 90 giây gồm DNS/redirect/body.
- Polling giao diện có giới hạn 15 giây; báo chưa cập nhật được trạng thái và tự kết nối lại. Không tự thử lại POST/PUT khi chưa xác định máy chủ đã nhận hay chưa. Nhập/tải file phụ đề, thao tác giọng và sửa bộ cài Piper của các bản trước được giữ.

## Cập nhật khi chạy CMD

Tắt ứng dụng cũ bằng Ctrl+C. Giải nén ZIP mới, chép đè mã nguồn nhưng giữ .env, data, models và .venv. Chạy npm install rồi npm start. Trên trình duyệt nhấn Ctrl+F5 để tải mã giao diện mới. Không cần cài lại Python cho thay đổi này. Tác vụ đang chạy từ bản cũ sẽ được đánh dấu gián đoạn khi khởi động; chọn dự án rồi bấm Thử lại phần lỗi / chưa xong.

.env cũ được giữ nguyên; các timeout mới có mặc định trong mã nên không bắt buộc sửa tay. Khi dùng bản EXE, build đầy đủ bằng npm run build:desktop, không dùng -Resume.

## Phạm vi kiểm tra

64/64 kiểm thử đạt; thử máy chủ HTTP thật tại localhost với header/body bị treo và kết nối đứt; kiểm tra UI báo mất kết nối rồi tự phục hồi. Chưa gọi Agnes thật hay chạy Windows EXE trong lượt này. Không bảo đảm dịch vụ bên ngoài luôn đáp ứng; thay đổi giúp giới hạn chờ, hiển thị đúng trạng thái và giữ tiến độ khi lỗi.

# Bản 1.6.1 — hàng đợi và phục hồi khi Agnes quá tải

## Hành vi mới

- Mỗi thời điểm chỉ gửi một yêu cầu Agnes. Yêu cầu ảnh cách nhau tối thiểu 8 giây theo mặc định.
- HTTP 429/502/503/504 sẽ chờ tăng dần, có độ lệch ngẫu nhiên nhỏ và tôn trọng Retry-After. Ảnh: tối đa 2 lần thử lại trong một lượt; văn bản theo AGNES_RETRIES (mặc định 3, giới hạn 3).
- Nếu dịch vụ vẫn quá tải, tác vụ chuyển sang “Đang chờ”, lưu thời điểm thử lại và tự tiếp tục. Không tiếp tục gửi dồn vào các cảnh sau. Chỉ một lượt kiểm tra phục hồi, gửi một yêu cầu thay vì lặp cả chu kỳ thử lại. Nếu vẫn quá tải, dừng tự động và cho thử lại phần chưa xong.
- Có thể bấm Hủy trong lúc chờ. Việc hủy ở ứng dụng không đảm bảo hủy được yêu cầu mà Agnes đã nhận.
- Cảnh đã thành công giữ nguyên. Cảnh lỗi vĩnh viễn được ghi nhận; cảnh khác vẫn tiếp tục khi không có lỗi quá tải. Nút thử lại chỉ xử lý phần chưa hoàn tất của tác vụ trước.
- Ảnh được lưu tạm trước khi kiểm tra bằng AI. Nếu kiểm tra lỗi, lần tiếp theo dùng lại ảnh này; không tạo lại ảnh từ đầu. URL ảnh được giữ nội bộ để tải tiếp nếu tải thất bại. Nếu mô tả, hồ sơ hoặc ảnh tham chiếu thay đổi, ảnh tạm cũ được loại bỏ.
- Phản hồi JSON lỗi được yêu cầu sửa định dạng một lần. Mô tả cảnh sai cast/visualPlan được yêu cầu sửa riêng cảnh đó một lần. Không chấp nhận nội dung sai cấu trúc để bỏ qua kiểm tra.
- Mất kết nối/timeout khi tạo ảnh: ghi lỗi rõ ràng và cho thử lại riêng cảnh. Không tự gửi lại ngay vì chưa biết Agnes đã nhận yêu cầu trước hay chưa.
- Trạng thái chờ và thời gian nghỉ API được lưu trên ổ đĩa. Mở lại ứng dụng sẽ tiếp tục tác vụ đang chờ. Tác vụ đang chạy khi ứng dụng dừng được đánh dấu gián đoạn để thử lại an toàn.

## Chờ có giới hạn và nhật ký rõ ràng

Thời gian nghỉ tự tính tối đa khoảng 35 giây mỗi lần (gồm độ lệch ngẫu nhiên); tổng nghỉ trong một lượt gọi tối đa 120 giây. Retry-After từ Agnes được tôn trọng. Nếu Agnes yêu cầu nghỉ hơn 120 giây, ứng dụng dừng tự động và báo thời gian cần chờ, thay vì giữ tác vụ chờ quá lâu.

Nhật ký ghi riêng “Nghỉ sau phản hồi quá tải” và “Đang gửi yêu cầu ... tới Agnes”. Bộ đếm nghỉ chỉ giảm; việc kiểm tra hàng đợi không kéo dài thời điểm đó. Thời gian nghỉ 130+ giây tự lưu từ phiên bản cũ được chuẩn hóa một lần khi khởi động. Không cần xóa dự án hoặc file dữ liệu.

## Bố cục

Mục tiêu/đối tượng, số cảnh và minh họa nằm trong ba nhóm riêng. Quản lý giọng và kiểm tra môi trường là hai nút tách nhau. Nút xóa nhỏ nằm trên góc phải từng dự án ở cột trái, có xác nhận và chặn khi dự án đang chạy. Xóa dự án khác không làm mất dự án đang mở.

## Cấu hình

Không cần sửa .env cũ. Khi chưa khai báo, ứng dụng dùng mặc định mới:

```env
AGNES_IMAGE_RETRIES=2
AGNES_IMAGE_INTERVAL_MS=8000
```

AGNES_RETRIES/AGNES_MIN_INTERVAL_MS điều khiển văn bản. Không nên đặt khoảng cách bằng 0 khi dùng thật. Thời gian chờ hiển thị là thời điểm sớm nhất; hàng đợi khác có thể làm bắt đầu muộn hơn, hàng đợi được đánh thức theo thời điểm cần thử lại.

Không thể đảm bảo API ngoài luôn hoạt động. Bản này giảm gửi dồn, giữ tiến độ, phục hồi lỗi tạm thời; không sửa được việc nhà cung cấp hết công suất, tài khoản hết hạn hoặc mạng mất kết nối.

## Cập nhật và build Windows

1. Đóng ứng dụng, sao lưu thư mục cũ.
2. Giải nén mã nguồn mới vào thư mục riêng. Giữ .env hiện dùng; sao chép data và models cũ nếu cần giữ dự án/giọng đã tải.
3. Chạy trong thư mục mã nguồn mới:

```bat
npm install
npm run build:desktop
```

Không dùng -Resume cho lần cập nhật mã nguồn này. Bộ build Windows tạo bản portable với Node, Python và FFmpeg đi kèm; người dùng cuối giải nén và chạy EXE. Cần mạng để gọi Agnes và tải giọng chưa cài. Phiên bản này chưa được build EXE trên Windows trong môi trường kiểm thử hiện tại.
