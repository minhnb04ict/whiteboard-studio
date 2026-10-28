import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
process.env.PIPER_MODELS_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), "wb-voices-"),
);
// Existing executable deliberately rejects the Python script, without a network call.
process.env.PIPER_PYTHON_PATH = process.execPath;
const { voiceList, downloadVoice } = await import("../src/voice-downloads.js");
test("voice catalog detects local models and deduplicates shared male/female download; errors can retry", async () => {
  assert.ok(voiceList().every((v) => !v.installed));
  assert.throws(() => downloadVoice("bad"));
  const job = downloadVoice("vi_Cake-male");
  assert.equal(downloadVoice("vi_Cake-female"), job);
  for (let i = 0; i < 50 && ["running", "queued"].includes(job.status); i++)
    await wait(10);
  assert.equal(job.status, "error");
  assert.notEqual(downloadVoice("vi_Cake-male"), job);
  await wait(50);
  const base = path.join(
    process.env.PIPER_MODELS_DIR,
    "vi_VN-csa-voice-piper-v3-medium",
  );
  const fd=fs.openSync(base + ".onnx", "w"); fs.ftruncateSync(fd,77100991); fs.closeSync(fd);
  fs.writeFileSync(base + ".onnx.json", JSON.stringify({num_speakers:5}));
  assert.ok(
    voiceList()
      .filter((v) => v.id.startsWith("vi_Cake-"))
      .every((v) => v.installed),
  );
  fs.rmSync(process.env.PIPER_MODELS_DIR, { recursive: true, force: true });
});
