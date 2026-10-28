# 2.2.2 — Bỏ tìm model và giữ phiên đăng nhập riêng

- Bỏ hoàn toàn ô/nhãn Tìm model; nhóm AI và danh sách model vẫn hoạt động.
- Đăng nhập khi phiên SDK còn hợp lệ chỉ cập nhật thông tin; chỉ Đổi tài khoản mới yêu cầu chọn lại.
- EXE dùng hồ sơ Chrome riêng bền vững trong thư mục người dùng thay vì tạo/xóa hồ sơ tạm mỗi lần chạy. Giữ cách dừng server/browser và tách khỏi Chrome cá nhân. Không đóng hồ sơ trong ZIP.
- Không có tùy chọn SDK bỏ xác minh SMS hoặc ép đăng nhập Google; không can thiệp các bước do Puter/Google yêu cầu.

# 2.2.1 — Hộp thoại Mô hình AI

- Chuyển bộ chọn chế độ/model/tài khoản Puter và kiểm tra kết nối vào hộp thoại riêng, mở từ nút Mô hình AI ngay trên Quản lý / tải giọng.
- Mở được từ mọi tab; hiển thị tên dự án áp dụng, tự lưu thay đổi và chờ lưu khi đóng bằng Xong/Escape. Chưa có dự án thì chỉ hiển thị hướng dẫn, khóa thiết lập để tránh lưu nhầm.
- Giữ nguyên mặc định local, đăng nhập Puter theo yêu cầu và cơ chế dự phòng 2.2.0.

# 2.2.0 — Lựa chọn AI qua Puter và dự phòng theo cảnh

- Mặc định xử lý local không tải SDK/đăng nhập. Khi chọn Puter mới tải thư viện; chỉ nút đăng nhập/đổi tài khoản mở popup, hủy giữ chế độ trước. Lọc Gemini/GPT/khác và tìm catalog model thực; lưu lựa chọn theo dự án/bản nháp.
- Thêm cầu nối yêu cầu theo phiên trình duyệt, timeout/heartbeat/hủy/kiểm tra kết quả; token Puter không gửi vào Node hoặc lưu trong dự án. Tác vụ vẫn chạy qua hàng đợi server và validator hiện có.
- Ưu tiên Puter đã chọn; lỗi chuyển Agnes rồi local nếu bật dự phòng. Không tự chọn model Puter khác; lỗi nội dung bị chặn và nút Hủy không chuyển nhà cung cấp. Model timeout không tự gọi lại; 429 thử một lần. Dịch vụ đã lỗi trong batch không thử lại ở mỗi cảnh.
- Mỗi cảnh lưu trước khi đi tiếp, bỏ phản hồi đến muộn; thông báo có dùng dự phòng. Giới hạn Agnes 45 giây mỗi bước, Puter tối đa khoảng 100 giây mỗi request. Dữ liệu chia cảnh đã commit không bị thay lại khi lỗi giai đoạn sau.
- Piper/VieNeu/clone và renderer 2.1.3 không thay đổi. Puter áp dụng chia cảnh/prompt/hồ sơ; vùng nét dùng OpenCV khi chọn Puter. Không bổ sung tạo ảnh AI trong ứng dụng.

# 2.1.3 — Nhận diện vùng bao ngoài độc lập vị trí

- Xác định quan hệ chứa bằng mặt nạ hình thật sau khi scale, không suy từ hộp bao. Sắp vùng nằm trong trước vùng chứa; hỗ trợ nhiều cấp lồng nhau. Vùng trùng không tạo vòng phụ thuộc; vùng giao một phần giữ ưu tiên danh sách.
- Bổ sung nền bằng phần còn thiếu, giữ phần đã vẽ. Khi thứ tự đổi hoặc vùng trùng bị bỏ, cân lại lịch vẽ trên bản xuất mà giữ nguyên độ dài cảnh và annotation gốc.
- Cập nhật hướng dẫn giao diện: không cần chuyển vùng bao ngoài xuống cuối.

# 2.1.2 — Vùng chồng lấn và chỉnh thời lượng từng cảnh

- Đổi quyền sở hữu pixel: vùng trước vẽ trước, vùng sau trừ phần đã vẽ, không trừ các vùng chưa đến lượt. Vùng sau bao toàn bộ vùng trước vẫn bổ sung phần còn thiếu. Bỏ vùng bị phủ hoàn toàn và chia lại thời gian cho vùng hữu ích, giữ nguyên độ dài cảnh.
- Khi muốn vẽ từng đối tượng trước, đặt vùng toàn ảnh cuối cùng. Nếu giữ vùng toàn ảnh ở đầu, toàn ảnh sẽ được vẽ trước và những vùng nằm trong nó được bỏ qua khi xuất.
- Tên gợi ý tạo dự án là Tên dự án của bạn.
- Tab Phân cảnh & ảnh có ô thời lượng cạnh mốc thời gian và nút Áp dụng. Cập nhật mốc các cảnh sau, phụ đề theo cảnh và thời gian vùng vẽ; giữ file phụ đề gốc và giọng đã tạo. Chỉ đổi dữ liệu sau khi kiểm tra giới hạn 1 giây/đủ vùng và tổng 10 phút.
- Nhấp đúp ảnh/ô ảnh trống trong danh sách cảnh mở chọn ảnh, tải đúng cảnh được chọn. Khi có tác vụ đang chạy sẽ khóa thao tác.

# 2.1.1 — Nhiều vùng khoanh tay và giải thích đồng bộ

- Sửa sai số làm tròn cộng dồn khi chia mỗi vùng thành phần nét/tô màu: lượng khung hình lấy theo mốc tuyệt đối. Các vùng cuối không bị mất khi bộ ghép cắt theo thời gian cảnh. Giữ đúng tổng khung hình, không tự cộng thêm thời gian giữ cuối.
- Phân tích skeleton trong vùng nét thực tế và trả tọa độ về khung ảnh, giảm quét toàn khung cho từng vùng nhỏ. Sửa nét/tô brush chỉ có một khung vẫn xử lý đủ các bước.
- Đổi tên ba lựa chọn thời lượng, giải thích khoảng tốc độ, thay đổi độ dài video, nghỉ cuối 0,5 giây và trường hợp không thể khớp. Không đổi giá trị lưu fit/voice/fixed của dự án cũ. Tắt lựa chọn khi không dùng lời đọc theo cảnh.

# 2.1.0 — Chia cảnh offline, thư viện VieNeu và clone giọng

- Mặc định xử lý cảnh/prompt trên máy bằng JavaScript, giữ lời kể và tổng thời gian; chia theo số cảnh, ưu tiên câu/mốc SRT và kiểm tra tính khả thi trước khi thay dữ liệu. Các thao tác thiếu/riêng cảnh không phụ thuộc Agnes; AI trực tuyến vẫn tùy chọn.
- Prompt tiếng Việt theo mẫu từ nội dung gốc, tỷ lệ và hồ sơ dùng chung; phân biệt rõ giới hạn thuật toán với suy luận AI. Bộ nhóm nét OpenCV trên máy thay Vision API khi chọn chế độ local.
- Quản lý giọng có tab Piper/VieNeu, catalog 25 giọng SDK 3.8.3, tìm kiếm/lọc, cài CPU/GPU, nghe thử. Các giọng gốc dùng chung mô hình.
- Clone âm thanh mẫu 3–8 giây, WAV hóa bằng FFmpeg, trích/lưu hồ sơ riêng, thử phát âm trước khi hoàn tất. Hỗ trợ hủy, xử lý lỗi và bỏ dữ liệu dở; giọng đã lưu xuất hiện khi mở lại, dùng cho một/tất cả cảnh. Bảo vệ xóa giọng đang dùng; cache gắn revision giọng.
- Sửa tràn ngang vùng lời đọc ở màn hình nhỏ và ẩn trạng thái Piper khi đang chọn VieNeu.

# 2.0.0 — Quy trình 5 tab, VieNeu và nhiều tỷ lệ

- Dự án nháp chỉ cần tên; nhập và tự lưu kịch bản riêng, xác nhận trước khi thay cảnh. Thanh tab/tiến độ dùng chung; mỗi giai đoạn chỉ hiển thị phần liên quan.
- Tự lưu cảnh có số phiên bản để không làm mất nội dung vừa nhập khi request lưu trước còn đang chạy; lưu lựa chọn xuất theo dự án.
- Khung ảnh, prompt, canvas/vùng chữ nhật/đa giác, tọa độ AI và MP4 hỗ trợ 16:9, 9:16, 1:1, 4:3, 3:4. Giữ ảnh gốc cho chuyển bố cục, có contain/cover và vị trí ưu tiên.
- Hiện nền trơn tự nhận diện/thủ công từ khung đầu, giữ nền xuyên suốt cả vẽ và tô màu.
- Thêm VieNeu 3.8.3 với bộ cài CPU/GPU riêng, phát hiện NVIDIA, kiểm tra phát âm trước khi báo ready, giọng chung/riêng từng cảnh và nghe thử. Worker tái sử dụng model trong đợt đọc, hủy ngay và không tự đổi bộ giọng khi lỗi.
- Cache Piper giữ tương thích; cache VieNeu có engine/backend/model/version. Không đưa model/runtime vào source ZIP.
- Sửa package-lock cũ có URL dependency bị đổi nhầm phiên bản; `npm ci` sạch đã chạy thành công.

# 1.9.2 — Đề xuất tuần tự và vùng vẽ tự do

- Khoảng nghỉ ngẫu nhiên 1–3 giây sau khi từng cảnh được xử lý và lưu; chờ bằng promise có AbortSignal, tiến độ hiển thị đúng số cảnh.
- Bổ sung chọn vùng bằng đường khoanh tự do hoặc đa giác; giữ các đỉnh khi lưu/di chuyển/co giãn. Validator kiểm tra số điểm, tọa độ và diện tích.
- Render dùng mặt nạ đa giác cho vùng hiện tại và vùng phía sau, giữ tương thích vùng chữ nhật cũ và hai chế độ grid/skeleton.
- Cấu hình `.env` theo khóa người dùng yêu cầu, không ghi khóa vào giao diện hoặc log.

# 1.9.1 — Windows: prompt tiếng Việt, giọng chung, tên video

- Prompt bên ngoài và ảnh mẫu dùng tiếng Việt, thêm lựa chọn ChatGPT; AI đề xuất hồ sơ/cảnh mới bằng tiếng Việt. Giữ nguyên văn dữ liệu cũ do người dùng nhập.
- Giọng chung chỉ từ model đã tải, hỗ trợ nhiều người nói, lưu theo dự án; áp dụng nguyên tử cho tất cả cảnh, giữ tốc độ/nhịp và cho phép đổi riêng mỗi cảnh. Lưu chỉnh sửa đang nhập trước khi áp dụng.
- Download MP4 dùng tên dự án không dấu và độ phân giải; lưu kích thước lúc render và tương thích video cũ.

# 1.9.0

- Thêm build .app native macOS riêng arm64/x64 với AppKit/WebKit, upload/download/clipboard, menu cấu hình và dữ liệu. Không cần Chrome cho bản Mac; giữ launcher Windows.
- Đóng kèm Node/Python standalone và wheel macOS đúng kiến trúc, kiểm checksum Node và kiểm runtime sau khi chuyển sang đường dẫn khác. Không đóng .env/data/models của máy build vào app.
- Dữ liệu Mac trong Application Support; bundled Python được dùng cho cả render và Piper thay vì đường dẫn python.exe.
- Native parent START/STOP/EOF, server process group riêng và worker cùng group; dọn cả worker mồ côi khi đóng app, Hủy riêng tác vụ chỉ chọn subtree của worker.
- Giữ toàn bộ sửa MP4/SRT/nền màu/Piper/prompt trước đó. Thêm hướng dẫn/checklist macOS; bản binary native cần build và kiểm trên Mac thật.

# 1.8.1

- Sửa điểm nghẽn skeleton: vẽ mask cục bộ quanh từng đoạn nét thay vì tạo/quét mask toàn khung cho mỗi bước. Giữ kết quả pixel, giới hạn vùng và nét gốc.
- Tô màu chỉ ghi pixel mới được quét, giữ màu đã vẽ và vùng bảo vệ; tránh chép lại cả khu vực cũ mỗi khung.
- Tiến độ thật theo frame/cảnh/vùng/giai đoạn, heartbeat phân tích và mã hóa; dọn callback/buffer giữa các cảnh.
- FFmpeg timeout có thông báo rõ; giới hạn tiến trình Node phân biệt quá thời gian với hủy.
- Test MP4 Full HD hai cảnh dày nét, chuyển cảnh, 240 frame/8s, bàn tay/phụ đề; so sánh ROI pixel với thuật toán cũ, màu/protection/monotonic reveal và giải phóng renderer.

# 1.8.0

- Bỏ luồng/API tạo ảnh trực tiếp, hàm gửi image generation và tải URL ảnh; hủy job tạo ảnh cũ đang chờ khi khởi động. Giữ ảnh tải lên, chia cảnh, prompt, TTS, render và vùng vẽ AI/thủ công.
- Hồ sơ nhân vật + bối cảnh theo mã ổn định; xuất prompt đầy đủ không ép nền kem, ghi chú và ảnh mẫu bối cảnh, ZIP có prompt tạo mẫu địa điểm. Sao chép một chạm theo cảnh, không gọi AI khi sao chép/xuất.
- Thanh thao tác bám trên cùng, menu cảnh, nút lưu/copy/export hồ sơ bám trên trong dialog; điều chỉnh navigator mobile tránh chồng vùng nhập. Bỏ nhãn phiên bản/thử nghiệm và nhà cung cấp khỏi giao diện.
- Hồ sơ văn bản thuần được lưu dùng chung; một lượt sửa schema, sửa JSON có giới hạn, hỗ trợ validator bất đồng bộ; token budget theo tác vụ, trim khóa và che khóa trong lỗi/log. Giữ timeout/heartbeat/cancel/queue/resume hữu hạn.
- Cập nhật kiểm thử theo chức năng còn được hỗ trợ; bỏ các test của pipeline tạo ảnh đã gỡ, giữ kiểm thư mục/ảnh nhập, continuity, retry theo cảnh và transport.

# 1.7.3

- Nhận diện phụ đề theo nội dung ở browser/server, không phụ thuộc loại đầu vào/đuôi file. Lưu nguồn SRT riêng, chỉ đưa lời kể sạch vào text/cues/scenes.
- Bỏ chỉ số bị cách mốc bởi dòng trống; tách SRT clipboard bị gộp một dòng. Không xóa số trong văn bản thường. Piper kiểm lại SRT trong narration cũ/nhập tay; audio cache thay đổi khi lời đọc đã làm sạch.
- Mặc định phụ đề tắt, kiểu vẽ skeleton/Theo đường nét; vẫn cho bật phụ đề/chọn lưới. API render áp dụng cùng mặc định.
- Chuyển nút tạo lời đọc hàng loạt lên mục 3. Minh họa và lời đọc, giữ nút tạo lại riêng từng cảnh.

# 1.7.2

- Giữ nguyên pixel nguồn khi tô/vẽ video; nền khởi đầu lấy theo từng ảnh, không áp match-bg sang kem.
- Hỗ trợ nét phấn sáng trên nền tối và giữ màu nét ngay từ giai đoạn vẽ.
- Căn ảnh Node/Python dùng nền ảnh cho viền 16:9; không thay màu vùng ảnh gốc.
- Thêm kiểm thử nền ảnh và MP4 H.264 nhiều màu/cảnh.

# 1.7.1

- Tự tìm Chrome, đường dẫn Unicode/custom registry, app window và profile tạm riêng.
- Supervisor chỉ chạy sau khi launcher gán Windows Job Object; đóng cửa sổ/thoát launcher dọn tiến trình con và giải phóng 3000. Theo dõi cả browser exit và HWND để xử lý background Chrome.
- Single instance/focus, xác thực server thuộc phiên trước khi dùng/shutdown, báo bận cổng không chiếm hoặc kill chương trình khác.
- Thêm test lifecycle, parent handshake, phát hiện Chrome, port ownership và reopen/bảo toàn dữ liệu. Giữ tính năng Piper/catalog/ảnh ngoài của 1.7.0.

# 1.7.0

- Catalog Piper thay danh sách 5 giọng; snapshot offline + cập nhật, 179 lựa chọn, Unicode ID, lọc/tìm theo ngôn ngữ/chất lượng/trạng thái.
- Tải từng giọng/nhóm/tất cả theo queue, bỏ qua model đã có, dedup model chung, kiểm dung lượng/checksum, dừng và thử tiếp; hỗ trợ chọn speaker đa giọng.
- Hồ sơ tạo hình bên ngoài, ảnh mẫu nhân vật/phong cách, sao chép prompt từng cảnh và ZIP tự chứa prompt/ảnh/README. Hỗ trợ hướng dẫn Gemini/Midjourney theo phiên bản. Không tự gửi sang dịch vụ ngoài.
- Giữ sửa SRT/Piper installer/API deadlines của các bản trước. Full source ZIP không kèm model binaries/node_modules/venv/dữ liệu dự án.

# 1.6.5

- Deadline toàn lượt HTTP gồm header/body; kiểm soát tổng thời gian retry/backoff, heartbeat 10 giây, hủy queued/in-flight và nhả hàng đợi.
- Tối đa 1 text retry; không thử sửa nội dung khi lỗi transport. Chặn envelope JSON null/array/HTML và dung lượng phản hồi quá lớn.
- Dừng batch khi lỗi dịch vụ/kết nối/auth; giữ kết quả và ảnh tạm để thử tiếp. URL download có deadline gồm DNS/redirect/body.
- Polling browser có timeout, hiển thị mất kết nối và tự phục hồi; không tự lặp thao tác ghi.
- Full-source ZIP, giữ các sửa Piper/SRT trước đó.

# 1.6.4

- Bootstrap Piper không phụ thuộc dotenv/npm/node_modules; setup render cũng bỏ import dotenv.
- BAT kiểm tra Node/đủ tệp nguồn, pushd theo thư mục dự án, trả exit code khi lỗi.
- Piper dùng lại bản cài hợp lệ, tự sửa pip thiếu, pip retry/timeout hữu hạn, không nâng pip không cần thiết.
- Thêm kiểm thử chạy độc lập ở đường dẫn có dấu/khoảng trắng, thiếu pip, mất mạng giả lập và không có node_modules.

# 1.6.3

- Parser phụ đề dùng chung browser/server tách theo timestamp, hỗ trợ SRT không có dòng trống và lời nằm cùng dòng.
- Bổ sung biến thể mốc thời gian, WebVTT và giải mã UTF-16 BOM.
- Báo lỗi rõ ràng và xóa thời lượng cũ khi nhập phụ đề sai.
- Regression fixture từ hai file người dùng: phu-de.srt 14 cues/100s và atitn.srt 11 cues/53.5s.

# 1.6.2

- Sửa setup render/Piper dùng hai môi trường khác nhau; một lệnh setup cài cả hai.
- Bỏ qua PIPER_PYTHON_PATH đã mất, hỗ trợ portable và môi trường legacy.
- Chỉnh thời lượng SRT khi tạo dự án, co/giãn mốc theo tỷ lệ và giữ nguyên lời kể.
- Cuộn dọc danh sách cảnh độc lập trên desktop/mobile, giữ vị trí qua polling.

# 1.6.1

- Bỏ lặp cả chu kỳ retry khi phục hồi; một probe, chờ có giới hạn, timer theo deadline.
- Chuẩn hóa cooldown quá dài của bản cũ; ghi nhật ký lúc thực gửi request.
- Ba nhóm thiết lập, hai nút tiện ích rõ ràng, nút xóa nhỏ ở góc từng dự án.

# 1.6.0

- Điều tiết yêu cầu ảnh, chờ tăng dần/Retry-After, lưu cooldown.
- Tạm dừng và tiếp tục tự động tác vụ quá tải; giữ kết quả từng cảnh.
- Lưu ảnh trung gian để kiểm tra/tải lại mà không tạo lại; sửa JSON và cấu trúc mô tả riêng cảnh.

## 1.5.0
- Hai mục tiêu kể chuyện / giải thích kiến thức và lựa chọn đối tượng.
- Mục tiêu học tập + kiểu minh họa theo cảnh; nhãn lấy từ nguồn.
- Sơ đồ nhiều bước/so sánh được phép, review hướng quan hệ và nội dung; thứ tự vùng vẽ theo học tập.
- Đổi mục tiêu giữ lời kể/giọng, đánh dấu minh họa cần cập nhật.

## 1.4.0
- Hồ sơ tạo hình chung, cast chính xác, bỏ ép 3–5 chủ thể.
- Ảnh neo và cảnh trước được gửi làm tham chiếu; kiểm tra vision và thử lại ảnh lỗi.
- Đồng bộ lại ảnh chưa kiểm tra, giữ kết quả đạt.
- Footer © 2026 Designed & Developed by MinhNB201.
- Build lại giữ data/models local, ZIP phát hành không chứa các dự án cá nhân.

## 1.3.1
- Sửa mất dấu nháy trong kiểm tra runtime PowerShell 5.1.
- Thêm -Resume để hoàn tất bản build đã cài thư viện.

## 1.3.0
- Số cảnh 1–40 do người dùng yêu cầu; AI phân bổ nội dung có kiểm tra chính xác và nguyên vẹn.
- Xóa dự án sau xác nhận, chặn xóa khi xử lý.
- Danh sách giọng tải theo yêu cầu, dedupe model dùng chung, nhận giọng đã lưu trên máy.
- Hỗ trợ runtime portable; launcher C# cổng 3000 / trình duyệt / tray / single-instance. Script build Windows đóng gói Node, Python, FFmpeg và dependencies.

## 1.2.0
- Co và giãn cảnh theo lời đọc; audio atempo giữ cao độ; ba chế độ đồng bộ.
- Tốc độ mặc định mới 0.85, ngắt câu và ngắt đoạn, áp dụng thiết lập toàn dự án.
- Giọng nam/nữ Việt cộng đồng Cake, thêm giọng nam Anh HFC.
- Giữ tương thích WAV cũ; hiển thị thời lượng xuất thực tế.

## 1.1.0 — Piper TTS

- Giọng Việt / Anh offline trên CPU, môi trường .venv-tts riêng.
- Lời đọc, tốc độ và khoảng nghỉ theo cảnh; phát nghe thử.
- Hàng đợi, lưu ngay, tạo lại riêng cảnh lỗi hoặc nội dung đã sửa.
- Tự giãn cảnh / giữ thời gian gốc, phụ đề tương ứng, ghép AAC vào MP4.
- Script cài Windows, tải model có kiểm tra checksum, không thay môi trường render.

# 1.0.3

- Ép UTF-8 cho stdout/stderr Python, kể cả khi Windows mặc định cp1252.
- Node truyền PYTHONUTF8/PYTHONIOENCODING và giải mã luồng output bằng bộ giải mã UTF-8 liên tục để không hỏng ký tự bị tách giữa các chunk.
- Giải mã thông báo FFmpeg bằng UTF-8 với fallback thay ký tự không hợp lệ.
- Không cần tạo lại ảnh hoặc cài lại môi trường .venv đã hoạt động.

# 1.0.2

- Bộ setup chỉ chọn Python 3.12 64-bit, kiểm tra cả môi trường .venv hiện có.
- Tự giữ bản sao .venv lỗi/sai phiên bản rồi tạo lại; không sửa data hoặc key.
- Dùng pip --only-binary=:all: để tránh tự biên dịch av trên Windows.
- Ứng dụng ưu tiên đường dẫn .venv tương đối theo thư mục dự án; không chọn alias Microsoft Store khi thiếu môi trường.
- start-windows.bat kiểm tra và chạy setup khi môi trường chưa sẵn sàng.
- Kiểm tra bộ render trước khi xuất MP4/xử lý âm thanh.
- Giữ nguyên tạo ảnh Agnes qua Node.js, key .env và các chức năng v1.0.1.

# 1.0.1

- Tách chuẩn hóa ảnh khỏi Python: dùng Sharp trong Node.js, giữ nguyên khung 1280×720, màu nền kem và không cắt nội dung.
- Tạo mới/tạo lại ảnh qua Agnes, ảnh tải lên và mẫu không yêu cầu Python.
- Thêm start-images-windows.bat để cài npm dependencies và chạy ứng dụng mà không cài Python.
- Thông báo rõ khi thiếu Python ở các thao tác video/lời đọc.
- Test hồi quy đặt PYTHON_PATH tới đường dẫn không tồn tại: tạo ảnh đơn, tạo ảnh hàng loạt, tạo lại, upload, kiểm tra PNG/kích thước/nền; phản hồi API giả lập để kiểm tra toàn pipeline mà không phụ thuộc dịch vụ.

# 1.0.0

## Ứng dụng mới
Express 5 + EJS, giao diện tiếng Việt; nhập văn bản/SRT; Agnes chat + image; lưu ảnh cục bộ; đề xuất vùng từ ảnh; chỉnh khung/thứ tự/thời gian; hàng đợi tuần tự và hủy; preview 360p/15fps, MP4 1080p/30fps; ghép lời đọc và phụ đề tiếng Việt; lưu dự án và khôi phục sau restart; demo không cần AI; setup Windows và bộ test.

## Thay đổi vendor (upstream 696a724)
- render_stream_whiteboard.py: sửa thừa tham số khi vùng không có nét.
- render_stream_whiteboard.py: vùng allowed rỗng vẫn ghi đủ số khung hình ở bước hiện màu.
- render_stream_whiteboard.py: bỏ thao tác ép hiện toàn ảnh ở cuối; chỉ giữ nội dung đã vẽ để tránh lộ vùng chưa đánh dấu.
- stream_render.py: sửa PyAV mux danh sách packet để tương thích API hiện tại.

Adapter media.py chuẩn hóa khung 16:9, ghép theo tổng số frame tính từ timeline toàn cục, thêm/bù/cắt frame theo mốc cảnh để không tích lũy trôi thời gian. Preview và final dùng cùng thuật toán.
