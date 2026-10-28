# Bản 1.7.0 — thư viện Piper và tạo ảnh bên ngoài

## Cài đặt / cập nhật

Luôn giải nén trọn ZIP mã nguồn. Tắt ứng dụng cũ, cập nhật mã nguồn nhưng giữ .env, data, models và .venv. Chạy npm install rồi npm start, nhấn Ctrl+F5 trên trình duyệt. Không cần tải lại giọng cũ hoặc cài lại Python nếu Piper 1.3.0 đã hoạt động. Máy chưa cài Piper chạy setup-piper-windows.bat. Bản EXE cần build đầy đủ bằng npm run build:desktop, không dùng -Resume.

## Thư viện giọng

- Mở Quản lý / tải giọng. Tìm tên giọng/mã vùng, tiếng Việt không dấu, tên ngôn ngữ tiếng Anh/bản địa. Lọc ngôn ngữ, chất lượng và đã tải/chưa tải. Các giọng được sắp xếp theo ngôn ngữ và tên; 5 lựa chọn cũ vẫn giữ ở đầu.
- Snapshot đi kèm có 177 model chính thức và 2 lựa chọn Việt cộng đồng (chung một model), tổng 179 lựa chọn / 178 model tải về. Số lượng không cố định: bấm Cập nhật danh sách để nhận catalog mới. Danh sách đi kèm dùng được offline; tải model/cập nhật catalog cần mạng.
- Tải về từng giọng, Tải nhóm đang lọc, hoặc Tải tất cả còn thiếu. Không tự tải toàn bộ khi mở ứng dụng. Giao diện hiển thị dung lượng ước tính (khoảng 10.95 GiB cho snapshot này); kiểm tra ổ đĩa trước khi xếp hàng cả nhóm.
- Tải lần lượt, kiểm checksum, giữ file hoàn chỉnh, không tải trùng model dùng chung. Dừng tải hoặc đóng ứng dụng sẽ giữ model đã hoàn tất; lần sau bấm tải nhóm/tất cả để tiếp tục phần còn thiếu. Tệp đang tải dở có thể tải lại từ đầu. Lỗi mạng/ổ đĩa/quyền ghi nghiêm trọng dừng hàng đợi; lỗi riêng một model cho phép tiếp tục model khác.
- Giọng nhiều người nói có ô chỉ số 0..N-1; chọn đúng người nói trước khi tạo lời đọc. Giọng mới có thể được chọn ở bộ lọc cạnh Giọng đọc hoặc nút Dùng giọng trong thư viện sau khi tải xong. Mỗi model đọc ngôn ngữ đã huấn luyện, không tự dịch văn bản.
- Thông tin và giấy phép giọng mở nguồn/model card riêng; các giấy phép có thể khác nhau. Đọc ghi chú nguồn khi dùng/phân phối model.

## Tạo ảnh đồng nhất bằng công cụ bên ngoài

1. Đề xuất minh họa như bình thường để có hồ sơ nhân vật, hoặc nhập hồ sơ thủ công. Chọn một cảnh và bấm Ảnh bằng AI bên ngoài.
2. Chốt Phong cách cố định và Nhân vật cố định. Hồ sơ này dành cho gói bên ngoài, không tự thay prompt/ảnh đã có của pipeline Agnes.
3. Tải ảnh mẫu riêng cho nhân vật/phong cách, gán nhãn rõ ràng. Ảnh giữ tỷ lệ; không sửa chi tiết bằng AI. Tối đa 8 ảnh. Có thể tạo từng ảnh mẫu bằng character-reference-prompts.txt trong gói xuất, duyệt xong rồi tải lại vào dự án.
4. Tải gói prompt + ảnh mẫu (.zip). Gói gồm README, hồ sơ, prompts.json, prompt tạo mẫu từng nhân vật, scenes/NNN.txt, references/ và ảnh cảnh đã có. Mỗi prompt có lời kể, mục tiêu kiến thức, cast, phong cách và danh sách ảnh cần đính kèm.
5. Khi dùng Gemini hoặc công cụ hỗ trợ ảnh tham chiếu, đính kèm cùng mẫu gốc cho mọi cảnh. Trong Midjourney V7 dùng Omni / Style Reference; V8.x dùng Edit Model Reference theo hướng dẫn phiên bản. Không dán đường dẫn cục bộ của ZIP như URL công khai.
6. Tạo và duyệt cảnh đầu, nhập ảnh vào đúng cảnh bằng Tải ảnh lên, rồi xuất lại gói để có thêm ảnh neo. Ảnh trước chỉ bổ sung ngữ cảnh; giữ mẫu nhân vật gốc để hạn chế trôi tạo hình. Cảnh sau không lấy ảnh của cảnh tương lai làm tham chiếu.
7. Sao chép prompt của cảnh đang chọn hoặc xuất cả gói. Ứng dụng không tự gọi/đăng nhập dịch vụ AI ngoài; không cần cung cấp khóa API của dịch vụ đó cho ứng dụng. Kiểm tra khuôn mặt, trang phục, số nhân vật, chữ và nội dung kiến thức trước khi nhập ảnh.

Ảnh tham chiếu + hồ sơ cố định giúp giảm lệch, không bảo đảm giống 100%. Seed giống nhau không thay thế được ảnh tham chiếu. Sơ đồ kiến thức vẫn được phép có nhiều bước, mũi tên và đối tượng lặp có chủ đích; tránh trùng nhân vật riêng lẻ ngoài yêu cầu.

Nguồn nghiên cứu kiểm tra ngày 19/10/2026:
https://huggingface.co/rhasspy/piper-voices/raw/main/voices.json
https://deepmind.google/models/gemini-image/prompt-guide/
https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference
https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
