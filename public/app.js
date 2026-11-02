const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const COL = { Positive: "#397665", Negative: "#d16d50", Neutral: "#a9aca1" };
const EX = ["The labs are well equipped and the staff are very helpful.", "It was organized very badly and the lectures were given in different places.", "The exams were not difficult but the marking was unclear.", "Excellent lectures are delivered by teachers and all teachers are very punctual."];
async function api(path, body) {
  try {
    const r = await fetch("/api/" + path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
    const d = await r.json(); if (!r.ok) throw new Error(d.error || "Request failed"); return d;
  } catch (e) { throw new Error(e.message === "Failed to fetch" ? "Cannot reach the API. Run the site with npm start or deploy it to Netlify." : e.message); }
}
function highlight(text, words) {
  let h = esc(text);
  words.forEach(w => { h = h.replace(new RegExp("\\b" + w.word + "\\b", "i"), m => `<mark class="${w.value > 0 ? "p" : "n"}">${m}</mark>`); });
  return h;
}
const tags = a => a.length ? a.map(x => `<span class="tag">${esc(x)}</span>`).join("") : '<span class="note">none detected</span>';
async function one(text) {
  $("one").innerHTML = '<p class="note">Analysing…</p>';
  try {
    const { result: r } = await api("analyze", { text });
    $("one").innerHTML = `<div class="verdict ${r.label}">${r.label} <span class="note">(confidence ${r.confidence}%)</span></div><p>${highlight(r.text, r.words)}</p><p class="note">Topics: ${tags(r.aspects)}${r.contrast ? " · The part after “but” counts for more." : ""}</p>`;
  } catch (e) { $("one").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
let ei = 0;
$("go").onclick = () => one($("txt").value);
$("ex").onclick = () => { $("txt").value = EX[ei++ % EX.length]; one($("txt").value); };

function parseCSV(t) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += c; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
function comments(text) {
  const rows = parseCSV(text); if (!rows.length) return [];
  const head = rows[0].map(h => h.trim().toLowerCase()); const idx = head.findIndex(h => /comment|feedback|text|review/.test(h));
  if (idx >= 0) return rows.slice(1).map(r => r[idx] || "");
  return rows.map(r => r.join(", "));
}
let DATA = null, FILTER = "All";
async function dash(list) {
  $("dash").innerHTML = '<p class="note">Analysing…</p>';
  try { DATA = await api("analyze", { comments: list }); FILTER = "All"; draw(); } catch (e) { $("dash").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
function pct(n) { return Math.round(100 * n / DATA.total); }
function draw() {
  const c = DATA.counts, T = DATA.total; let a = 0;
  const grad = ["Positive", "Negative", "Neutral"].map(k => { const s = a; a += 100 * c[k] / T; return `${COL[k]} ${s}% ${a}%`; }).join(",");
  const asp = Object.entries(DATA.aspects).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.Positive}</td><td>${v.Negative}</td><td>${v.Neutral}</td></tr>`).join("") || '<tr><td colspan="4">No topics detected</td></tr>';
  const rows = DATA.items.filter(r => FILTER === "All" || r.label === FILTER).map(r => `<tr><td>${highlight(r.text, r.words)}</td><td class="${r.label}">${r.label}</td><td>${r.aspects.join(", ") || "-"}</td></tr>`).join("");
  $("dash").innerHTML = `<div class="cards"><div class="card"><b>${T}</b>comments</div><div class="card"><b class="Positive">${pct(c.Positive)}%</b>positive</div><div class="card"><b class="Negative">${pct(c.Negative)}%</b>negative</div><div class="card"><b>${Object.keys(DATA.aspects).length}</b>topics found</div></div>
<div class="two"><div class="panel"><h3 style="margin-top:0">Sentiment split</h3><div class="donut" style="background:conic-gradient(${grad})" role="img" aria-label="Positive ${c.Positive}, negative ${c.Negative}, neutral ${c.Neutral}"></div><div class="leg">${["Positive", "Negative", "Neutral"].map(k => `<span><i style="background:${COL[k]}"></i>${k} ${c[k]}</span>`).join("")}</div></div>
<div class="panel"><h3 style="margin-top:0">By topic</h3><table><tr><th>Topic</th><th>Pos</th><th>Neg</th><th>Neutral</th></tr>${asp}</table><p class="note" style="margin:10px 0 2px">Most mentioned words</p>${DATA.topWords.slice(0, 10).map(w => `<span class="tag">${esc(w.word)} ${w.count}</span>`).join("")}</div></div>
<h3>All comments</h3><div class="row filters">${["All", "Positive", "Negative", "Neutral"].map(f => `<button class="${f === FILTER ? "on" : ""}" data-f="${f}">${f}</button>`).join("")}<button class="ghost" id="dl">Download results (CSV)</button></div>
<div class="scroll"><table><tr><th>Comment</th><th>Sentiment</th><th>Topics</th></tr>${rows}</table></div>`;
  document.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { FILTER = b.dataset.f; draw(); });
  $("dl").onclick = () => {
    const q = s => '"' + String(s).replace(/"/g, '""') + '"';
    const csv = "comment,sentiment,confidence,topics\n" + DATA.items.map(r => [q(r.text), r.label, r.confidence, q(r.aspects.join("; "))].join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-results.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}
$("file").onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => dash(comments(String(r.result))); r.readAsText(f); };
$("sample").onclick = async () => { const t = await (await fetch("sample-feedback.csv")).text(); dash(comments(t)); };

(async function init() {
  try {
    const d = await api("info");
    $("pipe").innerHTML = d.pipeline.map((p, i) => `<article class="pipeline-step"><span class="pipeline-index">0${i + 1}</span><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p></article>`).join("");
    $("extension").innerHTML = d.extension.map((p, i) => `<article class="extension-item"><span class="extension-index">0${i + 1}</span><div><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p></div></article>`).join("");
    $("paper").textContent = `${d.paper.authors}. “${d.paper.title}.” ${d.paper.venue}.`;
    const paperUrl = "https://doi.org/" + d.paper.doi;
    $("doi").href = paperUrl;
    $("doi-footer").href = paperUrl;
    $("bars").innerHTML = d.benchmarks.map(([n, v], i) => `<div class="hb ${i === d.benchmarks.length - 1 ? "me" : ""}"><span>${esc(n)}</span><span><i style="width:${v}%"></i></span><span>${v.toFixed(2)}</span></div>`).join("");
    $("road").innerHTML = '<tr><th>Stage</th><th>Status</th></tr>' + d.roadmap.map(r => `<tr><td>${esc(r.stage)}</td><td><span class="st ${r.status}">${r.status}</span></td></tr>`).join("");
    $("people").innerHTML = d.team.map(t => `<span>${t.name ? esc(t.name) + " · " : ""}${esc(t.roll)}</span>`).join("");
  } catch (e) { $("engine").innerHTML = `<span class="err">${esc(e.message)}</span>`; }
  one($("txt").value);
})();
