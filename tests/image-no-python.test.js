import { mockVisual } from "./mock-visual.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
process.env.PYTHON_PATH = "/python-intentionally-not-installed";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "wb-no-python-"));
process.env.AGNES_API_KEY = "test-placeholder";
process.env.AGNES_MIN_INTERVAL_MS = "0";
const { save, get, uid, dir } = await import("../src/store.js");
const { config } = await import("../src/config.js");
config.python = "/python-intentionally-not-installed";
const { workflow, uploadImage } = await import("../src/workflow.js");
const { normalizeImage } = await import("../src/image.js");
const originalFetch = globalThis.fetch;
test("image upload and normalization work without Python or image generation", async () => {
  const buffer = await sharp({
    create: {
      width: 300,
      height: 600,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
  })
    .png()
    .toBuffer();
  const p = {
    id: uid(),
    revision: 0,
    style: "Sketch",
    scenes: [
      {
        id: "scene-1",
        title: "Cây xanh",
        text: "Em trồng cây",
        prompt: "A tree",
        durationMs: 4000,
      },
    ],
  };
  save(p);
  const requests = [];
  globalThis.fetch = async (url, options) => {
    const mocked = mockVisual(JSON.parse(options.body));
    if (mocked) return mocked;
    requests.push({ url, body: JSON.parse(options.body) });
    return new Response(
      JSON.stringify({ data: [{ b64_json: buffer.toString("base64") }] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    await uploadImage(p.id, "scene-1", buffer);
    const imagePath = path.join(dir(p.id), get(p.id).scenes[0].image);
    const meta = await sharp(imagePath).metadata();
    assert.equal(meta.width, 1280);
    assert.equal(meta.height, 720);
    assert.equal(meta.format, "png");
    const corner = await sharp(imagePath)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    assert.deepEqual([...corner], [246, 241, 227]);
    await assert.rejects(
      normalizeImage(
        Buffer.from("not-an-image"),
        path.join(dir(p.id), "bad.png"),
      ),
    );
    assert.ok(!fs.existsSync(path.join(dir(p.id), "bad.png")));
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
});
