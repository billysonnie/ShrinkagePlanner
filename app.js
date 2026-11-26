// ShrinkagePlanner metric engine + renderer.
// Metric functions are dependency-free and also run under Node for tests.

function grossHours(team) {
  return team.agents * team.weeklyHoursPerAgent;
}

function totalShrinkage(shrinkage) {
  return Object.values(shrinkage).reduce((a, b) => a + b, 0);
}

function analyzeWeek(week, team) {
  const gross = grossHours(team);
  const shrink = totalShrinkage(week.shrinkage);
  return {
    id: week.id,
    label: week.label,
    gross,
    shrink,
    net: gross - shrink,
    shrinkPct: gross === 0 ? null : shrink / gross,
  };
}

function analyze(data) {
  const weeks = data.weeks.map((w) => analyzeWeek(w, data.team));
  const gross = weeks.reduce((a, w) => a + w.gross, 0);
  const shrink = weeks.reduce((a, w) => a + w.shrink, 0);
  const required = data.requiredWeeklyHours;
  const avgShrinkPct = gross === 0 ? null : shrink / gross;
  const overCeiling = weeks.filter((w) => w.shrinkPct !== null && w.shrinkPct > data.ceiling);
  const shortWeeks = weeks.filter((w) => w.net < required);
  const categoryTotals = {};
  data.categories.forEach((c) => { categoryTotals[c] = 0; });
  data.weeks.forEach((w) => {
    data.categories.forEach((c) => { categoryTotals[c] += w.shrinkage[c] || 0; });
  });
  return { weeks, avgShrinkPct, overCeiling, shortWeeks, categoryTotals, required, gross, shrink };
}

function pct(x) {
  if (x === null || x === undefined || !isFinite(x)) return "n/a";
  return (x * 100).toFixed(1) + "%";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { grossHours, totalShrinkage, analyzeWeek, analyze };
}

/* ---------- browser rendering below ---------- */
if (typeof document !== "undefined") {
  const NS = "http://www.w3.org/2000/svg";
  const COLORS = { PTO: "#2456c9", Sick: "#b3261e", Training: "#178a4c", Meetings: "#8a6d00", Absenteeism: "#6b4fa1" };

  function el(tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function renderStacked(result, data) {
    const svg = document.getElementById("stackChart");
    const W = 720, H = 260, P = 44;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const gross = result.weeks[0].gross;
    const y = (v) => H - P - (v / gross) * (H - 2 * P);
    const bandW = (W - 2 * P) / result.weeks.length;
    [0.25, 0.5, 0.75, 1.0].forEach((g) => {
      svg.appendChild(el("line", { x1: P, x2: W - P, y1: y(gross * g), y2: y(gross * g), class: "grid" }));
      svg.appendChild(el("text", { x: 2, y: y(gross * g) + 4, class: "tick" }, Math.round(gross * g)));
    });
    // required-hours line
    svg.appendChild(el("line", { x1: P, x2: W - P, y1: y(result.required), y2: y(result.required), class: "reqline" }));
    svg.appendChild(el("text", { x: W - P - 118, y: y(result.required) - 5, class: "reqlabel" }, "required " + result.required + "h"));
    result.weeks.forEach((w, i) => {
      const x = P + i * bandW + bandW * 0.2;
      const bw = bandW * 0.6;
      // net hours bar (available)
      svg.appendChild(el("rect", { x, y: y(w.net), width: bw, height: H - P - y(w.net), class: "netbar" }));
      // stacked shrinkage on top of net
      let acc = w.net;
      const week = data.weeks[i];
      data.categories.forEach((c) => {
        const h = week.shrinkage[c] || 0;
        if (h > 0) {
          svg.appendChild(el("rect", { x, y: y(acc + h), width: bw, height: y(acc) - y(acc + h), fill: COLORS[c], class: "seg" }));
          acc += h;
        }
      });
      svg.appendChild(el("text", { x: x + bw / 2 - 14, y: H - P + 16, class: "tick" }, w.label));
      svg.appendChild(el("text", { x: x + bw / 2 - 18, y: y(w.net) - 6, class: "netlabel" }, w.net + "h"));
    });
  }

  function renderLegend(data) {
    const leg = document.getElementById("legend");
    const items = [["Available (net)", "#9aa7b8"]].concat(data.categories.map((c) => ["Shrunk: " + c, COLORS[c]]));
    items.forEach(([label, color]) => {
      const s = document.createElement("span");
      s.className = "legend-item";
      s.innerHTML = '<span class="swatch" style="background:' + color + '"></span>' + label;
      leg.appendChild(s);
    });
  }

  function renderCategoryTable(result, data) {
    const tbody = document.querySelector("#catTable tbody");
    data.categories
      .map((c) => [c, result.categoryTotals[c]])
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, total]) => {
        const tr = document.createElement("tr");
        const share = result.shrink === 0 ? null : total / result.shrink;
        [c, total + "h", pct(share)].forEach((v) => {
          const td = document.createElement("td");
          td.textContent = v;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
  }

  function render() {
    const data = SHRINKAGE_DATA;
    const result = analyze(data);
    document.getElementById("avgShrink").textContent = pct(result.avgShrinkPct);
    document.getElementById("overCeiling").textContent =
      result.overCeiling.length === 0 ? "none" : result.overCeiling.map((w) => w.label).join(", ");
    document.getElementById("shortWeeks").textContent =
      result.shortWeeks.length === 0 ? "none" : result.shortWeeks.map((w) => w.label + " (" + w.net + "h)").join(", ");
    const worst = result.weeks.reduce((a, b) => (b.shrinkPct > a.shrinkPct ? b : a));
    document.getElementById("worstWeek").textContent = worst.label + " " + pct(worst.shrinkPct);
    renderStacked(result, data);
    renderLegend(data);
    renderCategoryTable(result, data);
  }

  render();
}
