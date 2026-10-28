import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSrt, decodeSubtitleFile} from '../public/srt-timing.js';
import {srtText} from '../src/domain.js';

test('uploaded subtitles retain every cue, narration and final duration',()=>{
  for(const [name,count,end] of [['phu-de.srt',14,100000],['atitn.srt',11,53500]]) {
    const raw=fs.readFileSync(new URL('./fixtures/subtitles/'+name,import.meta.url),'utf8');
    const cues=parseSrt(raw);
    assert.equal(cues.length,count); assert.equal(cues.at(-1).endMs,end);
    assert.ok(cues.every(c=>!c.text.includes('-->')));
    const sourceWords=raw.split(/\r?\n/).filter(l=>!/^\s*\d+\s*$/.test(l)).join(' ')
      .replace(/\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/g,'').replace(/\s+/g,' ').trim();
    assert.equal(cues.map(c=>c.text).join(' '),sourceWords);
    assert.deepEqual(parseSrt(srtText(cues)),cues);
  }
});

test('SRT tolerates CRLF/CR, BOM, missing blank lines/indexes, inline narration and timestamp variants',()=>{
  const expected=[{startMs:100,endMs:1500,text:'Xin chào các con.'},{startMs:2000,endMs:4000,text:'Bài học hôm nay.'}];
  for(const raw of [
    '\uFEFF1\r\n00:00:00.1 --> 00:00:01.50\r\nXin chào\r\ncác con.\r\n2 \r\n00:00:02 --> 00:00:04 Bài học hôm nay.',
    '00:00.100-->00:01.500 Xin chào các con.\n00:02.000-->00:04.000\nBài học hôm nay.',
    '1 00:00:00,100 -> 00:00:01,500 Xin chào các con.\r2 00:00:02,000 → 00:00:04,000 Bài học hôm nay.'
  ]) assert.deepEqual(parseSrt(raw),expected);
});

test('WebVTT accepts identifiers, settings and metadata blocks without dropping unnumbered narration',()=>{
  const raw='WEBVTT\nKind: captions\nLanguage: vi\n\nNOTE comment\nNot narration\n\nSTYLE\n::cue { color: white; }\n\nintro\n00:00.000 --> 00:02.000 align:start position:20%\n<b>Xin chào.</b>\n\nnext\n00:02.000 --> 00:04.000\nBài học.\n00:04.000 --> 00:06.000\nKết thúc.';
  const cues=parseSrt(raw);
  assert.deepEqual(cues.map(c=>c.text),['Xin chào.','Bài học.','Kết thúc.']);
  assert.equal(cues.at(-1).endMs,6000);
});

test('invalid later timestamps, overflow, missing narration and overlaps fail instead of reporting a partial duration',()=>{
  for(const raw of [
    '1\n00:00:00,000 --> 00:00:05,000\nHợp lệ.\n2\n00:00:06,000 --> bad\nLỗi.',
    '00:00:60,000 --> 00:01:02,000\nSai.',
    '00:61:00,000 --> 01:02:00,000\nSai.',
    '-00:00:01,000 --> 00:00:02,000\nSai.',
    '00:00:00,000 --> 00:00:01,000\n2\n00:00:02,000 --> 00:00:03,000\nHai.',
    '00:00:00,000 --> 00:00:03,000\nMột.\n00:00:02,000 --> 00:00:05,000\nHai.',
    '00:00:00,000 --> 00:10:01,000\nQuá dài.'
  ]) assert.throws(()=>parseSrt(raw));
});

test('file decoding supports UTF-8/BOM and UTF-16 LE/BE BOM, rejects corrupt encoding',()=>{
  const raw='1\n00:00:00,000 --> 00:00:02,000\nTiếng Việt.';
  const le=Buffer.concat([Buffer.from([255,254]),Buffer.from(raw,'utf16le')]);
  const be=Buffer.from(le); be.swap16();
  for(const data of [Buffer.from(raw),Buffer.from('\uFEFF'+raw),le,be])
    assert.deepEqual(parseSrt(decodeSubtitleFile(data)),parseSrt(raw));
  assert.throws(()=>decodeSubtitleFile(new Uint8Array([0xff,0xff])));
});
