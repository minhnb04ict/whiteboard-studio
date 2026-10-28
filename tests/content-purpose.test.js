import test from "node:test";
import assert from "node:assert/strict";
import {
  purposeInstruction,
  visualPlan,
  imageBaseStyle,
  validateContentSettings,
} from "../src/content-purpose.js";
import { coherentPrompt } from "../src/visual-consistency.js";
test("knowledge visuals allow purposeful diagrams and avoid forced story characters/text bans", () => {
  const p = { contentMode: "explain", audience: "secondary" };
  assert.match(purposeInstruction(p), /process\/flow/);
  assert.match(purposeInstruction(p), /do not invent facts/);
  assert.ok(!imageBaseStyle(p).includes("No lettering"));
  const text = coherentPrompt(
    imageBaseStyle(p),
    { purpose: "explain", styleGuide: "diagram", characters: [] },
    { prompt: "Show water cycle", text: "Water evaporates" },
    [],
    false,
  );
  assert.match(text, /different process stages/);
  assert.ok(!text.includes("No duplicated person, cloned face/body, montage"));
  assert.ok(
    purposeInstruction({ contentMode: "story" }).includes(
      "One coherent moment",
    ),
  );
  assert.throws(() => validateContentSettings({ contentMode: "unknown" }));
});
test("knowledge scene plans require a learning goal and supported representation", () => {
  assert.throws(() => visualPlan(null, "explain"));
  assert.throws(() =>
    visualPlan({ type: "decorative", goal: "Pretty" }, "explain"),
  );
  assert.deepEqual(
    visualPlan(
      { type: "process", goal: "Explain stages", labels: ["Bay hơi"] },
      "explain",
    ),
    { type: "process", goal: "Explain stages", labels: ["Bay hơi"] },
  );
  assert.equal(visualPlan(null, "story"), null);
});

test('explanation labels must come from the actual source narration',()=>{
 assert.throws(()=>visualPlan({type:'structure',goal:'Show parts',labels:['Tim']},'explain','Đây là cấu tạo của lá cây.'),/không có/);
 assert.equal(visualPlan({type:'structure',goal:'Show parts',labels:['lá cây']},'explain','Đây là cấu tạo của lá cây.').labels[0],'lá cây');
});
