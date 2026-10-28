import test from 'node:test';
import assert from 'node:assert/strict';
import {videoFilename} from '../src/video-filename.js';
test('video downloads use accent-free project titles and rendered resolution, including legacy exports',()=>{
 assert.equal(videoFilename({title:'Rùa và Thỏ'},{height:1080}),'Video_Rua_va_Tho_FHD.mp4');
 assert.equal(videoFilename({title:'Đường đến trường'},{height:720}),'Video_Duong_den_truong_HD.mp4');
 assert.equal(videoFilename({title:'Rùa và Thỏ'},{},true),'Video_Rua_va_Tho_360p.mp4');
 assert.equal(videoFilename({title:'Rùa và Thỏ'},{}),'Video_Rua_va_Tho_FHD.mp4');
 assert.equal(videoFilename({title:'../../ 🐢 : * ? \r\n'},{height:2160}),'Video_Du_an_4K.mp4');
 assert.ok(videoFilename({title:'A'.repeat(200)},{height:1080}).length<130);
});
