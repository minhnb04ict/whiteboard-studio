import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceUnits,
  scenesFromRanges,
  sceneCount,
} from "../src/scene-plan.js";
const cues = [
  {
    startMs: 1000,
    endMs: 17000,
    text: "Một hai ba bốn năm sáu bảy tám chín mười mười một mười hai mười ba.",
  },
];
test("exact scene ranges preserve original words and SRT timeline including opening silence", () => {
  const units = sourceUnits(cues, 3),
    n = units.length;
  const scenes = scenesFromRanges(cues, 3, [
    { start: 1, end: 1 },
    { start: 2, end: 2 },
    { start: 3, end: n },
  ]);
  assert.equal(scenes.length, 3);
  assert.equal(scenes[0].startMs, 0);
  assert.equal(scenes.at(-1).startMs + scenes.at(-1).durationMs, 17000);
  assert.equal(scenes.map((s) => s.text).join(" "), cues[0].text);
});
test("reject wrong scene count, gaps, duplicates, reversed or too-short AI ranges", () => {
  assert.throws(() => sceneCount(41, cues));
  assert.throws(() => sceneCount(0, cues));
  assert.throws(() => scenesFromRanges(cues, 3, [{ start: 1, end: 1 }]));
  assert.throws(() =>
    scenesFromRanges(cues, 2, [
      { start: 1, end: 2 },
      { start: 2, end: 4 },
    ]),
  );
  assert.throws(() =>
    scenesFromRanges(cues, 2, [
      { start: 1, end: 1 },
      { start: 3, end: 4 },
    ]),
  );
});
