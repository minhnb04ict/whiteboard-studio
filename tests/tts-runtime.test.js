import test from "node:test";
import assert from "node:assert/strict";
import { resolveTtsPython } from "../src/tts-runtime.js";
const base = { root: "/app", platform: "win32" };
test("stale Piper path and missing .venv-tts fall back to the shared renderer environment", () => {
  const shared = "/app/.venv/Scripts/python.exe";
  assert.equal(
    resolveTtsPython({
      ...base,
      env: { PIPER_PYTHON_PATH: "C:/oldPC/.venv-tts/Scripts/python.exe" },
      exists: (p) => p === shared,
    }),
    shared,
  );
});
test("portable runtime takes priority; valid explicit and legacy environments remain usable", () => {
  const bundled = "/app/runtime/python/python.exe";
  assert.equal(
    resolveTtsPython({
      ...base,
      env: { PIPER_PYTHON_PATH: "/custom/python" },
      exists: () => true,
    }),
    bundled,
  );
  assert.equal(
    resolveTtsPython({
      ...base,
      env: { PIPER_PYTHON_PATH: '"/custom/python"' },
      exists: (p) => p === "/custom/python",
    }),
    "/custom/python",
  );
  assert.equal(
    resolveTtsPython({
      ...base,
      env: {},
      exists: (p) => p === "/app/.venv-tts/Scripts/python.exe",
    }),
    "/app/.venv-tts/Scripts/python.exe",
  );
});
test("missing environments explain the correct setup instead of spawning nonexistent Python", () => {
  assert.throws(
    () => resolveTtsPython({ ...base, env: {}, exists: () => false }),
    /npm run setup:tts/,
  );
});
