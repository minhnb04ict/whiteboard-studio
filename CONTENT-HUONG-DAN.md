# Hai mục tiêu video — bản 1.5.0

Ứng dụng phục vụ cả kể chuyện và giải thích kiến thức. Chọn Mục tiêu video và Đối tượng khi tạo dự án, hoặc đổi trong dự án đang mở rồi bấm Áp dụng mục tiêu.

## Kể chuyện
Duy trì nhân vật, bối cảnh và diễn tiến lời kể. Mỗi cảnh minh họa một khoảnh khắc, không lặp cùng nhân vật qua nhiều tư thế trong một ảnh. Giữ hệ tham chiếu và kiểm tra ảnh của bản 1.4.0.

## Giải thích kiến thức
AI lập cho mỗi cảnh một mục tiêu học tập và kiểu minh họa:
- concept: ví dụ trực quan cho khái niệm;
- process: các bước/quy trình và hướng chuyển tiếp;
- comparison: so sánh, trước–sau;
- cause-effect: nguyên nhân và kết quả;
- structure: các bộ phận và quan hệ;
- counting: mô hình số lượng cụ thể.

Không ép thêm người dẫn chuyện hoặc nhân vật. Giữ số lượng, thứ tự, quan hệ từ nguồn; không bịa số liệu/công thức/cấu tạo. Sơ đồ nhiều bước, mũi tên, vật thể lặp theo giai đoạn được phép khi có mục đích giải thích; không coi đây là nhân vật bị nhân đôi.

Có thể dùng tối đa 6 nhãn ngắn lấy nguyên văn từ lời kể. Bộ xử lý từ chối kế hoạch nhãn không có trong nguồn. AI kiểm tra ảnh đối chiếu mục tiêu, nhãn và quan hệ nhìn thấy; ngắt ảnh lỗi và thử lại đúng cảnh. Vùng vẽ được đề xuất theo thứ tự học tập: thành phần trước, quan hệ hoặc bước tiếp theo sau.

Đối tượng: Tiểu học, THCS/THPT, Người lớn. Không còn bắt mọi nội dung phải theo phong cách dành cho tiểu học.

## Đổi mục tiêu của dự án cũ
Lời kể, thời gian gốc và lời đọc được giữ. Prompt cũ được giữ để tham khảo, nhưng đánh dấu cần cập nhật. Hồ sơ tạo hình và kế hoạch cảnh được lập lại. Bấm Đề xuất minh họa cần cập nhật, sau đó Đồng bộ lại ảnh chưa kiểm tra. Chỉ ảnh mới thành công mới thay ảnh cũ; không cần tạo lại giọng nếu lời đọc không đổi.

## Giới hạn cần hiểu
Các ràng buộc và vision review tăng tính phù hợp, không phải thẩm định kiến thức bởi chuyên gia. AI có thể vẽ sai hình học, số lượng, cấu tạo, chữ hoặc hướng mũi tên. Kiểm tra những chi tiết này trước khi dùng giảng dạy, đặc biệt với công thức, dữ liệu và kiến thức khoa học. Phụ đề cũng chưa có căn chính xác từng từ.

Build lại như bản 1.4.0: cập nhật mã nguồn, giữ .env/data/models/các môi trường Python, chạy npm install rồi npm run build:desktop. Không dùng Resume để đưa thay đổi tính năng vào bản portable.
