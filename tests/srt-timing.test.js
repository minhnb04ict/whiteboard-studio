import test from "node:test";
import assert from "node:assert/strict";
import { parseSrt, scaleSrt } from "../src/domain.js";
const raw =
  "1\n00:00:02,000 --> 00:00:05,000\nXin chào.\n\n2\n00:00:07,500 --> 00:00:10,000\nCùng trồng cây.";
test("SRT duration scaling preserves text, opening silence and gaps in proportion", () => {
  const original = parseSrt(raw),
    scaled = scaleSrt(original, 20000);
  assert.deepEqual(
    scaled.map((x) => [x.startMs, x.endMs]),
    [
      [4000, 10000],
      [15000, 20000],
    ],
  );
  assert.deepEqual(
    scaled.map((x) => x.text),
    original.map((x) => x.text),
  );
  assert.equal(original.at(-1).endMs, 10000);
  assert.equal(scaleSrt(original, 34567).at(-1).endMs, 34567);
});
test("SRT scaling rejects invalid duration and rounding that erases a subtitle", () => {
  for (const ms of [0, 999, 600001, NaN, 1.5])
    assert.throws(() => scaleSrt(parseSrt(raw), ms));
  assert.throws(() =>
    scaleSrt(
      [
        { startMs: 0, endMs: 1, text: "a" },
        { startMs: 1, endMs: 600000, text: "b" },
      ],
      1000,
    ),
  );
});
