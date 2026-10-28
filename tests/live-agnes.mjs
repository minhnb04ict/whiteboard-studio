// Optional live integration test. Uses configured Agnes key and may incur API usage.
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";
const data = path.resolve("data");
const proc = spawn(process.execPath, ["src/server.js"], {
  env: { ...process.env, PORT: "3128", DATA_DIR: data },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
proc.stdout.on("data", (d) => (logs += d));
proc.stderr.on("data", (d) => (logs += d));
const base = "http://127.0.0.1:3128";
async function call(u, method = "GET", body) {
  const r = await fetch(base + u, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error);
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
  const p = await call("/api/projects", "POST", {
    title: "Cùng em chăm sóc cây xanh",
    text: "Chúng em trồng một cây xanh trong sân trường. Mỗi ngày, em tưới nước để cây lớn lên. Cây xanh làm sân trường mát mẻ.",
    kind: "text",
    seconds: 12,
  });
  console.log("TEST_PROJECT=" + p.id);
  for (const type of ["storyboard"]) {
    console.log("START", type);
    await call(`/api/projects/${p.id}/jobs`, "POST", {
      type,
      options: { sceneId: "scene-1", preview: true },
    });
    let last = "",
      done = false;
    for (let i = 0; i < 1000; i++) {
      const q = await call(`/api/projects/${p.id}`);
      if (q.job.message !== last) {
        last = q.job.message;
        console.log(q.job.status, last);
      }
      if (q.job.status === "error") throw Error(q.job.message);
      if (q.job.status === "done") {
        done = true;
        break;
      }
      await wait(1000);
    }
    if (!done) throw Error("Live test timed out");
  }
  console.log("AI_E2E_PASS");
} finally {
  proc.kill("SIGTERM");
  await wait(1800);
}
