import test from 'node:test';import assert from 'node:assert/strict';import {desktopProfilePath} from '../scripts/desktop-main.mjs';
test('persistent app profile is stable across source locations and isolated from personal Chrome',()=>{
 const spec={platform:'win32',port:3000,env:{LOCALAPPDATA:'C:\\Users\\Minh Đức\\AppData\\Local'},home:'C:\\Users\\Minh Đức'};
 const first=desktopProfilePath(spec);assert.equal(first,'C:\\Users\\Minh Đức\\AppData\\Local\\WhiteboardStudio\\ChromeProfile-3000');assert.equal(desktopProfilePath(spec),first);assert.ok(!first.includes('Google\\Chrome'));assert.notEqual(desktopProfilePath({...spec,port:3001}),first);
 assert.equal(desktopProfilePath({platform:'win32',port:3000,env:{},home:'C:\\Users\\A'}),'C:\\Users\\A\\AppData\\Local\\WhiteboardStudio\\ChromeProfile-3000');
});
