import test from 'node:test';import assert from 'node:assert/strict';
import net from 'node:net';import {PassThrough} from 'node:stream';
import {findChrome,chromeCandidates,chromeArguments,ensureFreePort,waitOwnedServer,killOwnedTree} from '../scripts/chrome-lifecycle.mjs';
import {awaitParent} from '../scripts/desktop-main.mjs';
test('Chrome discovery covers per-user, x64/x86, Unicode custom registry paths and explicit paths without username assumptions',()=>{
 const env={LOCALAPPDATA:'C:\\Users\\Minh Đức\\AppData\\Local',ProgramFiles:'C:\\Program Files','ProgramFiles(x86)':'C:\\Program Files (x86)',PATH:''};
 const paths=chromeCandidates(env,'win32');assert.ok(paths.includes('C:\\Users\\Minh Đức\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'));
 assert.ok(paths.includes('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'));
 assert.equal(findChrome({env,platform:'win32',exists:p=>p===paths[0]}),paths[0]);
 const custom='D:\\Ứng dụng\\Chrome\\chrome.exe';assert.equal(findChrome({env,platform:'win32',exists:p=>p===custom,registry:()=>['"'+custom+'"']}),custom);
 assert.throws(()=>findChrome({env,platform:'win32',exists:()=>false,registry:()=>{throw Error('disabled')}}),/Chrome/);
 assert.throws(()=>findChrome({env:{CHROME_PATH:'C:\\cmd.exe'},platform:'win32',exists:()=>true,registry:()=>[]}),/Chrome/);
});
test('browser args isolate the app session; taskkill targets only its own live PID/tree',async()=>{
 const args=chromeArguments('http://127.0.0.1:3000','C:\\Có dấu\\profile');assert.ok(args.includes('--app=http://127.0.0.1:3000'));assert.ok(args.includes('--user-data-dir=C:\\Có dấu\\profile'));assert.ok(args.includes('--disable-background-mode'));
 let call;await killOwnedTree({pid:123,exitCode:null,signalCode:null},{platform:'win32',exec:(cmd,args)=>call={cmd,args}});
 assert.deepEqual(call.args,['/PID','123','/T','/F']);assert.ok(!call.args.includes('/IM'));
 call=null;await killOwnedTree({pid:123,exitCode:0},{platform:'win32',exec:()=>call=true});assert.equal(call,null);
});
test('occupied port is reported without taking over or stopping the existing service',async(t)=>{
 const s=net.createServer(socket=>socket.end('alive'));await new Promise(r=>s.listen(0,'127.0.0.1',r));t.after(()=>s.close());
 await assert.rejects(ensureFreePort(s.address().port),/đang được sử dụng/);assert.equal(s.listening,true);
});
test('readiness requires the owner token response, rejects unrelated service, and supports cancellation',async()=>{
 const child={exitCode:null};await assert.rejects(waitOwnedServer('http://test','secret',child,{timeoutMs:20,fetcher:async()=>Response.json({app:'whiteboard-studio',owned:false})}));
 let sent;await waitOwnedServer('http://test','secret',child,{fetcher:async(u,o)=>{sent=o.headers;return Response.json({app:'whiteboard-studio',owned:true});}});assert.equal(sent['X-Desktop-Token'],'secret');
 const c=new AbortController();c.abort();await assert.rejects(waitOwnedServer('http://test','secret',child,{signal:c.signal}),/Đã đóng/);
});
test('supervisor cannot spawn children until the parent job has been assigned and START arrives',async()=>{
 const stream=new PassThrough();const ready=awaitParent(stream,1000);stream.write('START\n');await ready;stream.destroy();
 const wrong=new PassThrough();const denied=awaitParent(wrong,1000);wrong.write('bad\n');await assert.rejects(denied,/Sai xác nhận/);wrong.destroy();
 const empty=new PassThrough();await assert.rejects(awaitParent(empty,20),/không xác nhận/);empty.destroy();
});
