process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "wb-waiting-"));
const { save, get, uid } = await import("../src/store.js");
const { enqueue, cancel, startQueue } = await import("../src/queue.js");
const { AgnesBusyError } = await import("../src/agnes-client.js");
test("proposal overload waits durably; cancel stops it; saved waiting work resumes after startup", async () => {
  const p = { id: uid(), scenes: [] };
  save(p);
  let calls = 0;
  startQueue(async () => {
    calls++;
    throw new AgnesBusyError("busy", 503, Date.now() + 60000);
  });
  enqueue(p.id, "sceneplan");
  for (let i = 0; i < 100 && get(p.id).job.status !== "waiting"; i++)
    await wait(10);
  assert.equal(get(p.id).job.status, "waiting");
  assert.ok(get(p.id).job.retryAt > Date.now());
  cancel(p.id);
  await wait(20);
  assert.equal(get(p.id).job.status, "cancelled");
  assert.equal(calls, 1);
  const q = {
    id: uid(),
    scenes: [],
    job: {
      id: uid(),
      type: "sceneplan",
      status: "waiting",
      retryAt: Date.now() - 100,
      options: {},
      logs: [],
    },
  };
  save(q);
  let resumed = false;
  startQueue(async (id, type, options) => {
    resumed = options.resume;
    return {};
  });
  for (let i = 0; i < 100 && get(q.id).job.status !== "done"; i++)
    await wait(10);
  assert.equal(get(q.id).job.status, "done");
  assert.equal(resumed, true);
  const exhausted = { id: uid(), scenes: [] };
  save(exhausted);
  const probes = [];
  startQueue(async (id, type, opts, ctx) => {
    probes.push(ctx.retryState.probe);
    throw new AgnesBusyError("busy", 503, Date.now() + 10);
  });
  enqueue(exhausted.id, "sceneplan");
  for (let i = 0; i < 250 && get(exhausted.id).job.status !== "error"; i++)
    await wait(10);
  assert.equal(get(exhausted.id).job.status, "error");
  assert.deepEqual(probes, [false, true]);
  // Let the queue's scheduled idle pump finish before deleting its store.
  await new Promise((resolve) => setImmediate(resolve));
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
});
