const assert = require("assert");
const data = require("./data.js");
const { grossHours, totalShrinkage, analyzeWeek, analyze } = require("./app.js");

// metric math
assert.strictEqual(grossHours({ agents: 40, weeklyHoursPerAgent: 40 }), 1600);
assert.strictEqual(totalShrinkage({ PTO: 10, Sick: 5 }), 15);
const w = analyzeWeek({ id: "x", label: "X", shrinkage: { PTO: 400 } }, data.team);
assert.strictEqual(w.net, 1200);
assert.strictEqual(w.shrinkPct, 0.25);
assert.strictEqual(analyzeWeek({ id: "y", label: "Y", shrinkage: {} }, { agents: 0, weeklyHoursPerAgent: 0 }).shrinkPct, null);

// demo data integrity
assert.strictEqual(data.weeks.length, 6);
data.weeks.forEach((wk) => {
  data.categories.forEach((c) => {
    assert(Number.isInteger(wk.shrinkage[c]) && wk.shrinkage[c] >= 0, c + " hours valid");
  });
});

// analysis shape and demo narrative: plan mostly fits, with visible pressure weeks
const r = analyze(data);
assert.strictEqual(r.weeks.length, 6);
assert(r.avgShrinkPct > 0.15 && r.avgShrinkPct < 0.40, "avg shrinkage plausible, got " + r.avgShrinkPct);
assert(r.weeks.every((x) => x.net > 0), "net hours positive");
assert(r.shortWeeks.length >= 1, "at least one week below required coverage");
assert(r.overCeiling.length >= 1, "at least one week over the ceiling");
assert.strictEqual(Object.keys(r.categoryTotals).length, 5);
const catSum = Object.values(r.categoryTotals).reduce((a, b) => a + b, 0);
assert.strictEqual(catSum, r.shrink, "category totals reconcile with total shrinkage");

console.log("ALL TESTS PASS");
console.log("avg shrinkage:", (r.avgShrinkPct * 100).toFixed(1) + "%");
console.log("over ceiling:", r.overCeiling.map((x) => x.label).join(","));
console.log("short weeks:", r.shortWeeks.map((x) => x.label + "=" + x.net + "h").join(","));
