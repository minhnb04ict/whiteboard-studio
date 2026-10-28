import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "wb-visual-"));
process.env.AGNES_API_KEY = "mock";
process.env.AGNES_MIN_INTERVAL_MS = "0";
process.env.AGNES_RETRIES = "0";
const { save, get, uid, dir } = await import("../src/store.js");
const { workflow } = await import("../src/workflow.js");
const profile = {
  styleGuide: "Same clean black outlines and cream paper",
  characters: [
    {
      id: "boy",
      name: "An",
      appearance: "short black hair, blue shirt, red shorts",
    },
  ],
};
test("individual characters cannot appear twice in the cast", async () => {
  const { validateCast } = await import("../src/visual-consistency.js");
  assert.throws(() => validateCast([{ id: "boy", count: 2 }], profile));
  assert.deepEqual(
    validateCast([{ id: "crowd", count: 3 }], {
      characters: [{ id: "crowd", kind: "group" }],
    }),
    [{ id: "crowd", count: 3 }],
  );
});
