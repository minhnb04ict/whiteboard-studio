import Cocoa
import WebKit
import Darwin

@MainActor final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var web: WKWebView!
    var supervisor: Process?
    var input: Pipe?
    var serverGroup: Int32 = 0
    var stopping = false
    var lastError = ""
    var pending = Data()
    var log: FileHandle?
    var downloads: [ObjectIdentifier: WKDownload] = [:]
    var downloadDestinations: [ObjectIdentifier: (temporary: URL, target: URL)] = [:]
    let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Whiteboard Studio", isDirectory: true)
    var resources: URL { Bundle.main.resourceURL!.appendingPathComponent("app", isDirectory: true) }

    func applicationDidFinishLaunching(_ notification: Notification) {
        if let identifier = Bundle.main.bundleIdentifier,
           let other = NSRunningApplication.runningApplications(withBundleIdentifier: identifier).first(where: { $0.processIdentifier != getpid() }) {
            other.activate(options: [.activateIgnoringOtherApps]); NSApp.terminate(nil); return
        }
        makeMenu()
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(self, name: "whiteboardClipboard")
        let clipboard = """
        if(location.origin==='http://127.0.0.1:3000'){
          window.__WHITEBOARD_NATIVE__=true;
          try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:function(text){window.webkit.messageHandlers.whiteboardClipboard.postMessage(String(text));return Promise.resolve();}}});}catch(e){}
        }
        """
        config.userContentController.addUserScript(WKUserScript(source: clipboard, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self; web.uiDelegate = self
        window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 1280,height: 850), styleMask: [.titled,.closable,.miniaturizable,.resizable], backing: .buffered, defer: false)
        window.title = "Whiteboard Studio"; window.minSize = NSSize(width: 760,height: 600)
        window.contentView = web; window.delegate = self; window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        web.loadHTMLString("<html><body style='font:18px system-ui;padding:48px'><h2>Whiteboard Studio</h2><p>Đang mở máy chủ trên cổng 3000…</p></body></html>", baseURL: nil)
        do { try launchServer() } catch { fail(error.localizedDescription) }
    }
    func makeMenu() {
        let main = NSMenu(), app = NSMenu(), edit = NSMenu(), view = NSMenu()
        let appItem = NSMenuItem(); main.addItem(appItem); appItem.submenu = app
        app.addItem(withTitle: "Cấu hình khóa AI…", action: #selector(openSettings), keyEquivalent: ",").target = self
        app.addItem(withTitle: "Mở thư mục dữ liệu", action: #selector(openData), keyEquivalent: "").target = self
        app.addItem(.separator()); app.addItem(withTitle: "Thoát Whiteboard Studio", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let editItem = NSMenuItem(title: "Sửa", action: nil, keyEquivalent: ""); main.addItem(editItem); editItem.submenu = edit
        for (title,action,key) in [("Hoàn tác","undo:","z"),("Cắt","cut:","x"),("Sao chép","copy:","c"),("Dán","paste:","v"),("Chọn tất cả","selectAll:","a")] {
            edit.addItem(withTitle: title, action: Selector(action), keyEquivalent: key)
        }
        let viewItem = NSMenuItem(title: "Xem", action: nil, keyEquivalent: ""); main.addItem(viewItem); viewItem.submenu = view
        view.addItem(withTitle: "Tải lại giao diện", action: #selector(reload), keyEquivalent: "r").target = self
        NSApp.mainMenu = main
    }
    func launchServer() throws {
        let fm = FileManager.default
        try fm.createDirectory(at: support, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        let settings = support.appendingPathComponent(".env")
        if !fm.fileExists(atPath: settings.path) {
            try fm.copyItem(at: resources.appendingPathComponent(".env.example"), to: settings)
            try fm.setAttributes([.posixPermissions: 0o600], ofItemAtPath: settings.path)
        }
        let logURL = support.appendingPathComponent("desktop.log")
        if let size = try? fm.attributesOfItem(atPath: logURL.path)[.size] as? NSNumber, size.intValue > 2_000_000 { try? fm.removeItem(at: logURL) }
        if !fm.fileExists(atPath: logURL.path) { fm.createFile(atPath: logURL.path, contents: nil) }
        log = try FileHandle(forWritingTo: logURL); log?.seekToEndOfFile()
        let process = Process(), stdout = Pipe(), stderr = Pipe(), stdin = Pipe()
        process.executableURL = resources.appendingPathComponent("runtime/node/bin/node")
        process.arguments = ["scripts/macos-session.mjs"]; process.currentDirectoryURL = resources
        var env = ProcessInfo.processInfo.environment
        env["WHITEBOARD_MAC_SUPPORT"] = support.path
        env["PATH"] = resources.appendingPathComponent("runtime/node/bin").path + ":/usr/bin:/bin:/usr/sbin:/sbin"
        for key in ["PYTHONHOME","PYTHONPATH","VIRTUAL_ENV","DYLD_LIBRARY_PATH","DYLD_FRAMEWORK_PATH"] { env.removeValue(forKey: key) }
        env["PYTHONNOUSERSITE"] = "1"; process.environment = env
        process.standardOutput = stdout; process.standardError = stderr; process.standardInput = stdin
        stdout.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData; if data.isEmpty { handle.readabilityHandler = nil; return }
            DispatchQueue.main.async { [weak self] in self?.receive(data) }
        }
        stderr.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData; if data.isEmpty { handle.readabilityHandler = nil; return }
            DispatchQueue.main.async { [weak self] in self?.log?.write(data); self?.receiveErrors(data) }
        }
        process.terminationHandler = { [weak self] p in DispatchQueue.main.async {
            guard let self = self else { return }
            self.killServerGroup()
            if self.stopping { NSApp.reply(toApplicationShouldTerminate: true) }
            else { self.fail(self.lastError.isEmpty ? "Máy chủ đã dừng (\(p.terminationStatus)). Xem desktop.log trong thư mục dữ liệu." : self.lastError) }
        }}
        supervisor = process; input = stdin
        try process.run()
        try stdin.fileHandleForWriting.write(contentsOf: Data("START\n".utf8))
    }
    func receive(_ data: Data) {
        log?.write(data); pending.append(data)
        while let newline = pending.firstIndex(of: 10) {
            let line = String(decoding: pending[..<newline], as: UTF8.self); pending.removeSubrange(...newline)
            if line.hasPrefix("DESKTOP_SERVER_PID "), let pid = Int32(line.dropFirst(19)), pid > 1 {
                self.serverGroup = pid
            }
            if line == "DESKTOP_READY" && !stopping { web.load(URLRequest(url: URL(string: "http://127.0.0.1:3000")!)) }
        }
    }
    func receiveErrors(_ data: Data) {
        let text = String(decoding: data, as: UTF8.self)
        if let range = text.range(of: "DESKTOP_ERROR ") {
            let error = String(text[range.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
            self.lastError = error
        }
    }
    func killServerGroup() { if serverGroup > 1 { kill(-serverGroup, SIGKILL); serverGroup = 0 } }
    func fail(_ message: String) {
        if stopping { return }
        let alert = NSAlert(); alert.messageText = "Không mở được Whiteboard Studio"; alert.informativeText = message
        alert.runModal(); NSApp.terminate(nil)
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        guard let process = supervisor, process.isRunning else { killServerGroup(); return .terminateNow }
        if stopping { return .terminateLater }; stopping = true
        try? input?.fileHandleForWriting.write(contentsOf: Data("STOP\n".utf8)); try? input?.fileHandleForWriting.close()
        DispatchQueue.main.asyncAfter(deadline: .now()+6) { [weak self] in
            guard let self = self, process.isRunning else { return }
            self.killServerGroup(); process.terminate()
            DispatchQueue.main.asyncAfter(deadline: .now()+1) { if process.isRunning { kill(process.processIdentifier,SIGKILL) }; NSApp.reply(toApplicationShouldTerminate: true) }
        }
        return .terminateLater
    }
    @objc func reload() { web.reload() }
    @objc func openData() { NSWorkspace.shared.open(support) }
    @objc func openSettings() {
        NSWorkspace.shared.open([support.appendingPathComponent(".env")], withApplicationAt: URL(fileURLWithPath: "/System/Applications/TextEdit.app"), configuration: NSWorkspace.OpenConfiguration(), completionHandler: nil)
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "whiteboardClipboard", message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.host == "127.0.0.1", message.frameInfo.securityOrigin.port == 3000,
              let text = message.body as? String, text.count <= 200_000 else { return }
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(text, forType: .string)
    }
    func local(_ url: URL) -> Bool { url.scheme == "http" && url.host == "127.0.0.1" && url.port == 3000 }
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { decisionHandler(.cancel); return }
        let permitted = local(url) || url.absoluteString.hasPrefix("blob:http://127.0.0.1:3000/") || url.scheme == "about"
        if !permitted { if ["https","http"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }; decisionHandler(.cancel); return }
        if action.shouldPerformDownload { decisionHandler(.download) }
        else if action.targetFrame == nil { webView.load(action.request); decisionHandler(.cancel) }
        else { decisionHandler(.allow) }
    }
    func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if let http = response.response as? HTTPURLResponse, http.statusCode >= 400 {
            decisionHandler(.cancel)
            let alert = NSAlert(); alert.messageText = "Không tải được tệp hoặc trang"; alert.informativeText = "HTTP \(http.statusCode). Hãy kiểm tra trạng thái trong ứng dụng rồi thử lại."; alert.runModal(); return
        }
        let attachment = (response.response as? HTTPURLResponse)?.value(forHTTPHeaderField: "Content-Disposition")?.lowercased().contains("attachment") == true
        decisionHandler(attachment || !response.canShowMIMEType ? .download : .allow)
    }
    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) { downloads[ObjectIdentifier(download)] = download; download.delegate = self }
    func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) { downloads[ObjectIdentifier(download)] = download; download.delegate = self }
    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel(); panel.allowsMultipleSelection = parameters.allowsMultipleSelection; panel.canChooseDirectories = parameters.allowsDirectories; panel.canChooseFiles = true
        panel.beginSheetModal(for: window) { result in completionHandler(result == .OK ? panel.urls : nil) }
    }
    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        let panel = NSSavePanel(); panel.nameFieldStringValue = URL(fileURLWithPath: suggestedFilename).lastPathComponent
        panel.beginSheetModal(for: window) { result in
            guard result == .OK, let url = panel.url else { completionHandler(nil); return }
            let temporary = url.deletingLastPathComponent().appendingPathComponent(".whiteboard-" + UUID().uuidString + ".part")
            self.downloadDestinations[ObjectIdentifier(download)] = (temporary, url)
            completionHandler(temporary)
        }
    }
    func downloadDidFinish(_ download: WKDownload) {
        let key = ObjectIdentifier(download); downloads.removeValue(forKey: key)
        guard let destination = downloadDestinations.removeValue(forKey: key) else { return }
        do {
            if FileManager.default.fileExists(atPath: destination.target.path) {
                _ = try FileManager.default.replaceItemAt(destination.target, withItemAt: destination.temporary)
            } else { try FileManager.default.moveItem(at: destination.temporary, to: destination.target) }
        } catch {
            let alert = NSAlert(); alert.messageText = "Không hoàn tất lưu tệp"; alert.informativeText = error.localizedDescription + "\nTệp tải về còn tại: " + destination.temporary.path; alert.runModal()
        }
    }
    func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        let key = ObjectIdentifier(download); downloads.removeValue(forKey: key)
        if let destination = downloadDestinations.removeValue(forKey: key) { try? FileManager.default.removeItem(at: destination.temporary) }
        if (error as NSError).code == NSURLErrorCancelled { return }
        let alert = NSAlert(); alert.messageText = "Không tải được tệp"; alert.informativeText = error.localizedDescription; alert.runModal()
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { if !stopping { webView.reload() } }
}
signal(SIGPIPE,SIG_IGN)
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate; app.setActivationPolicy(.regular); app.run()
