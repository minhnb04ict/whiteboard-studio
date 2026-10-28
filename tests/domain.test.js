import test from "node:test";
import assert from "node:assert/strict";
import {
  parseSrt,
  chunks,
  timedText,
  validateAnnotation,
  fallbackAnnotation,
  srtText,
} from "../src/domain.js";
import { extractJson } from "../src/agnes.js";
test("Vietnamese SRT preserves opening silence, inter-scene gaps and final duration", () => {
  const cues = parseSrt(
    "1\n00:00:02,000 --> 00:00:28,000\nEm trồng cây.\n\n2\n00:00:35,000 --> 00:00:45,000\nEm chăm sóc cây.",
  );
  const scenes = chunks(cues);
  assert.equal(scenes[0].startMs, 0);
  assert.equal(scenes[0].durationMs, 35000);
  assert.equal(scenes[1].startMs, 35000);
  assert.equal(
    scenes.reduce((n, s) => n + s.durationMs, 0),
    45000,
  );
  assert.deepEqual(parseSrt(srtText(cues)), cues);
});
test("reject negative or overlapping subtitle times", () => {
  assert.throws(() => parseSrt("1\n00:00:03,000 --> 00:00:02,000\nSai"));
  assert.throws(() =>
    parseSrt(
      "1\n00:00:00,000 --> 00:00:03,000\nMột\n\n2\n00:00:02,000 --> 00:00:04,000\nHai",
    ),
  );
});
test("annotation rejects overlap, out-of-bounds, too late finish", () => {
  const a = fallbackAnnotation({ durationMs: 4000, text: "Test" });
  assert.equal(validateAnnotation(a, 4000).elements.length, 1);
  const b = structuredClone(a);
  b.elements.push(structuredClone(b.elements[0]));
  assert.throws(() => validateAnnotation(b, 4000));
  a.elements[0].region.width = 1281;
  assert.throws(() => validateAnnotation(a, 4000));
  a.elements[0].region.width = 1280;
  a.elements[0].reveal.durationMs = 4000;
  assert.throws(() => validateAnnotation(a, 4000));
});
test("estimated captions have exact requested duration and no gaps", () => {
  const cues = timedText("Học sinh cùng nhau trồng cây. ".repeat(10), 60000);
  assert.equal(cues[0].startMs, 0);
  assert.equal(cues.at(-1).endMs, 60000);
  for (let i = 1; i < cues.length; i++)
    assert.equal(cues[i].startMs, cues[i - 1].endMs);
});
test("AI JSON parser accepts fenced JSON but rejects empty prose", () => {
  assert.deepEqual(extractJson('```json\n{"ok":true}\n```'), { ok: true });
  assert.throws(() => extractJson("Không có JSON"));
});
