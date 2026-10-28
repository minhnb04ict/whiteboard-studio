import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export function nativeArchitecture(machine,arch) {
 const expected=machine==='arm64'?'arm64':machine==='x86_64'?'x64':null;
 if(!expected||expected!==arch)throw Error('Build bằng Terminal/Node cùng kiến trúc máy Mac: arm64 cho Apple Silicon, x64 cho Intel. Không build chéo/Rosetta.');
 return {node:expected,swift:expected==='x64'?'x86_64':'arm64',python:expected==='x64'?'x86_64':'aarch64'};
}
export function verifyNodeArchive(file,checksumText,name) {
 const entry=checksumText.split(/\r?\n/).map(l=>l.trim().split(/\s+/)).find(p=>p[1]?.replace(/^\*/,'')===name);
 if(!entry||!/^[a-f0-9]{64}$/i.test(entry[0]))throw Error('Không tìm thấy SHA256 của Node trong manifest chính thức.');
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(actual!==entry[0].toLowerCase())throw Error('Gói Node tải về sai checksum; xóa cache gói Node và build lại.');
}
export function copyRelocatablePython(source,destination) {
 fs.cpSync(source,destination,{recursive:true,dereference:false,verbatimSymlinks:true});
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())walk(file);
  else if(entry.isSymbolicLink()){
   const target=fs.readlinkSync(file);
   const originalFile=path.join(source,path.relative(destination,file));
   const absolute=path.resolve(path.dirname(originalFile),target);
   const relative=path.relative(source,absolute);
   if(relative.startsWith('..'+path.sep)||relative==='..'||path.isAbsolute(relative))throw Error('Python có symlink ra ngoài runtime: '+file);
   const mapped=path.join(destination,relative);
   fs.unlinkSync(file);fs.symlinkSync(path.relative(path.dirname(file),mapped),file);
  }
 }}walk(destination);
}
export function infoPlist(version) {
 if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Version không hợp lệ.');
 return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Whiteboard Studio</string>
<key>CFBundleDisplayName</key><string>Whiteboard Studio</string>
<key>CFBundleIdentifier</key><string>com.minhnb201.whiteboardstudio</string>
<key>CFBundleExecutable</key><string>WhiteboardStudio</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>${version}</string>
<key>CFBundleVersion</key><string>${version}</string>
<key>LSMinimumSystemVersion</key><string>13.5</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSAppTransportSecurity</key><dict><key>NSAllowsLocalNetworking</key><true/><key>NSAllowsArbitraryLoadsInWebContent</key><true/></dict>
<key>NSDownloadsFolderUsageDescription</key><string>Lưu video và gói prompt theo vị trí bạn chọn.</string>
<key>NSHumanReadableCopyright</key><string>© 2026 Designed &amp; Developed by MinhNB201</string>
</dict></plist>`;
}
