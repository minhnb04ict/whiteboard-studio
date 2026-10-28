import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
process.env.DATA_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), "whiteboard-queue-"),
);
const { save, get, uid } = await import("../src/store.js");
const { enqueue, cancel, startQueue } = await import("../src/queue.js");
test("durable queue marks interrupted jobs and runs queued jobs sequentially", async () => {
  const a = {
      id: uid(),
      scenes: [],
      job: { id: uid(), type: "slow", status: "running", logs: [] },
    },
    b = {
      id: uid(),
      scenes: [],
      job: { id: uid(), type: "ok", status: "queued", logs: [] },
    };
  save(a);
  save(b);
  const seen = [];
  let running = 0,
    max = 0;
  startQueue(async (id, type, opts, ctx) => {
    running++;
    max = Math.max(max, running);
    seen.push(id);
    await wait(30);
    ctx.log("done", 90);
    running--;
  });
  const c = { id: uid(), scenes: [], job: null };
  save(c);
  enqueue(c.id, "ok");
  assert.throws(() => enqueue(c.id, "ok"));
  for (let i = 0; i < 100 && get(c.id).job.status !== "done"; i++)
    await wait(10);
  assert.equal(get(a.id).job.status, "interrupted");
  assert.equal(get(b.id).job.status, "done");
  assert.equal(get(c.id).job.status, "done");
  assert.equal(max, 1);
  assert.deepEqual(seen, [b.id, c.id]);
  const d = { id: uid(), scenes: [], job: null };
  save(d);
  enqueue(d.id, "ok");
  cancel(d.id);
  await wait(50);
  assert.equal(get(d.id).job.status, "cancelled");
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
});
