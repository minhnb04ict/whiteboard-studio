import test from "node:test";
import assert from "node:assert/strict";
import { createRequester, AgnesBusyError } from "../src/agnes-client.js";
function fixture(fetch, extra = {}) {
  let clock = 100000;
  const starts = [],
    states = [];
  const request = createRequester({
    key: "mock",
    base: "https://mock",
    timeout: 1000,
    retries: 2,
    imageRetries: 2,
    interval: 3000,
    imageInterval: 8000,
    random: () => 0,
    now: () => clock,
    sleep: async (ms) => {
      clock += ms;
    },
    fetch: async (...args) => {
      starts.push(clock);
      return fetch(...args);
    },
    onCooldown: (s) => states.push({ ...s }),
    ...extra,
  });
  return { request, starts, states };
}
test("image overload backs off exponentially then succeeds without skipping scene", async () => {
  let calls = 0;
  const f = fixture(() =>
    ++calls < 3
      ? Response.json(
          { error: { message: "image queue is full" } },
          { status: 503 },
        )
      : Response.json({ data: ["ok"] }),
  );
  assert.deepEqual(await f.request("/images/generations", {}), {
    data: ["ok"],
  });
  assert.deepEqual(f.starts, [100000, 115000, 145000]);
});
test("Retry-After persists a cooldown that a new requester honors", async () => {
  const f = fixture(
    () =>
      Response.json(
        { error: { message: "busy" } },
        { status: 429, headers: { "Retry-After": "40" } },
      ),
    { imageRetries: 0 },
  );
  await assert.rejects(f.request("/images/generations", {}), AgnesBusyError);
  const g = fixture(() => Response.json({ data: [] }), {
    initialCooldown: f.states.at(-1),
  });
  await g.request("/images/generations", {});
  assert.equal(g.starts[0], 140000);
});
test("authentication and ambiguous image network failures are not blindly retried", async () => {
  const f = fixture(() =>
    Response.json({ error: { message: "invalid token" } }, { status: 401 }),
  );
  await assert.rejects(f.request("/chat/completions", {}), /401/);
  assert.equal(f.starts.length, 1);
  const g = fixture(() => {
    throw Error("timeout");
  });
  await assert.rejects(g.request("/images/generations", {}), /chưa xác định/);
  assert.equal(g.starts.length, 1);
});
test("concurrent requests are serialized and minimum image spacing is respected", async () => {
  let active = 0,
    max = 0;
  const f = fixture(async () => {
    active++;
    max = Math.max(max, active);
    await Promise.resolve();
    active--;
    return Response.json({ data: [] });
  });
  await Promise.all([
    f.request("/images/generations", {}),
    f.request("/images/generations", {}),
  ]);
  assert.equal(max, 1);
  assert.deepEqual(f.starts, [100000, 108000]);
});
test("cancel during cooldown prevents another provider call", async () => {
  const controller = new AbortController();
  const f = fixture(
    () => Response.json({ error: { message: "busy" } }, { status: 503 }),
    {
      sleep: async () => {
        controller.abort();
        throw Error("cancelled");
      },
    },
  );
  await assert.rejects(
    f.request("/images/generations", {}, { signal: controller.signal }),
  );
  assert.equal(f.starts.length, 1);
});
test("legacy 130s cooldown counts down to zero and sends exactly one request", async () => {
  const logs = [];
  const f = fixture(() => Response.json({ data: [] }), {
    initialCooldown: { image: 230000 },
    legacyCooldown: true,
  });
  await f.request("/images/generations", {}, { log: (m) => logs.push(m) });
  assert.deepEqual(f.starts, [130000]);
  const waits = logs
    .filter((m) => m.includes("Chờ "))
    .map((m) => Number(m.match(/Chờ (\d+)/)[1]));
  assert.deepEqual(waits, [30, 20, 10]);
  assert.ok(logs.some(m => m.includes("Đang gửi yêu cầu tạo ảnh")));
});
test("recovery is a single probe, not another exponential retry cycle", async () => {
  const f = fixture(() =>
    Response.json({ error: { message: "queue full" } }, { status: 503 }),
  );
  await assert.rejects(
    f.request("/images/generations", {}, { retryState: { probe: true } }),
    AgnesBusyError,
  );
  assert.equal(f.starts.length, 1);
});
test("oversized Retry-After stops automatic waiting instead of extending it indefinitely", async () => {
  const f = fixture(() =>
    Response.json(
      { error: { message: "busy" } },
      { status: 503, headers: { "Retry-After": "600" } },
    ),
  );
  await assert.rejects(f.request("/images/generations", {}), /Retry-After/);
  assert.equal(f.starts.length, 1);
});
test("malformed successful image response is not retried as if generation were rejected", async () => {
  const f = fixture(() => new Response("not-json", { status: 200 }));
  await assert.rejects(f.request("/images/generations", {}), /không đọc được/);
  assert.equal(f.starts.length, 1);
});
