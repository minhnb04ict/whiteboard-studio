import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "wb-piper-"));
const { save, get, uid, dir, update } = await import("../src/store.js");
const { enqueue, startQueue } = await import("../src/queue.js");
const { workflow } = await import("../src/workflow.js");
const { fallbackAnnotation } = await import("../src/domain.js");
const { speechTimeline } = await import("../src/tts.js");
const { python } = await import("../src/process.js");
const p = {
  id: uid(),
  revision: 0,
  scenes: [
    ["Xin chào các con.\nHôm nay chúng ta trồng cây.", "vi_Cake-male"],
    ["Hello children.\nLet us plant a tree.", "en_US-hfc_male-medium"],
  ].map(([text, voice], i) => {
    const s = {
      id: "scene-" + i,
      title: "Test " + i,
      text,
      startMs: i * 2000,
      durationMs: 2000,
      image: "scene.png",
      tts: { voice, speed: 1, pauseMs: 400 },
    };
    s.annotation = fallbackAnnotation(s);
    return s;
  }),
  cues: [{ startMs: 0, endMs: 4000, text: "test" }],
};
save(p);
fs.copyFileSync(
  "vendor/whiteboard/examples/scene-01-monkey-mountain-banana.png",
  path.join(dir(p.id), "scene.png"),
);
update(p.id, (x) => {
  x.scenes[1].tts.speed = 0;
});
startQueue(workflow);
async function finish(expected = "done") {
  for (let i = 0; i < 1800; i++) {
    const x = get(p.id);
    if (!["queued", "running"].includes(x.job.status)) {
      assert.equal(x.job.status, expected, x.job.message);
      return x;
    }
    await wait(100);
  }
  throw Error("timeout");
}
try {
  enqueue(p.id, "speech");
  let x = await finish("partial");
  const savedFirst = x.scenes[0].speech.file;
  assert.equal(x.scenes[1].tasks.speech.status, "error");
  update(p.id, (x) => {
    x.scenes[1].tts.speed = 1;
  });
  enqueue(p.id, "speech", { retryFailed: true });
  x = await finish();
  assert.equal(x.scenes[0].speech.file, savedFirst);
  assert.ok(x.scenes.every((s) => s.speech?.durationMs > 1000));
  const first = x.scenes[0].speech.file;
  enqueue(p.id, "speech", { sceneId: "scene-1" });
  x = await finish();
  assert.equal(x.scenes[0].speech.file, first);
  const t = speechTimeline(x, { audioSource: "tts" });
  assert.ok(t.scenes[0].durationMs > 2000);
  enqueue(p.id, "render", {
    preview: true,
    audioSource: "tts",
    timing: "fit",
    mode: "grid",
  });
  x = await finish();
  const video = path.join(dir(p.id), x.preview.file);
  await python([
    "-c",
    `import av,numpy as np\nc=av.open(${JSON.stringify(video)})\nassert len(c.streams.audio)==1\nenergy=sum(float(np.abs(f.to_ndarray()).sum()) for f in c.decode(audio=0))\nassert energy>1, energy\nprint('AAC audio verified, energy',energy)`,
  ]);
  console.log(
    "PASS: actual Piper Vietnamese + English, regenerate one scene, stretch timeline, render MP4 with non-silent AAC audio.",
  );
} finally {
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
}
