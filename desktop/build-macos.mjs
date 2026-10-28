import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {nativeArchitecture,verifyNodeArchive,copyRelocatablePython,infoPlist} from './macos/build-helpers.mjs';
const root=path.resolve(import.meta.dirname,'..');
function run(cmd,args,options={}){return execFileSync(cmd,args,{cwd:root,stdio:'inherit',env:process.env,...options});}
function output(cmd,args,options={}){return execFileSync(cmd,args,{cwd:root,encoding:'utf8',...options}).trim();}
function fetch(url,file){
 if(fs.existsSync(file))return;
 const temp=file+'.part';try{run('/usr/bin/curl',['--fail','--location','--retry','3','--connect-timeout','30','--max-time','900','--output',temp,url]);fs.renameSync(temp,file);}finally{fs.rmSync(temp,{force:true});}
}
try{
 if(process.platform!=='darwin')throw Error('Bộ build .app phải chạy trên macOS, không chạy trên Windows/Linux.');
 if(Number(process.versions.node.split('.')[0])<22)throw Error('Máy build cần Node.js 22 trở lên.');
 const arch=nativeArchitecture(output('/usr/bin/uname',['-m']),process.arch);
 const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
 run('/usr/bin/xcrun',['--find','swiftc']);
 try{run('uv',['--version']);}catch{throw Error('Máy build cần uv. Cài theo https://docs.astral.sh/uv/getting-started/installation/ rồi mở Terminal mới.');}
 const release=path.join(root,'release'),cache=path.join(release,'macos-build-cache');fs.mkdirSync(cache,{recursive:true});
 const work=fs.mkdtempSync(path.join(release,`macos-${arch.node}-build-`));
 const app=path.join(work,'Whiteboard Studio.app'),contents=path.join(app,'Contents'),appRoot=path.join(contents,'Resources','app');
 fs.mkdirSync(path.join(contents,'MacOS'),{recursive:true});fs.mkdirSync(appRoot,{recursive:true});
 console.log('Build folder: '+work);
 for(const name of ['src','scripts','public','views','assets','vendor'])fs.cpSync(path.join(root,name),path.join(appRoot,name),{recursive:true,filter:source=>!source.split(path.sep).includes('__pycache__')&&!source.endsWith('.pyc')});
 for(const name of ['package.json','package-lock.json','.env.example','README.md','PIPER-HUONG-DAN.md','THIRD-PARTY-PIPER.md','MACOS-HUONG-DAN.md','STUDIO-2.0-HUONG-DAN.md','STUDIO-2.1-HUONG-DAN.md','PUTER-HUONG-DAN.md'])fs.copyFileSync(path.join(root,name),path.join(appRoot,name));
 // Never copy .env, data, models, Windows binaries or the builder's node_modules.
 fs.writeFileSync(path.join(contents,'Info.plist'),infoPlist(version));
 run('/usr/bin/plutil',['-lint',path.join(contents,'Info.plist')]);
 run('/usr/bin/xcrun',['swiftc','-swift-version','5','-O','-target',`${arch.swift}-apple-macosx13.5`,'-framework','Cocoa','-framework','WebKit',path.join(root,'desktop','macos','Launcher.swift'),'-o',path.join(contents,'MacOS','WhiteboardStudio')]);
 const nodeVersion='24.11.1',nodeName=`node-v${nodeVersion}-darwin-${arch.node}`,archive=nodeName+'.tar.gz';
 const archivePath=path.join(cache,archive),checks=path.join(cache,`SHASUMS256-${nodeVersion}.txt`);
 fetch(`https://nodejs.org/dist/v${nodeVersion}/${archive}`,archivePath);fetch(`https://nodejs.org/dist/v${nodeVersion}/SHASUMS256.txt`,checks);
 verifyNodeArchive(archivePath,fs.readFileSync(checks,'utf8'),archive);
 const nodeExtract=fs.mkdtempSync(path.join(cache,'node-'));run('/usr/bin/tar',['-xzf',archivePath,'-C',nodeExtract]);
 const nodeSource=path.join(nodeExtract,nodeName),node=path.join(nodeSource,'bin','node');
 const env={...process.env,PATH:path.join(nodeSource,'bin')+':'+process.env.PATH,PYTHONNOUSERSITE:'1',PYTHONDONTWRITEBYTECODE:'1'};
 for(const key of ['PYTHONPATH','PYTHONHOME','VIRTUAL_ENV','DYLD_LIBRARY_PATH','DYLD_FRAMEWORK_PATH','FFMPEG_PATH'])delete env[key];
 run(node,[path.join(nodeSource,'lib','node_modules','npm','bin','npm-cli.js'),'ci','--omit=dev','--no-audit','--no-fund'],{cwd:appRoot,env});
 const nodeDestination=path.join(appRoot,'runtime','node');fs.mkdirSync(path.join(nodeDestination,'bin'),{recursive:true});
 fs.copyFileSync(node,path.join(nodeDestination,'bin','node'));fs.chmodSync(path.join(nodeDestination,'bin','node'),0o755);
 fs.copyFileSync(path.join(nodeSource,'LICENSE'),path.join(nodeDestination,'LICENSE'));
 const pyKey=`cpython-3.12.10-macos-${arch.python}-none`,pyCache=path.join(cache,'python');
 run('uv',['python','install','--install-dir',pyCache,'--no-bin',pyKey],{env});
 const pySource=path.join(pyCache,pyKey),pyDestination=path.join(appRoot,'runtime','python');
 if(!fs.existsSync(path.join(pySource,'bin','python3.12')))throw Error('uv không tạo đúng runtime '+pyKey+'. Cập nhật uv rồi build lại.');
 copyRelocatablePython(pySource,pyDestination);
 const python=path.join(pyDestination,'bin','python3.12');
 run('uv',['pip','install','--python',python,'--system','--break-system-packages','--only-binary',':all:','-r',path.join(root,'desktop','requirements-macos.txt')],{env});
 const resolved=output('uv',['pip','freeze','--python',python],{env});fs.writeFileSync(path.join(appRoot,'requirements-resolved-macos.txt'),resolved+'\n');
 fs.copyFileSync(path.join(root,'desktop','macos','check-runtime.py'),path.join(appRoot,'scripts','build-check-macos.py'));
 fs.copyFileSync(path.join(root,'desktop','check-node.cjs'),path.join(appRoot,'scripts','build-check-node.cjs'));
 // Copy to a DIFFERENT path containing spaces and Vietnamese; verify no
 // interpreter/site-packages/Sharp dependency points back to the build cache.
 const relocation=fs.mkdtempSync(path.join(os.tmpdir(),'Whiteboard-kiểm-tra-'));
 try{
  const relocated=path.join(relocation,'Whiteboard Studio.app');fs.cpSync(app,relocated,{recursive:true,dereference:false,verbatimSymlinks:true});
  const checkRoot=path.join(relocated,'Contents','Resources','app');
  run(path.join(checkRoot,'runtime','python','bin','python3.12'),['scripts/build-check-macos.py',arch.swift],{cwd:checkRoot,env});
  run(path.join(checkRoot,'runtime','node','bin','node'),['scripts/build-check-node.cjs'],{cwd:checkRoot,env});
 }finally{fs.rmSync(relocation,{recursive:true,force:true});}
 // Local ad-hoc signature. Developer ID signing/notarization is a separate
 // distribution step; this does not claim Gatekeeper trust on other Macs.
 run('/usr/bin/codesign',['--force','--deep','--sign','-',app]);run('/usr/bin/codesign',['--verify','--deep','--strict',app]);
 const targetFolder=path.join(release,`WhiteboardStudio-macOS-${arch.node}`);fs.mkdirSync(targetFolder,{recursive:true});
 const destination=path.join(targetFolder,'Whiteboard Studio.app');
 if(fs.existsSync(destination))fs.renameSync(destination,destination+'.backup-'+Date.now());
 fs.renameSync(app,destination);fs.copyFileSync(path.join(root,'MACOS-HUONG-DAN.md'),path.join(targetFolder,'HUONG-DAN.md'));
 const zip=path.join(release,`WhiteboardStudio-macOS-${arch.node}.zip`);fs.rmSync(zip,{force:true});
 run('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',destination,zip]);
 run(path.join(destination,'Contents','Resources','app','runtime','python','bin','python3.12'),['-c','import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print("ZIP CRC OK")',zip],{env});
 console.log(`Build complete: ${zip}\nApp: ${destination}\nTest the Mac checklist before sharing. No personal API key/projects/models are included.`);
}catch(e){console.error('Build macOS failed: '+e.message);process.exitCode=1;}
