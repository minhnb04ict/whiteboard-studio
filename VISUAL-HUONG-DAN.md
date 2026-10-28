# Prompt và ảnh bên ngoài — 1.8.0

Ứng dụng không gọi API tạo ảnh. AI chỉ chia cảnh, lập hồ sơ nhất quán, đề xuất mô tả/prompt và đề xuất vùng trên ảnh tải lên.

1. Đề xuất cảnh/prompt, rồi mở Hồ sơ / ảnh mẫu.
2. Khóa phong cách (nét, bảng màu, nền, tỷ lệ), nhân vật (tên/mã, mặt/tóc, quần áo/màu sắc, tỷ lệ) và bối cảnh (kiến trúc, đường đi, vị trí đồ vật lớn, thời điểm/ánh sáng). Mỗi địa điểm có mô tả riêng; không ghép toàn bộ địa điểm vào mọi ảnh.
3. Tải ảnh mẫu gốc vào vai trò Nhân vật, Phong cách hoặc Bối cảnh. Dùng lại cùng bộ mẫu qua mọi cảnh. Chỉ đưa người và địa điểm cần cho cảnh hiện tại vào ảnh.
4. Bấm Sao chép prompt cảnh ở thanh bám trên cùng; nội dung gồm hồ sơ, mục tiêu video, lời kể, mô tả cảnh và vai trò ảnh mẫu. Mô tả riêng trong ô chỉnh sửa không thay thế prompt đầy đủ này.
5. Dán prompt vào công cụ tạo ảnh, tải/đính kèm các ảnh mẫu được chỉ định. Giữ cùng công cụ/mô hình và cuộc hội thoại nếu phù hợp. Seed chỉ hỗ trợ, không bảo đảm danh tính. Nhân vật/bối cảnh có thể vẫn lệch, cần duyệt ảnh.
6. Tải ảnh hoàn thành vào đúng cảnh. Ảnh cảnh đầu/ảnh trước đã duyệt được đưa vào gói xuất làm neo bổ sung, không thay ảnh mẫu gốc. Không lấy ảnh của cảnh sau để định hướng cảnh trước.
7. Có thể tải gói ZIP: prompts.json, scenes/NNN.txt, hồ sơ, prompt ảnh mẫu nhân vật/bối cảnh và các ảnh tham chiếu. Đường dẫn trong ZIP là tên tệp đính kèm, không phải URL công khai để dán vào tham số của công cụ.

Thanh thao tác luôn có Sao chép prompt, Hồ sơ, Lưu, Xem trước và Xuất MP4. Menu Cảnh đang chọn có đề xuất lại prompt, tạo lại lời đọc, tải ảnh, AI đề xuất vùng và Hủy. Các nút tôn trọng trạng thái tác vụ/khóa chỉnh sửa như nút gốc trong cảnh.

Ảnh cũ vẫn được giữ. Không phải đề xuất lại cảnh đã có prompt nếu không cần thay đổi. Để có hồ sơ bối cảnh cho dự án cũ, nhập trực tiếp ghi chú bối cảnh trong hộp hồ sơ; ghi chú đó được gắn vào prompt xuất ra.
