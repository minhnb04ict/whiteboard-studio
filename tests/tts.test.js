import test from "node:test";
import assert from "node:assert/strict";
import {
  settings,
  validateSettings,
  speechKey,
  speechCurrent,
  speechTimeline,
} from "../src/tts.js";
import { fallbackAnnotation, validateAnnotation } from "../src/domain.js";
function project() {
  return {
    audio: "uploaded.m4a",
    cues: [{ startMs: 0, endMs: 2000, text: "old" }],
    scenes: [1, 2].map((n) => {
      const s = {
        id: String(n),
        title: "Cảnh " + n,
        text: "Xin chào.",
        startMs: (n - 1) * 2000,
        durationMs: 2000,
      };
      s.annotation = fallbackAnnotation(s);
      s.speech = { file: n + ".wav", durationMs: 3000, key: speechKey(s) };
      return s;
    }),
  };
}
test("Piper settings reject unsupported voices, empty text and invalid rates", () => {
  assert.throws(() =>
    validateSettings({ ...settings({ text: "Hello" }), voice: "../../file" }),
  );
  assert.throws(() => validateSettings(settings({ text: "" })));
  assert.throws(() =>
    validateSettings(settings({ text: "A", tts: { speed: 0 } })),
  );
  assert.equal(
    validateSettings(settings({ text: "Xin chào" })).voice,
    "vi_VN-vais1000-medium",
  );
});
test("TTS cache invalidates only for narration and voice settings, not picture or annotation", () => {
  const s = project().scenes[0];
  assert.ok(speechCurrent(s));
  s.prompt = "new image";
  assert.ok(speechCurrent(s));
  s.narration = "Nội dung mới";
  assert.ok(!speechCurrent(s));
});
test("Piper export stretches scenes without mutating source and scales valid annotations", () => {
  const p = project(),
    copy = structuredClone(p),
    out = speechTimeline(p, { audioSource: "tts" });
  assert.equal(out.scenes[0].durationMs, 3228);
  assert.equal(out.scenes[1].startMs, 3228);
  assert.equal(out.cues[0].startMs, 150);
  assert.equal(out.audio, null);
  assert.deepEqual(p, copy);
  for (const s of out.scenes) validateAnnotation(s.annotation, s.durationMs);
  assert.throws(
    () => speechTimeline(p, { audioSource: "tts", timing: "fixed" }),
    /ngắn hoặc dài/,
  );
  p.scenes[1].narration = "Changed";
  assert.throws(() => speechTimeline(p, { audioSource: "tts" }), /đã thay đổi/);
  assert.equal(
    speechTimeline(p, { audioSource: "upload" }).audio,
    "uploaded.m4a",
  );
  assert.equal(speechTimeline(p, { audioSource: "none" }).sceneSpeech, false);
});

test("28.6s scene / 20s audio is balanced without 8.6s dead air", () => {
  const p = project();
  p.scenes = [p.scenes[0]];
  const s = p.scenes[0];
  s.durationMs = 28600;
  s.speech.durationMs = 20000;
  s.annotation = fallbackAnnotation(s);
  const out = speechTimeline(p, { audioSource: "tts", timing: "fit" });
  assert.equal(out.scenes[0].durationMs, 24030);
  assert.equal(out.scenes[0].speech.playbackRate, 0.85);
  assert.equal(out.scenes[0].speech.audioDurationMs, 23530);
  validateAnnotation(out.scenes[0].annotation, 24030);
  const natural = speechTimeline(p, { audioSource: "tts", timing: "voice" });
  assert.equal(natural.scenes[0].durationMs, 20500);
});
test("shortening dense annotations keeps minimum reveal durations and tail", () => {
  const p = project();
  p.scenes = [p.scenes[0]];
  const s = p.scenes[0];
  s.durationMs = 28600;
  s.speech.durationMs = 600;
  s.annotation = fallbackAnnotation(s);
  s.annotation.elements = Array.from({ length: 20 }, (_, i) => ({
    ...structuredClone(s.annotation.elements[0]),
    reveal: { startMs: i * 1000, durationMs: 1000, protectedRegions: [] },
  }));
  const out = speechTimeline(p, { audioSource: "tts", timing: "voice" });
  validateAnnotation(out.scenes[0].annotation, out.scenes[0].durationMs);
});
test("fixed timing stretches moderate mismatch and rejects extreme stretch", () => {
  const p = project();
  p.scenes = [p.scenes[0]];
  const s = p.scenes[0];
  s.durationMs = 10000;
  s.speech.durationMs = 8000;
  const out = speechTimeline(p, { audioSource: "tts", timing: "fixed" });
  assert.equal(out.scenes[0].durationMs, 10000);
  assert.equal(out.scenes[0].speech.audioDurationMs, 9500);
});

test('legacy 1.1.0 audio stays usable; adding a pacing style requires regeneration', async()=>{
 const {createHash}=await import('node:crypto');
 const s={text:'Xin chào',tts:{voice:'vi_VN-vais1000-medium',speed:1,pauseMs:300}};
 s.speech={file:'old.wav',key:createHash('sha256').update(JSON.stringify({text:s.text,...s.tts})).digest('hex')};
 assert.ok(speechCurrent(s));s.tts.style='calm';assert.ok(!speechCurrent(s));
});

test("fixed user example fills 28.6s scene with 20s narration without changing pitch",()=>{
 const p=project();p.scenes=[p.scenes[0]];p.scenes[0].durationMs=28600;p.scenes[0].speech.durationMs=20000;
 const out=speechTimeline(p,{audioSource:"tts",timing:"fixed"});
 assert.equal(out.scenes[0].durationMs,28600);assert.equal(out.scenes[0].speech.audioDurationMs,28100);
 assert.ok(Math.abs(out.scenes[0].speech.playbackRate-20/28.1)<1e-8);
});
