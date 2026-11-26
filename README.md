# ShrinkagePlanner

Workforce management (WFM) shrinkage and capacity planner. It takes a team's gross hours and a planned shrinkage budget (PTO, sick, training, meetings, absenteeism) and turns it into net staffing hours per week, flagging the weeks that break the shrinkage ceiling or fall below required coverage.

**Live demo:** https://billysonnie.github.io/ShrinkagePlanner/

## What it does

- **Plan scorecards**: average shrinkage across the plan, the highest-shrinkage week, weeks over the shrinkage ceiling, and weeks below required coverage
- **Weekly capacity chart**: gross hours per week stacked into net (available) hours plus shrinkage by category, against a required-coverage line
- **Category table**: where the shrinkage hours go over the whole plan

## Data

**The team, plan, and coverage requirement in this demo are fictional.** They live in `data.js` (a 40-agent team on 40-hour weeks with a 6-week plan) and are sized to realistic shrinkage levels (about 25% on average, with a training-push week and a heavy-PTO week). They do not come from any real employer, team, or person. To plan with real numbers, replace `SHRINKAGE_DATA` in `data.js` with the same shape.

## Run it

Static site, no build step, no dependencies. Open `index.html` in a browser or serve the folder with any static server.

## Tests

Metric math and demo-data integrity are covered by a Node test suite:

```
node test.js
```

## Model limitations

- Shrinkage is planned at week level; it does not model intra-week distribution, so a week can pass here while still failing specific days or intervals.
- Sick and absenteeism are planned inputs in this demo; in practice they are forecast (typically from trailing averages), not scheduled.
- Net hours are compared to a single weekly requirement; real capacity planning works in interval-level FTE with occupancy and AHT assumptions (pair this with StaffingPilot for the interval view).
- The 30% ceiling is a demo parameter, not an industry standard; operations set their own.
