process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';
import { mockVisual } from "./mock-visual.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { setTimeout as wait } from "node:timers/promises";
process.env.DATA_DIR = fs.mkdtempSync(
  path.join(os.tmpdir(), "wb-scene-retry-"),
);
process.env.AGNES_API_KEY = "mock";
process.env.AGNES_MIN_INTERVAL_MS = "0";
process.env.AGNES_RETRIES = "0";
const { save, get, uid, update } = await import("../src/store.js");
const { enqueue, startQueue } = await import("../src/queue.js");
const { workflow } = await import("../src/workflow.js");
async function finish(id) {
  for (let i = 0; i < 300; i++) {
    const p = get(id);
    if (!["queued", "running"].includes(p.job.status)) return p;
    await wait(10);
  }
  throw Error("queue timeout");
}
test("scene queue continues after errors, retries only failures, preserves completed prompts and resumes interrupted work", async () => {
  const original = globalThis.fetch;
  const bytes = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  let fail = true;
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    const mocked = mockVisual(body);
    if (mocked) return mocked;
    const image = url.endsWith("/images/generations");
    const prompt = image ? body.prompt : body.messages.at(-1).content;
    const number = Number(
      prompt.match(
        image ? /Scene: illustration (\d)/ : /CẢNH HIỆN TẠI: scene (\d)/,
      )[1],
    );
    calls.push([image ? "image" : "storyboard", number]);
    if (fail && number === 2)
      return new Response(
        JSON.stringify({ error: { message: "temporary test failure" } }),
        { status: 400 },
      );
    return Response.json(
      image
        ? { data: [{ b64_json: bytes.toString("base64") }] }
        : {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: `Scene ${number}`,
                    prompt: `illustration ${number}`,
                    cast: [],
                  }),
                },
              },
            ],
          },
    );
  };
  const p = {
    id: uid(),
    style: "sketch",
    scenes: [1, 2, 3].map((n) => ({
      id: String(n),
      title: `Scene ${n}`,
      text: `scene ${n}`,
      prompt: "",
      durationMs: 4000,
    })),
  };
  p.planningEngine="agnes";save(p);
  // Recovery: preserve completed scene, retry only the interrupted remainder.
  const old = {
    id: uid(),
    scenes: [
      { id: "a", prompt: "saved", tasks: { storyboard: { status: "done" } } },
      { id: "b", prompt: "", tasks: { storyboard: { status: "running" } } },
    ],
    job: {
      id: uid(),
      type: "storyboard",
      status: "running",
      sceneIds: ["a", "b"],
      logs: [],
    },
  };
  old.planningEngine="agnes";save(old);
  startQueue(workflow);
  try {
    assert.equal(get(old.id).scenes[1].tasks.storyboard.status, "interrupted");
    // Inspect planning without starting recovery's mocked API call.
    enqueue(p.id, "storyboard",{ai:{fallback:false}});
    let result = await finish(p.id);
    assert.equal(result.job.status, "partial");
    assert.deepEqual(calls, [
      ["storyboard", 1],
      ["storyboard", 2],
      ["storyboard", 3],
    ]);
    fail = false;
    calls.length = 0;
    enqueue(p.id, "storyboard", { retryFailed: true,ai:{fallback:false} });
    result = await finish(p.id);
    assert.equal(result.job.status, "done");
    assert.deepEqual(calls, [["storyboard", 2]]);
    assert.throws(() => enqueue(p.id, "storyboard"), /Không có cảnh/);
  } finally {
    await new Promise(setImmediate);
    globalThis.fetch = original;
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
});
