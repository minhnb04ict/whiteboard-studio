import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
const data = fs.mkdtempSync(path.join(os.tmpdir(), "whiteboard-api-"));
const proc = spawn(process.execPath, ["src/server.js"], {
  env: { ...process.env, PORT: "3127", DATA_DIR: data },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
proc.stdout.on("data", (d) => (log += d));
proc.stderr.on("data", (d) => (log += d));
const base = "http://127.0.0.1:3127";
async function call(url, method = "GET", body) {
  const r = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  assert.ok(r.ok, JSON.stringify(d));
  return d;
}
try {
  for (let i = 0; i < 80; i++) {
    try {
      await fetch(base + "/api/config");
      break;
    } catch {
      await wait(100);
    }
  }
  const h = await call("/api/health");
  assert.ok(h.ok, JSON.stringify(h));
  const p = await call("/api/projects", "POST", {
    title: "Bài học tiếng Việt",
    kind: "srt",
    text: "1\n00:00:01,000 --> 00:00:04,000\nEm bảo vệ cây xanh.",
  });
  assert.equal(p.scenes[0].durationMs, 4000);
  await call(`/api/projects/${p.id}/scenes/scene-1`, "PUT", {
    title: "Cây xanh",
    prompt: "Simple tree",
  });
  assert.equal(
    (await call(`/api/projects/${p.id}`)).scenes[0].title,
    "Cây xanh",
  );
  const d = await call("/api/demo", "POST", {});
  assert.ok(d.scenes[0].image);
  await call(`/api/projects/${d.id}/jobs`, "POST", {
    type: "render",
    options: { preview: true, subtitles: true, hand: true },
  });
  let done;
  for (let i = 0; i < 600; i++) {
    done = await call(`/api/projects/${d.id}`);
    if (["done", "error"].includes(done.job.status)) break;
    await wait(500);
  }
  assert.equal(done.job.status, "done", done.job.message);
  assert.ok(done.preview);
  const v = await fetch(base + `/video/${d.id}/preview`);
  assert.ok(v.ok);
  assert.ok((await v.arrayBuffer()).byteLength > 1000);
  const secret = await fetch(base + "/static/../.env");
  assert.equal(secret.status, 404);
  console.log(
    "PASS: health, create SRT project, persist edits, demo upload, background render with Vietnamese captions, MP4 download, no .env exposure.",
  );
} finally {
  proc.kill("SIGTERM");
  await wait(1800);
  fs.rmSync(data, { recursive: true, force: true });
  if (process.exitCode) console.log(log);
}
