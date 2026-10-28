# Kiểm thử 2.2.2

- 124 bài Node: đường dẫn profile Windows Unicode ổn định, riêng từng cổng và khác hồ sơ Chrome cá nhân. Test lifecycle bằng trình duyệt giả khởi động/đóng hai lần giữ cùng profile và tệp sentinel; server/cây trình duyệt vẫn dừng, tiến trình ngoài không bị ảnh hưởng, dự án vẫn giữ.
- Chromium với SDK Puter giả: không có ô Tìm model; chọn nhóm/model qua popup vẫn được; bấm Đăng nhập khi đã có phiên không tăng số lần signIn. Các luồng model/queue/dự phòng/hủy và 1440/720/390 px vẫn đạt.
- Chưa thử lưu cookies hoặc đăng nhập Google/Puter thật trong EXE Windows. Không khẳng định giảm được bao nhiêu lần xác minh hoặc không còn OTP; quyết định thuộc dịch vụ. ZIP kiểm CRC/giải nén và không chứa browser profile.

# Kiểm thử 2.2.1

- Chromium/server thật: nút Mô hình AI đứng trước Quản lý giọng; mở hộp thoại từ trang đầu và từ các tab; thiết lập khóa khi chưa có dự án, bộ chọn không còn trong tab Kịch bản. Chọn/lưu Gemini/GPT qua popup, đóng mở lại, xử lý bằng bridge, quota fallback và hủy đăng nhập/tác vụ vẫn hoạt động bằng SDK giả lập. Không tràn ngang/lỗi JS ở 1440/720/390 px.
- 123 bài Node đạt. Chưa đăng nhập Puter thật hay build EXE Windows; phạm vi xác minh dịch vụ không thay đổi so với 2.2.0. ZIP kiểm CRC và giải nén/đối chiếu byte.

# Kiểm thử 2.2.0

- 123/123 bài Node: thêm cách ly phiên bridge, kết quả một lần, hủy/timeout/heartbeat mất trang/phản hồi muộn, validation và chặn chuyển dự phòng khi model từ chối nội dung; batch Puter tuần tự, 402→Agnes, cả hai dịch vụ lỗi→local, strict mode và chia đúng range rồi tạo prompt với engine gốc.
- Chromium với server HTTP/queue thật và SDK Puter giả lập: fresh project không SDK/auth; chọn Puter mới tải SDK, explicit login, lọc/chọn Gemini/GPT, xử lý prompt qua cầu nối; hết hạn mức→local; hủy đăng nhập quay lại lựa chọn cũ; hủy request đang chạy giữ prompt cũ và không gọi lại; 1440/720/390 px không tràn ngang/lỗi JS.
- Feature smoke với Agnes giả lập đạt. Không gọi AI có phí; chưa đăng nhập Puter thật hoặc kiểm tra phản hồi/thanh toán từ model thật. Không khẳng định Puter/Gemini luôn khả dụng hoặc miễn phí. Chưa build/chạy EXE Windows trực tiếp trên Linux.
- Các bài vận chuyển Agnes cũ chạy với fallback tắt để giữ kiểm tra strict mode; kiểm tra fallback mới là ca riêng. Runtime Python QA được sửa đường dẫn theo máy kiểm tra, không đưa vào ZIP.
- Không thay renderer hoặc SDK giọng; kết quả kiểm MP4/clone lịch sử bên dưới không phải kiểm model Puter thật. ZIP kiểm CRC và giải nén/đối chiếu byte; đầy đủ nguồn, không model/runtime/node_modules/dữ liệu QA.

# Kiểm thử 2.1.3

- Render thật với vùng toàn ảnh ở đầu/giữa/cuối, hai vùng khoanh tay 128 điểm và phần nền riêng. Cả grid/skeleton có video giống nhau từng pixel ở cả ba vị trí: đối tượng đầu hiện trước đối tượng thứ hai, nền chưa xuất hiện sớm, cuối đủ ảnh và đúng số khung.
- Các ca 20 vùng ngắn, vùng giao/bao/trùng của 2.1.2 vẫn đạt. 115 bài Node đạt; bài mask đa giác đạt.
- Chưa chạy EXE native Windows. Không thay Piper/VieNeu, cài đặt hoặc dữ liệu dự án trong bản này. ZIP kiểm CRC và giải nén đối chiếu byte.

# Kiểm thử 2.1.2

- 115/115 bài Node: bổ sung kiểm tra đổi thời lượng, dịch cảnh sau/cue, cân lại vùng, giữ nguyên văn và từ chối dữ liệu không hợp lệ trước khi thay dự án.
- Render video thật grid/skeleton: 20 vùng ngắn, hai đa giác 128 điểm; thêm vùng chữ nhật sau bao trùm tất cả và một vùng trùng hoàn toàn. Kiểm tra nhân vật đầu đã xuất hiện trước nhân vật sau, không biến mất khi đến vùng bao, đủ tổng khung hình. Vùng trùng bị bỏ qua và thời gian chia lại. Bài mask đa giác đạt.
- Chromium/server thật: chỉnh cảnh đầu thành 8,5 giây, lưu đúng và dịch cảnh sau; nhấp đúp ô ảnh trống để tải ảnh vào đúng cảnh rồi nhấp đúp ảnh đã tải để mở lại trình chọn file; ba lựa chọn đồng bộ hoạt động; không lỗi JS hoặc tràn ngang ở 1440/720/390 px.
- Xuất H.264 Full HD hai cảnh nhiều nét đạt: 240 khung/8 giây, bàn tay/phụ đề tiếng Việt/tiến độ đầy đủ (~20 giây trên máy kiểm tra). Bài riêng vùng chồng dùng clip thực 960x540. Chưa build/chạy EXE native Windows trong môi trường Linux.
- ZIP nguồn kiểm CRC và giải nén/đối chiếu byte; không chứa model/runtime, node_modules hoặc dữ liệu thử. Giữ cấu hình riêng được yêu cầu trước đó.

# Kiểm thử Whiteboard Studio 2.1.1

- Tái hiện lỗi cũ: 20 vùng 150 ms tạo 118 khung thay vì 108 ở 30 fps/3,6 giây. Bản sửa tạo đúng 108 khung và đủ nội dung tất cả vùng, cả grid/skeleton.
- Video thật với hai vùng khoanh tay 128 điểm, kiểm tra hình thứ nhất đã hiện khi hình thứ hai chưa vẽ và cả hai có đủ ở cuối. Bài polygon-mask cũ vẫn đạt: bảo vệ phần ngoài đa giác và trừ vùng sau đúng hình.
- Xuất H.264 Full HD hai cảnh nhiều nét: 240 khung/8 giây, bàn tay, phụ đề tiếng Việt và tiến độ theo vùng/khung đều đạt; khoảng 24 giây trên máy kiểm tra Linux.
- 113/113 bài Node đạt. Chromium với server thật: đổi cả ba lựa chọn, nội dung giải thích tương ứng; nguồn âm thanh none/upload không dùng đồng bộ; không tràn ngang ở 1440/720/390 px và không lỗi JavaScript.
- Chưa có file dự án/ảnh/vùng cụ thể bị lỗi của người dùng, nên chưa đối chiếu được đúng cảnh đó. Chưa build/chạy EXE Windows trực tiếp. Kết quả VieNeu thực tế vẫn có giới hạn nêu ở bản 2.1.0.
- ZIP đầy đủ nguồn được kiểm tra CRC và giải nén/đối chiếu byte. Không đóng model, runtime hoặc dữ liệu dự án; giữ cấu hình riêng theo yêu cầu trước đó.

# Kiểm thử Whiteboard Studio 2.1.0

- 113/113 bài kiểm thử Node đạt, gồm bảo toàn từng từ/thứ tự/thời gian khi chia cảnh, đủ số cảnh và lỗi trước khi thay dữ liệu nếu không đủ mốc; các đường local hoàn tất với fetch bị cấm; prompt không tự tạo cast/nhãn kiến thức; catalog/tên tương thích/giọng clone và danh tính cache.
- Chromium với HTTP server thật, Agnes trỏ tới cổng không kết nối: mặc định local, tạo prompt còn thiếu và riêng cảnh, chia đúng số cảnh; thư viện 25 giọng VieNeu, upload/clone/lưu/chọn giọng, áp dụng mọi cảnh, nghe thử. Không lỗi JS hoặc tràn ngang ở 1440/720/390 px.
- Smoke API qua server/FFmpeg/Python thật, SDK VieNeu giả lập: chuyển mẫu WAV, đăng ký/lưu hồ sơ, nạp lại ở worker mới, trả mẫu nghe, dùng clone cho các cảnh và tổng hợp WAV, nghe thử theo câu, chặn xóa giọng đang dùng và xóa sau khi thay giọng; mẫu lỗi/hủy không để giọng giả hoặc thư mục lưu dở. `npm run test:offline-vieneu` là test POSIX, tự bỏ qua trên Windows; bài adapter Python vẫn dùng được riêng.
- `npm run test:local-regions`: OpenCV thật, ảnh nền xanh và hai nhóm nét tách biệt, tọa độ/thời lượng hợp lệ trên cả năm tỷ lệ. Không cần API.
- Feature smoke và adapter VieNeu bằng SDK giả lập đạt. Không gọi AI có phí, không gửi âm thanh tham chiếu ra dịch vụ.
- Chưa tải weights hoặc đánh giá độ giống giọng VieNeu thật; chưa kiểm tra NVIDIA hay chạy/build native Windows/macOS. Đây là mã nguồn để build; runtime/model tải riêng. Kiểm tra MP4 đa tỷ lệ của 2.0 ở dưới là kết quả baseline, không chạy lại toàn bộ ở 2.1 vì không đổi renderer.
- ZIP nguồn kiểm CRC, giải nén toàn bộ, đối chiếu byte tệp và bản tải lại. Không đóng runtime, node_modules, model, dự án thử hoặc ảnh QA. Cấu hình riêng giữ theo yêu cầu người dùng.

# Kiểm thử Whiteboard Studio 2.0.0

- 108/108 bài kiểm thử Node đạt: dự án/kịch bản, cache Piper cũ và bộ giọng mới, 5 canvas/vùng đa giác, chuyển tọa độ, danh tính cache VieNeu engine/model/backend, worker tuần tự/tái dùng tiến trình/hủy nhanh. Các bài cũ về SRT, AI deadline/retry, lifecycle Windows/Mac và render vẫn đạt.
- Chromium trên máy chủ HTTP thật: tạo bằng tên duy nhất; tự lưu và mở lại bản nháp SRT; áp dụng kịch bản; đủ 5 tab; upload ảnh trên khung dọc; khoanh đa giác và màu nền thủ công được tự lưu; chọn VieNeu/Piper; không lỗi JS hoặc tràn ngang ở 1440/720/390 px.
- API thật: dự án trống, từ chối render quá sớm; áp dụng kịch bản; lưu bản ảnh gốc; chuyển liên tiếp cả 5 tỷ lệ và kiểm tra kích thước PNG/canvas; lưu thiết lập xuất; từ chối thay cảnh khi chưa xác nhận.
- FFmpeg/OpenCV render H.264 thật: đủ 5 tỷ lệ, thêm một video dọc 1080×1920 và một ca nền thủ công. Kiểm tra kích thước, số khung, màu từ khung đầu, nền ở phần chưa vẽ vẫn giữ nguyên. Không dùng ảnh có toàn nền cream làm ca duy nhất.
- VieNeu: tải và đối chiếu mã nguồn trong wheel chính thức 3.8.3; test adapter bằng SDK giả lập tạo WAV thật, kiểm tra canonical voice ID khác label hiển thị; model được nạp một lần trong hai câu; worker được hủy trong lúc đọc. Chưa tải weights VieNeu thật hoặc chạy NVIDIA; bộ cài trên máy người dùng thực hiện tải và kiểm tra phát âm trước khi ghi ready.
- Feature smoke với AI giả lập đạt. Không gọi API AI có phí trong lượt nâng cấp.
- Cài mới `npm ci --ignore-scripts` đạt sau khi tái tạo package-lock bị sai URL dependency trong bản cũ.
- Chưa biên dịch/chạy EXE Windows hoặc AppKit macOS trong môi trường Linux. Gói giao là mã nguồn cần build; runtime VieNeu là bộ cài riêng, không đóng model trong source ZIP.
- ZIP kiểm tra CRC và giải nén toàn bộ, loại node_modules, Python runtime, model, dữ liệu dự án và ảnh QA. `.env` giữ khóa/cấu hình theo yêu cầu người dùng.

# Kiểm thử 1.9.2

- 103/103 bài kiểm thử Node đạt. Ca mới xác nhận chờ toàn bộ response body của cảnh trước, lưu prompt trước khi gọi cảnh sau, không gửi song song, có khoảng nghỉ và hủy ngay trong lúc nghỉ.
- Giao diện Chromium với máy chủ thật: khoanh vùng bằng tay, tạo đa giác, lưu/mở lại giữ nguyên các đỉnh; thay tọa độ di chuyển đúng các đỉnh. Các kiểm tra giọng chung, người nói, giọng riêng từng cảnh, prompt tiếng Việt, ZIP và tên video FHD/360p vẫn đạt; không lỗi JavaScript hoặc tràn ngang ở 1440/720/390 px.
- Kiểm tra Python render video thật với đa giác ở grid và skeleton: mặt nạ đúng hình tam giác, không vẽ góc ngoài đa giác; vùng sau được trừ theo đúng hình chứ không theo hộp bao.
- Feature smoke với dịch vụ giả lập đạt. Không gọi API có phí hoặc đưa khóa vào log; chưa chạy EXE trên Windows trực tiếp trong môi trường Linux.
- `.env` của bản riêng này chứa khóa do người dùng yêu cầu, `.env.example` không có khóa. Source ZIP không đóng kèm runtime/model/dự án riêng. CRC và giải nén toàn bộ đã được kiểm tra.

# Kiểm thử 1.9.1 — Windows

- 98/98 bài kiểm thử Node đạt, gồm các ca mới cho prompt tiếng Việt, giọng chung giữ tốc độ/nhịp từng cảnh, kiểm tra toàn bộ trước khi cập nhật, từ chối giọng chưa tải/người nói không hợp lệ và tên video an toàn.
- Kiểm tra Chromium trên máy chủ thật: chỉ liệt kê model đã tải; lưu chỉnh sửa đang nhập trước khi áp dụng; đổi riêng giọng một cảnh; lưu và mở lại giọng chung, kể cả chỉ số người nói trong model nhiều giọng; chọn ChatGPT; gói prompt tiếng Việt tải thành công; header và tên download FHD/360p đúng; không tràn trang ở 1440/720/390 px; không lỗi JavaScript.
- Mô hình giọng trong bài UI là tệp giả có kích thước đúng để kiểm tra danh sách và lưu thiết lập; không dùng chúng để phát âm. Không tải lại model thực cho thay đổi này.
- Feature smoke với AI giả lập đạt: chia cảnh, đề xuất nội dung, giữ kịch bản, catalog giọng và xóa dự án.
- Không gọi API AI có phí. Chưa chạy trực tiếp EXE trên Windows hoặc biên dịch AppKit trên Mac trong môi trường Linux. Bộ build Windows và launcher được giữ nguyên.
- ZIP mã nguồn kiểm tra CRC và giải nén toàn bộ; không chứa node_modules, môi trường Python, model, dữ liệu dự án hoặc khóa API riêng.

# Bản 1.9.0 — macOS build source

- 93/93 kiểm thử Node đạt. Thêm runtime path macOS/Windows, kiểm kiến trúc native và từ chối Rosetta/mixed, SHA256 Node, symlink Python đổi sang tương đối, từ chối symlink ngoài runtime, .env/dự án/model ngoài bundle và không ghi đè khi nâng cấp; loại PYTHONHOME/PYTHONPATH/DYLD từ môi trường runtime.
- Session dùng máy chủ thật trên POSIX/Linux: tạo dự án, shutdown cần token, đóng phiên giải phóng port, mở lại đọc được dự án cũ. START gate, STOP và EOF parent được kiểm.
- Fixture sở hữu nhóm process thật: worker dùng src/process.js trong shared session group, có grandchild cố tình bị bỏ mồ côi khi server thoát; STOP/EOF làm heartbeat worker/grandchild dừng, tiến trình sentinel ngoài phiên còn sống. Đây là test POSIX Linux, không tuyên bố đã chạy AppKit/native trên Mac.
- Hủy riêng worker: kiểm thuật toán chọn descendants không lấy server hoặc PID ngoài. /bin/ps và UI/Hủy riêng trên Mac nằm trong checklist thực tế, chưa được chạy trên Mac tại đây.
- Syntax Node/bash, Info.plist XML và guard dừng khi build trên Linux đạt. Feature smoke AI giả lập cũ đạt. Browser Chromium 1440/720/390px kiểm nhánh download native trực tiếp (HTTP attachment), ZIP tải được, copy/profile/environment/upload/sticky UI không lỗi; không coi test Chromium là kiểm WebKit.
- Bộ build chạy trên Mac sẽ kiểm Python/Sharp sau khi sao chép .app sang đường dẫn Unicode/khoảng trắng, thực thi phonemizer Việt/Anh và xuất H.264 thật. Script này được kèm nhưng CHƯA được thực thi trên macOS trong môi trường hiện tại.
- Chưa có macOS SDK/Swift compiler/AppKit trong Linux: chưa biên dịch Launcher.swift, ký, notarize hoặc chạy .app/Gatekeeper/WebKit. Không có binary .app đã build trong source ZIP. Cần build native và làm checklist MACOS-HUONG-DAN.md trước khi phát hành.
- Những sửa MP4/SRT/Piper/nền ảnh của các bản trước được giữ; bản Windows không thay launcher, chỉ bổ sung lựa chọn runtime macOS.

# Bản 1.8.1

- 86/86 kiểm thử Node đạt, gồm tiến trình bị treo được dừng và báo timeout rõ, Hủy vẫn là lỗi riêng.
- Đo riêng 1.200 đoạn nét ngắn Full HD: cách cũ 22,665s, ROI 0,024s trong môi trường kiểm tra. Đây là chi phí đoạn nét, không phải tốc độ toàn bộ video hoặc cam kết trên mọi máy.
- ROI so với mask full-frame cũ: pixel-identical cho bốn bán kính, nét ở biên/cắt biên, chấm, nét dài và mask bảo vệ. Mask của nét ngắn nhỏ hơn 2.500 pixel thay vì 2.073.600 pixel.
- Tô màu: 40 khung so sánh byte/hash trước-sau giống nhau; kiểm monotonic reveal, màu nguồn và vùng bảo vệ. Callback renderer được tháo, weakref xác nhận renderer/buffer không giữ lại sau khi kết thúc.
- Render thật Full HD 1920x1080/30fps, hai cảnh rất nhiều nét/glyph, nền kem và xanh tối, skeleton, bàn tay và phụ đề Việt: xong, đủ 240 frame/8s, cảnh 2 xuất hiện, khung cuối không trắng, có tiến độ theo từng cảnh/nét/tô/frame. Lần chạy sau cùng khoảng 24,62s trong môi trường này (đồng thời có smoke khác), không suy rộng thời gian sang Windows hoặc dự án người dùng.
- Smoke cũ đạt: vùng rỗng/bị che, timeline, H.264/phụ đề và Full HD skeleton có audio bù theo thời lượng.
- Chưa chạy EXE Windows hoặc dự án/ảnh cụ thể đang lỗi trên máy người dùng. Sửa dựa trên điểm nghẽn tái hiện được trong mã và các video hồi quy thực tế, không giảm mặc định Full HD/đường nét.

# Bản 1.8.0

- 84/84 kiểm thử Node đạt. Tạo ảnh trực tiếp bị chặn ở workflow/queue/API; startup hủy job tạo ảnh cũ và không gửi request ảnh. Những test chỉ dành cho pipeline tạo ảnh cũ được bỏ/cập nhật; còn kiểm normalization/upload, prompt continuity và bộ transport timeout/cancel/overload/đọc body.
- Profile văn bản: schema sai được sửa một lần; lưu hồ sơ nhân vật và bối cảnh dùng chung, cache được dùng lại, không gửi ảnh/vision trong bước lập hồ sơ. Khóa có khoảng trắng được trim; token sai dừng một call; JSON sai dừng sau một lần repair; validator async được await đúng; lỗi/log không lộ khóa.
- Feature smoke với API AI giả lập đạt: chia đúng số cảnh/giữ nguyên nội dung, đề xuất prompt, catalog/validation giọng, xóa dự án và desktop shutdown.
- Chromium UI + server thật 1440/720/390px: không còn nút/tác vụ tạo ảnh hoặc nhãn phiên bản/nhà cung cấp; dock giữ trên cùng sau khi cuộn; navigator mobile không chồng nội dung; hồ sơ bối cảnh lưu/copy đúng, ảnh mẫu role environment hiển thị đúng, ảnh cảnh upload thành công; mặc định phụ đề tắt/đường nét giữ nguyên; không JS error/tràn ngang. Đã xem ảnh chụp desktop/mobile và sửa top offset của sceneList trên mobile.
- Sao chép prompt thực tế qua Clipboard API: chứa nhân vật, bối cảnh, vai trò ảnh mẫu và cảnh hiện tại, không ép nền kem. Dialog giữ nút copy/save/export ở trên khi cuộn. Download ZIP thật được kiểm CRC/nội dung, có environment-reference-prompts.txt, role environment và prompt đầy đủ.
- Không gọi dịch vụ AI thật hoặc build/chạy EXE Windows trong lượt này. Các lỗi mạng/quota/khóa/nhà cung cấp vẫn có thể xảy ra; test chứng minh giới hạn chờ, dừng/phục hồi và giữ kết quả, không bảo đảm dịch vụ luôn sẵn sàng hay ảnh ngoài giống nhau tuyệt đối.

# Bản 1.7.3

- 82/82 kiểm thử Node đạt. Kiểm SRT có số thứ tự cách mốc bằng dòng trống, clipboard một dòng; lời kể có 5/2026/15 m² và nội dung chỉ là số không bị xóa tùy tiện. Piper làm sạch SRT nhận diện được, từ chối mốc sai và làm cũ cache âm thanh chưa đúng.
- Browser Chromium + server thật: dán SRT vào chế độ văn bản tự chuyển sang phụ đề, nhận đúng 8s; API nhận text mode vẫn tự nhận diện SRT; project text/cues/scenes và lời đọc lưu đúng, giữ nguồn SRT riêng. Mốc lỗi bị từ chối thay vì đem đọc.
- Giao diện mặc định tắt phụ đề/Theo đường nét. Nhấn preview gửi đúng false/skeleton; chọn lại gửi true/grid. Nút speeches chỉ nằm trong mục 3. Minh họa và lời đọc, gửi một job speech toàn dự án, không có sceneId (job được chặn giả lập trong test UI, không tổng hợp audio thật ở lượt này).
- Đã xem ảnh chụp vị trí nút ở desktop; viewport 720px không tràn ngang, không JS error. Feature smoke cũ đạt. Không gọi Agnes thật hoặc chạy EXE Windows trong lượt này.
- Chạy lại lời đọc cũ nếu âm thanh trước đã chứa số thứ tự/mốc. Nguồn mốc SRT vẫn được dùng để chia thời lượng, chỉ không đưa vào lời đọc.

# Bản 1.7.2

- 80/80 kiểm thử Node đạt; bổ sung nền trắng, xanh bảng tối, xanh dương, hồng, ảnh dọc, góc có vật thể và ảnh trong suốt.
- Render H.264 thực tế gồm 5 cảnh/5 màu nền, kiểm màu đầu/giữa/cuối từng cảnh và đủ 60 frame/6 giây; sai số màu MP4 dưới 12 mức RGB do mã hóa mất dữ liệu. Nét phấn trắng giữ được màu.
- Kiểm pixel nguồn không bị thay (kể cả màu gần nền), canvas tự chọn và nét gốc trong grid/skeleton; chuẩn hóa Python cho RGB/RGBA/ảnh dọc đạt.
- Render smoke cũ: cảnh bị che/mask rỗng, timeline, phụ đề Việt, H.264 và Full HD 1920x1080/30fps có audio được kiểm tra lại.
- Không gọi Agnes thật hoặc chạy EXE Windows; thay đổi áp dụng trên ảnh đã lưu và cần xuất lại video. Viền kem đã ghi sẵn vào ảnh cũ phải tải lại nguồn để căn lại.

# Bản 1.7.1

- 78/78 kiểm thử Node/logic/tích hợp đạt. Tìm Chrome per-user/x64/x86/PATH/registry Unicode/custom path; xử lý thiếu Chrome, profile riêng/app flags, taskkill chỉ đúng PID/tree, port bận không bị chiếm/kill, readiness yêu cầu owned token, hủy startup và parent START handshake.
- Lifecycle với server/tiến trình thật và trình duyệt fixture: parent chưa START thì không spawn browser; giữ stdin mở như launcher; đóng browser thì supervisor/server thoát, cổng không còn kết nối, profile tạm dọn, tiến trình ngoài vẫn sống; mở lại cùng cổng, dự án giữ nguyên. Test không cần kill theo tên process.
- Feature smoke cũ đạt. Quyền shutdown yêu cầu token; GET public không trả token/owned=true. Giữ catalog Piper/ảnh ngoài/timeout/SRT của 1.7.0.
- Launcher Windows dùng Job Object KILL_ON_JOB_CLOSE, gán supervisor trước START để mọi process con kế thừa; theo dõi HWND cửa sổ Whiteboard Studio để xử lý Chrome nền. Build bổ sung ProcessJob.cs, UTF-8 compiler flag và guard -Resume khác version.
- Chưa biên dịch/chạy EXE hoặc thực thi HWND/Job Object trên Windows trong môi trường Linux này. Compiler Windows, Chrome registry/GUI và nested browser jobs cần chạy theo checklist DESKTOP-HUONG-DAN.md trên Windows 10/11 x64. Không tuyên bố đã kiểm chứng trên mọi chính sách/cấu hình Windows.

# Bản 1.7.0

- 72/72 kiểm thử logic/tích hợp đạt. Catalog đầy đủ, Unicode ID, filter không dấu/ngôn ngữ/chất lượng/trạng thái, speaker nhiều người, backward-compatible voice IDs và cache audio; refresh catalog hợp lệ/không mạng/dữ liệu hỏng không mất danh sách cũ.
- Queue tải bulk: dedup model chung, bỏ qua installed, tuần tự, lỗi model riêng tiếp tục, stop/requeue không kẹt trạng thái và hết ổ đĩa dừng hàng đợi.
- Python download adapter: model bất kỳ có Unicode URL, kiểm size/MD5, bỏ qua file hoàn chỉnh, retry checksum sai không ghi đè file cũ và không để .part lỗi. Kiểm thử dùng URL mock/fixture cho nhánh này.
- External ZIP: UTF-8/CRC/giải nén bằng Python zipfile, giữ hồ sơ/ảnh tham chiếu, chỉ lấy cảnh trước làm neo và giữ ràng buộc video kiến thức.
- Browser 1440/720px: catalog 179 mục, lọc tiếng Việt, scope/all bulk payload (mock để không tải 11GB); chọn Amy đã tải; speaker index lưu đúng; lưu hồ sơ/copy giữ đúng cảnh; upload ảnh mẫu/preview; tải ZIP thật và kiểm nội dung; nhập ảnh cảnh 1 rồi gói cảnh 2 có neo; cuộn riêng, không JS error/tràn ngang. Đã xem ảnh chụp UI, điều chỉnh filter thành 2 cột rõ ràng.
- Tải thật model en_US-amy-low ngoài 5 giọng cũ: checksum đạt. Tạo WAV thật 3116ms/16000Hz, 49856 frames, âm thanh không rỗng/không im lặng. Chưa nghe đánh giá tất cả giọng/ngôn ngữ; không tải tất cả model.
- Feature smoke cũ đạt: chia cảnh/đề xuất, giọng, xóa dự án và desktop shutdown. Các sửa API/SRT/Piper installer trước được giữ.
- Chưa build/chạy EXE Windows hoặc gọi công cụ tạo ảnh ngoài trong lượt này. Gói tham chiếu không bảo đảm nhân vật giống tuyệt đối; hướng dẫn dựa trên tài liệu nhà cung cấp đã kiểm tra ngày 19/10/2026.

# Bản 1.6.5

- 64/64 kiểm thử logic/tích hợp đạt. Thêm deadline không nhận header/body dở dang, cancel queued/active, late response, clear heartbeat/timer, invalid/null/array/HTML JSON envelopes, quá kích thước, tổng budget gồm Retry-After, browser polling timeout/recovery, HTTP200 auth, retry legacy bị giới hạn, đứt body và giải phóng queue.
- Máy chủ HTTP thật localhost: header treo và body chỉ gửi một phần bị abort đúng hạn; request sau thành công.
- Workflow: timeout chia cảnh chỉ gọi 1 lượt, không rơi vào vòng sửa JSON/ranges. Cảnh 2 timeout dừng batch; cảnh 1 giữ nguyên, 2/3 thử tiếp khi phục hồi. Ảnh tạm giữ qua vision timeout, chỉ tạo ảnh 1 lần.
- Feature smoke: chia đúng 5 cảnh/lời kể, đề xuất, catalog giọng, xóa dự án và bảo vệ shutdown đạt.
- Browser 1366/720px: polling 503 hiện thông báo rồi tự ẩn khi phục hồi, không lỗi JS/tràn ngang; SRT thực tế 100s/53.5s, VTT, co giãn timeline và cuộn 20 cảnh vẫn đạt.
- Chưa gọi Agnes thật, chưa build/chạy Windows EXE trong lượt này. Kiểm thử HTTP localhost có kiểm soát không chứng minh khả năng phục vụ của Agnes thật.

# Bản 1.6.4

- 53/53 kiểm thử đạt, gồm 3 bootstrap regression mới. Staging không có node_modules/.env, chạy từ cwd khác, đường dẫn có dấu/khoảng trắng; thiếu pip gọi ensurepip; pip lỗi trả nonzero và không xóa dự án. Dùng Piper sẵn có không gọi pip install.
- Chạy thực tế setup-tts.mjs trong staging cô lập không node_modules bằng Python/Piper hiện có: import và doctor engineReady=true, không tải thư viện; ready=false khi staging chưa có model là đúng.
- BAT được rà soát, lưu CRLF. Chưa thực thi CMD/Windows BAT hoặc thử trên mọi cấu hình máy. Kiểm thử giả lập không thay thế việc tải pip trên Windows thật.
- Không gọi Agnes và không thay đổi cơ chế tạo ảnh/SRT trong bản sửa bộ cài này.

# Bản 1.6.3

- 50/50 kiểm thử đạt. Hai fixture thực tế giữ đủ nội dung, đúng số câu/thời lượng và xuất-nhập SRT không thay đổi.
- Parser: BOM/CRLF/CR, thiếu dòng trống/số thứ tự, lời cùng dòng, phần giây dấu phẩy/chấm, thời gian ngắn và đầy đủ, WebVTT settings/metadata, UTF-16 LE/BE.
- Từ chối mốc sai/chồng lấn/quá giới hạn/thời gian thiếu lời; không âm thầm trả thời lượng một phần.
- Chromium giao diện/API: upload hai file thực tế cho đúng 100s/53.5s, tạo dự án đúng 14/11 câu. Upload VTT đúng 4.25s. Mốc lỗi xóa thời lượng cũ. SRT co giãn 10→20s và giữ mốc gốc đạt. Cuộn 20 cảnh desktop/mobile đạt, không JS error/tràn ngang.
- Chưa build/chạy Windows EXE trực tiếp. Không gọi Agnes thật cho thay đổi parser này.

# Bản 1.6.2

- 45/45 kiểm thử logic và tích hợp đạt, gồm bỏ qua đường dẫn Piper đã mất và co/giãn thời lượng SRT.
- Giao diện/API: SRT 10 → 20 giây; giữ nguyên mốc khi chọn original; 20 cảnh cuộn dọc riêng, giữ vị trí qua polling, chọn cảnh cuối; màn hình 1366/720px không tràn ngang hoặc lỗi JavaScript.
- Doctor render và Piper đạt trong môi trường Linux Python 3.12.14. Tạo WAV thực tế bằng giọng vi_VN-vais1000-medium đạt (22050 Hz, 2623 ms).
- Smoke nhiều giọng chưa đạt do model Cake cục bộ lỗi INVALID_PROTOBUF; model đã tải không được kèm trong ZIP nguồn. Không dùng kết quả này để khẳng định mọi model hoạt động.
- Chưa chạy CMD, setup hoặc build EXE trên Windows thực tế trong lượt kiểm tra này.

# Bản 1.6.1

- 40/40 kiểm thử logic/integration đạt. Bổ sung: cooldown cũ 130 giây đếm giảm đến hết rồi thật sự gửi request; recovery chỉ một probe; Retry-After quá dài dừng tự động; JSON ảnh 200 lỗi không tự lặp tạo ảnh.
- Queue: deadline đúng thời điểm, chỉ một lượt phục hồi, hết lượt thì error để thử lại thủ công; hủy và phục hồi trạng thái chờ.
- Feature smoke đạt (AI giả lập): số cảnh, minh họa, giọng, xóa dự án, desktop shutdown.
- Chromium/Playwright ở 1366 và 720px: các nhóm thiết lập tách rõ; hai nút tiện ích không dính; xóa dự án không được chọn giữ nguyên dự án đang mở; không lỗi JavaScript và không tràn ngang. Đã xem ảnh chụp bố cục desktop.
- Chưa gọi Agnes thật hoặc build EXE Windows trong lượt này. Các kiểm thử mô phỏng quá tải không chứng minh nhà cung cấp luôn sẵn sàng.

# Bản 1.6.0

- 36/36 kiểm thử đạt, gồm 503 lặp rồi phục hồi, Retry-After và cooldown qua khởi động, request tuần tự, lỗi xác thực, timeout ảnh và hủy trong lúc chờ.
- Kiểm thử workflow: lỗi 503 ở bước kiểm tra giữ ảnh tạm; tiếp tục dùng đúng ảnh, chỉ một lần tạo ảnh.
- Kiểm thử queue: đề xuất bị quá tải chuyển sang chờ, hủy được, tác vụ chờ lưu từ trước tự tiếp tục.
- Feature smoke đạt: đúng số cảnh, kế hoạch minh họa, giọng, xóa dự án và bảo vệ tắt desktop.
- Dùng API giả lập để tái hiện lỗi có kiểm soát; không tuyên bố dịch vụ Agnes thật luôn hoạt động. Chưa build/chạy EXE Windows trong lượt này.

# Bản 1.5.0

- 29/29 kiểm thử đạt: chính sách hai mục tiêu, kế hoạch minh họa kiến thức, nhãn nguồn, diagram không bị cấm như montage kể chuyện; toàn bộ hồi quy trước.
- Feature smoke dùng AI giả lập: dự án explain/secondary tạo đúng số cảnh, lưu visualPlan; đổi mục tiêu giữ nguyên lời kể và đánh dấu prompt cần cập nhật.
- Playwright: chọn explain/secondary trong form, hiển thị mục tiêu học tập, chia đúng số cảnh và chia lại; danh sách giọng và xóa dự án; không có lỗi JavaScript.
- Không kiểm tra chất lượng kiến thức bằng API Agnes thật trong lượt này. Các kiểm thử dùng phản hồi giả lập cho chính sách/luồng dữ liệu. Vẫn cần người dùng duyệt ảnh và độ chính xác chuyên môn.

---

# Bản 1.4.0 — tạo hình nhất quán

- 26/26 kiểm thử logic/integration đạt: hồ sơ chung, số nhân vật, tham chiếu ảnh neo + cảnh gần nhất, ảnh trùng được thử lại đúng cảnh, giữ ảnh cũ khi kiểm tra không đạt; hình ảnh không cần Python.
- API smoke đạt, xuất MP4 và tải video hoạt động. Feature smoke với AI giả lập đạt.
- Agnes API thật: ảnh đầu sinh thành công và vision kiểm tra đạt. Các yêu cầu ảnh tiếp theo với tham chiếu trả HTTP 503 image queue is full, cả sau retry backoff 5/10/20 giây. Chưa xác nhận chất lượng ảnh tham chiếu trên dịch vụ thực tế trong lượt này. Payload tham chiếu theo tài liệu AgnesAI-Labs: extra_body.image chứa Data URI; luồng được kiểm thử bằng API giả lập.
- Footer được thay đúng chuỗi © 2026 Designed & Developed by MinhNB201.
- Giữ sửa PowerShell quoting / Resume của 1.3.1. Build đầy đủ bổ sung backup data/models ở staging và loại dữ liệu cá nhân/model đã tải khỏi ZIP phân phối. Thay đổi build này chưa chạy trực tiếp Windows; cần kiểm tra trên máy build trước phát hành.
- Kiểm tra vision không thể bảo đảm 100% phát hiện ảnh lỗi; có thể có false positive/false negative.

---

# Bản sửa build 1.3.1

- Đã kiểm tra thực thi file check-node.cjs (Sharp tạo PNG) và check-python.py (import Piper/ONNX Runtime) trên Linux.
- Không truyền mã nguồn có dấu nháy qua native argument -c/-e nữa.
- Resume kiểm tra đủ runtime và launcher rồi chỉ chạy kiểm tra/đóng ZIP.
- Windows PowerShell/launcher chưa chạy tại đây. Log Windows của người dùng xác nhận phần cài thư viện và doctor render đã đạt, lỗi phát sinh ở truyền dấu nháy trong bước kiểm tra cũ.

---

# Bản 1.3.0 — kiểm thử

- 24/24 kiểm thử Node/Python đạt; thêm kiểm tra số cảnh/ranges, đủ nội dung, không lặp/đảo, quản lý giọng cục bộ, hàng đợi tải và thử lại lỗi.
- API feature smoke dùng Agnes giả lập: tạo đúng 5 cảnh và giữ toàn bộ lời kể; đề xuất từng cảnh; danh sách giọng; từ chối download ID sai; xóa thư mục dự án; chặn shutdown desktop thiếu token.
- Playwright: nhập 6 cảnh trong dự án mới; AI chia lại 4 cảnh; danh sách giọng; hộp xác nhận xóa và quay về màn hình đầu; không có lỗi JavaScript.
- Tải giọng Cake theo ID riêng thực tế: model đã hoàn chỉnh được giữ và không tải lại. Kiểm thử không dùng API Agnes thật trong bản này.
- Đã resolve và tải đủ wheel Windows x64/Python 3.12 cho bộ dependency desktop được pin (NumPy, OpenCV, Pillow, PyAV, imageio-ffmpeg, Piper, ONNX Runtime và dependency).
- Script build và C# launcher được cung cấp; chưa biên dịch EXE hoặc chạy bản portable trên Windows. Phải chạy build và thử trên Windows sạch trước phát hành. Mọi kiểm thử thực thi ở đây chạy Linux.

---
Báo cáo trước:

# Bản 1.2.0 — đồng bộ âm thanh

- 21/21 kiểm thử đạt: bao gồm ví dụ cảnh 28.6s / WAV 20s, ba chế độ đồng bộ, tương thích WAV 1.1.0 và co timeline có nhiều vùng vẽ.
- Kiểm thử FFmpeg thực với âm 440 Hz: WAV 20s được kéo thành 23.53s, cao độ vẫn 440 Hz, đầu nghỉ 150ms và cuối nghỉ 350ms, cảnh tổng 24.03s.
- Piper thực: tải model cộng đồng Việt 5 người nói (revision cố định, kiểm tra SHA256), sinh giọng nam Việt speaker 2 và nam Anh HFC; thử lại riêng cảnh lỗi; xuất MP4 có AAC không im lặng.
- API smoke đạt với render và tải MP4.
- Playwright đạt: chọn giọng nam Việt, lưu nhịp Chậm rãi, áp dụng toàn dự án, tạo lời đọc, hiển thị thời lượng đồng bộ và xuất preview. Không có lỗi JavaScript.
- Tất cả chạy trên Linux; chưa chạy trực tiếp Windows. Cảm nhận biểu cảm/phát âm cần người dùng nghe thử. Các chế độ nhịp chỉ thay đổi khoảng nghỉ, không phải điều khiển cảm xúc của model.

---
Báo cáo trước:

# Bản 1.1.0 — kiểm thử ngày 14/10/2026

- 15/15 kiểm thử Node đạt (domain, hàng đợi, ảnh không Python, UTF-8, cấu hình Piper, phát hiện âm thanh cũ, timeline và annotation).
- API smoke đạt: health, tạo/lưu dự án, upload demo, render và tải MP4, không lộ .env.
- Piper thực 1.3.0 / ONNX CPU: đã tải và kiểm tra checksum hai model vi_VN-vais1000-medium, en_US-lessac-medium; tạo WAV Việt và Anh có ngắt đoạn.
- Smoke TTS thực: cố ý cho một cảnh có thiết lập sai, giữ cảnh thành công, sửa thiết lập và retry riêng cảnh lỗi; tạo lại cảnh riêng; tự giãn timeline; render MP4 có luồng AAC và năng lượng âm thanh khác 0.
- Playwright: sửa lời đọc, tạo giọng, hiển thị trình nghe thử, render preview và tạo lại lời đọc đã sửa; không có lỗi JavaScript. Đã xem ảnh chụp giao diện.
- Đã xác nhận pip cung cấp wheel Windows x64 cho piper-tts 1.3.0 / Python 3.12.
- Môi trường thực thi kiểm thử là Linux. Chưa chạy trực tiếp Windows; chưa đánh giá chủ quan chất lượng phát âm bằng nghe của người Việt. Phụ đề Piper là chia thời lượng theo văn bản, chưa phải forced alignment.

---
Báo cáo các phiên bản trước:

# Kiểm thử 1.0.3

11 test thành công, bao gồm chạy Python với PYTHONIOENCODING=cp1252/PYTHONUTF8=0 rồi ghi nhật ký có chữ Đ và tiếng Việt; kiểm tra Node giải mã ký tự UTF-8 bị tách giữa hai chunk. Bộ kiểm thử render 360p và Full HD 30fps có âm thanh/phụ đề đều thành công. Chạy trên Linux, mô phỏng bảng mã gây lỗi trên Windows; chưa kiểm thử trực tiếp Windows.

# Kiểm thử 1.0.2

- 9 test thành công, gồm chọn đúng Python 3.12 64-bit, bỏ qua 3.15/32-bit, sao lưu .venv mà không thay đổi data/.env.
- Bộ setup chạy thật: nhận diện môi trường cũ không hoạt động, giữ backup, tạo Python 3.12, cài toàn bộ dependencies bằng binary wheels, doctor thành công.
- API smoke test thành công: tạo dự án, lưu chỉnh sửa, mẫu, hàng đợi render, tải MP4.
- Render smoke test thành công: vùng rỗng, khung hình/thời lượng, phụ đề tiếng Việt, H.264, 1920×1080/30fps, skeleton và âm thanh.
- Môi trường kiểm thử Linux. Logic chọn Python trên Windows có unit test; chưa chạy bộ BAT trực tiếp trên Windows.

# Kiểm thử bản sửa 1.0.1

Đã chạy 7 test thành công trên Linux. Test hồi quy mô phỏng Python không được cài bằng PYTHON_PATH trỏ tới đường dẫn không tồn tại. Tạo mới, tạo lại, tạo ảnh hàng loạt và upload đều thành công; xác nhận request vẫn gọi /images/generations với model Agnes ảnh. Ảnh kết quả đúng PNG 1280×720, có nền kem và ảnh không hợp lệ bị từ chối. Test này dùng phản hồi Agnes giả lập; không gọi lại API thật trong lần sửa này. Chưa kiểm thử trực tiếp trên Windows.

# Kết quả kiểm thử bản 1.0.0

Môi trường kiểm thử: Linux, Node.js 24.19.0, Python 3.12.14. Bộ cài Windows được cung cấp nhưng chưa chạy trên máy Windows thực tế.

## Đã chạy thành công

- 6 kiểm thử nghiệp vụ: đọc/ghi SRT tiếng Việt, giữ khoảng nghỉ, phát hiện thời gian chồng, kiểm tra tọa độ/vùng, chia thời lượng và phục hồi hàng đợi.
- API ứng dụng: kiểm tra môi trường; tạo dự án; lưu chỉnh sửa; nhập mẫu; hàng đợi render; trả video MP4; không phục vụ .env qua web.
- Render: vùng trống/vùng bị che hoàn toàn; khung đầu trống khi phụ đề chưa bắt đầu; đúng số frame và thời lượng; phụ đề tiếng Việt; H.264.
- Xuất 1920×1080, 30fps, chế độ skeleton; ghép âm thanh 1 giây vào video 3 giây và bù im lặng.
- Trình duyệt Chromium: mở giao diện, tạo mẫu, thêm/sửa/lưu vùng, yêu cầu preview, hiển thị video. Không có lỗi JavaScript trong luồng kiểm thử.
- API Agnes thật với key được cung cấp: chat, mô tả ảnh, tạo ảnh Base64, hiểu ảnh Data URI, đề xuất vùng, render thành video preview 12 giây.
- Xem ảnh chụp giao diện và các khung hình đầu/giữa/cuối của video mẫu.

## Điều chỉnh sau kiểm thử

- URL ảnh trả từ Agnes không phân giải được trong môi trường kiểm thử; đã dùng chế độ Base64 được API hỗ trợ.
- Đã kiểm thử Agnes hiểu ảnh Data URI thực tế, nên ảnh upload local cũng dùng AI khoanh vùng được.
- Chuyển đề xuất minh họa sang xử lý từng cảnh để giảm rủi ro AI chia sai hoặc trả thiếu cảnh.

## Phạm vi cần lưu ý

AI khoanh vùng có thể chưa chính xác; cần duyệt và chỉnh. Phân bố thời gian vùng hiện chia đều, có thể chỉnh theo lời đọc. Đây là bản local một tiến trình, chưa kiểm thử tải nhiều người dùng. Không có tạo giọng nói AI. Video là vẽ dần ảnh tĩnh.


1.0.4: thêm kiểm thử API giả lập lỗi cảnh thứ 2 trong 3 cảnh cho cả nội dung và ảnh; cảnh thứ 3 vẫn hoàn thành, retry chỉ gọi cảnh thứ 2, ảnh cũ giữ nguyên nếu tái tạo lỗi. Kiểm tra phục hồi trạng thái gián đoạn. Kiểm thử chạy trên Linux; chưa kiểm thử trực tiếp Windows.

Kết quả kiểm thử cuối: 12/12 unit/integration tests đạt với Python hệ thống. API smoke render lần này bị chặn vì môi trường .venv tạm thời thiếu executable Python; chưa xác nhận lại xuất MP4 trong lượt sửa này. Agnes được giả lập để kiểm tra lỗi theo cảnh, không kiểm tra độ ổn định dịch vụ thực tế.
