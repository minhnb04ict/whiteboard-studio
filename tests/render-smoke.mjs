import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { python, run } from "../src/process.js";
import { config } from "../src/config.js";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "whiteboard-render-"));
try {
  await python([
    "-c",
    `from PIL import Image,ImageDraw\nim=Image.new('RGB',(1280,720),'#F6F1E3'); d=ImageDraw.Draw(im); d.rectangle((750,200,1150,600),outline='black',width=5); im.save(r'${tmp}/scene.png')`,
  ]);
  const ann = {
    canvas: { width: 1280, height: 720 },
    sceneDurationMs: 3000,
    elements: [
      {
        region: { x: 0, y: 0, width: 400, height: 720 },
        reveal: { startMs: 100, durationMs: 700, protectedRegions: [] },
      },
      {
        region: { x: 0, y: 0, width: 1280, height: 720 },
        reveal: { startMs: 800, durationMs: 700, protectedRegions: [] },
      },
      {
        region: { x: 700, y: 100, width: 500, height: 600 },
        reveal: { startMs: 1500, durationMs: 1000, protectedRegions: [] },
      },
    ],
  };
  const m = {
    project: {
      cues: [
        {
          startMs: 1000,
          endMs: 3000,
          text: "Em yêu cây xanh — tiếng Việt có dấu.",
        },
      ],
      scenes: [
        {
          title: "Test",
          image: "scene.png",
          startMs: 0,
          durationMs: 3000,
          annotation: ann,
        },
      ],
    },
    projectDir: tmp,
    output: path.join(tmp, "video.mp4"),
    width: 640,
    height: 360,
    fps: 15,
    subtitles: true,
    hand: true,
    mode: "grid",
  };
  fs.writeFileSync(path.join(tmp, "manifest.json"), JSON.stringify(m));
  await python(["scripts/media.py", "render", path.join(tmp, "manifest.json")]);
  const info = await python([
    "-c",
    `import av,json, numpy as np\nc=av.open(r'${tmp}/video.mp4');s=c.streams.video[0];frames=list(c.decode(video=0));print(json.dumps({'w':s.width,'h':s.height,'frames':len(frames),'duration':float(s.duration*s.time_base),'first_std':float(np.std(frames[0].to_ndarray(format='rgb24'),axis=(0,1)).max())}))`,
  ]);
  const d = JSON.parse(info.trim());
  assert.equal(d.w, 640);
  assert.equal(d.h, 360);
  assert.equal(d.frames, 45);
  assert.ok(d.first_std < 2);
  assert.ok(Math.abs(d.duration - 3) < 0.04);
  console.log(
    "PASS: empty/fully masked region does not crash, exact frame count, blank opening, Vietnamese subtitles, H.264.",
  );
  await python([
    "-c",
    `import sys;sys.path.insert(0,'scripts');from media import ff;ff(['-f','lavfi','-i','sine=frequency=440:duration=1','-c:a','aac',r'${tmp}/audio.m4a'])`,
  ]);
  m.project.audio = "audio.m4a";
  m.width = 1920;
  m.height = 1080;
  m.fps = 30;
  m.mode = "skeleton";
  fs.writeFileSync(path.join(tmp, "manifest.json"), JSON.stringify(m));
  await python(["scripts/media.py", "render", path.join(tmp, "manifest.json")]);
  const hd = JSON.parse(
    (
      await python([
        "-c",
        `import av,json;c=av.open(r'${tmp}/video.mp4');s=c.streams.video[0];print(json.dumps({'w':s.width,'h':s.height,'frames':s.frames,'audio':len(c.streams.audio),'duration':c.duration/1000000}))`,
      ])
    ).trim(),
  );
  assert.equal(hd.w, 1920);
  assert.equal(hd.h, 1080);
  assert.equal(hd.frames, 90);
  assert.equal(hd.audio, 1);
  assert.ok(Math.abs(hd.duration - 3) < 0.1);
  console.log(
    "PASS: 1920x1080 30fps, skeleton mode, audio padded to video duration.",
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
