// ShrinkagePlanner demo data.
// ALL values below are FICTIONAL, generated for demonstration only.
// They do not come from any real employer, team, or person.
// Model: a 6-week capacity plan for a fictional 40-agent team.
// Gross hours = agents x contracted weekly hours. Shrinkage is time
// agents are paid but not available to take contacts (PTO, sick,
// training, meetings, absenteeism). Net hours = gross - shrinkage.

const TEAM = { agents: 40, weeklyHoursPerAgent: 40 };
const REQUIRED_WEEKLY_HOURS = 1150; // workload-derived coverage need

const CATEGORIES = ["PTO", "Sick", "Training", "Meetings", "Absenteeism"];

// Planned shrinkage hours per category per week (fictional plan).
// Week 4 has a training push; week 6 has heavy PTO (fictional holiday week).
const WEEKS = [
  { id: "w1", label: "Week 1", shrinkage: { PTO: 120, Sick: 60, Training: 40, Meetings: 80, Absenteeism: 20 } },
  { id: "w2", label: "Week 2", shrinkage: { PTO: 100, Sick: 80, Training: 40, Meetings: 80, Absenteeism: 30 } },
  { id: "w3", label: "Week 3", shrinkage: { PTO: 180, Sick: 50, Training: 60, Meetings: 80, Absenteeism: 40 } },
  { id: "w4", label: "Week 4", shrinkage: { PTO: 80, Sick: 70, Training: 240, Meetings: 80, Absenteeism: 25 } },
  { id: "w5", label: "Week 5", shrinkage: { PTO: 140, Sick: 90, Training: 40, Meetings: 80, Absenteeism: 50 } },
  { id: "w6", label: "Week 6", shrinkage: { PTO: 320, Sick: 60, Training: 20, Meetings: 40, Absenteeism: 30 } },
];

// Shrinkage ceiling: the share of gross hours the operation can absorb
// before net staffing falls below the coverage requirement.
const SHRINKAGE_CEILING = 0.30;

const SHRINKAGE_DATA = {
  generatedFor: "ShrinkagePlanner demo - fictional team and plan, not from any real operation",
  team: TEAM,
  requiredWeeklyHours: REQUIRED_WEEKLY_HOURS,
  categories: CATEGORIES,
  ceiling: SHRINKAGE_CEILING,
  weeks: WEEKS,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SHRINKAGE_DATA;
}
