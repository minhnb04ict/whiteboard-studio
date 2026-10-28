process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';
import { mockVisual } from "./mock-visual.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
const data = fs.mkdtempSync(path.join(os.tmpdir(), "wb-features-"));
const mock = http.createServer(async (req, res) => {
  let raw = "";
  for await (const c of req) raw += c;
  const body = JSON.parse(raw),
    prompt = body.messages.at(-1).content;
  const mocked = mockVisual(body);
  if (mocked) {
    res.setHeader("Content-Type", "application/json");
    res.end(await mocked.text());
    return;
  }
  let answer;
  if (prompt.includes("Chia toàn bộ nội dung")) {
    const count = Number(prompt.match(/ĐÚNG (\d+)/)[1]);
    const n = Number(prompt.match(/từ 1 đến (\d+)/)[1]);
    answer = {
      ranges: Array.from({ length: count }, (_, i) => ({
        start: Math.floor((i * n) / count) + 1,
        end: Math.floor(((i + 1) * n) / count),
        title: "Cảnh " + (i + 1),
      })),
    };
  } else
    answer = {
      title: "Minh họa",
      prompt: "A simple illustration",
      cast: [],
      visualPlan: {
        type: "concept",
        goal: "Minh họa đúng ý chính",
        labels: [],
      },
    };
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(answer) } }],
    }),
  );
});
await new Promise((r) => mock.listen(0, "127.0.0.1", r));
const upstream = mock.address().port;
const proc = spawn(process.execPath, ["src/server.js"], {
  env: {
    ...process.env,
    PORT: "3155",
    DATA_DIR: data,
    AGNES_API_KEY: "test",
    AGNES_BASE_URL: `http://127.0.0.1:${upstream}`,
    AGNES_MIN_INTERVAL_MS: "0",
  },
  stdio: "ignore",
});
const base = "http://127.0.0.1:3155";
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
  for (let i = 0; i < 60; i++) {
    try {
      await call("/api/config");
      break;
    } catch {
      await wait(100);
    }
  }
  const text = Array.from({ length: 80 }, (_, i) => "từ" + i).join(" ");
  let p = await call("/api/projects", "POST", {
    title: "Exact five",
    text,
    seconds: 60,
    sceneCount: 5,
    contentMode: "explain",
    audience: "secondary",
  });
  for (let i = 0; i < 100; i++) {
    p = await call("/api/projects/" + p.id);
    if (!["queued", "running"].includes(p.job.status)) break;
    await wait(50);
  }
  assert.equal(p.job.status, "done", p.job.message);
  assert.equal(p.scenes.length, 5);
  assert.equal(p.contentMode, "explain");
  assert.ok(p.scenes.every((s) => s.visualPlan?.type === "concept"));
  assert.equal(p.scenes.map((s) => s.text).join(" "), text);
  assert.ok(p.scenes.every((s) => s.prompt));
  const beforeText = p.scenes.map((s) => s.text).join(" ");
  p = await call(`/api/projects/${p.id}/content-settings`, "PUT", {
    contentMode: "story",
    audience: "adult",
  });
  assert.equal(p.scenes.map((s) => s.text).join(" "), beforeText);
  assert.ok(p.scenes.every((s) => s.promptPurposeStale));
  const list = await call("/api/voices");
  assert.ok(list.some((v) => v.id === "vi_Cake-male"));
  assert.ok(list.every((v) => typeof v.installed === "boolean"));
  const invalid = await fetch(base + "/api/voices/no-such-voice/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(invalid.status, 400);
  assert.equal(
    (await fetch(base + "/api/desktop/shutdown", { method: "POST" })).status,
    403,
  );
  await call("/api/projects/" + p.id, "DELETE");
  assert.ok(!(await call("/api/projects")).some((x) => x.id === p.id));
  assert.ok(!fs.existsSync(path.join(data, p.id)));
  console.log(
    "PASS: exact five AI scenes preserve script, prompts generated, voice catalog, invalid downloads rejected, project deletion, desktop shutdown protected.",
  );
} finally {
  proc.kill();
  mock.close();
  await wait(1000);
  fs.rmSync(data, { recursive: true, force: true });
}
