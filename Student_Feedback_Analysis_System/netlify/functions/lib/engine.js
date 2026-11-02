// Rule-based sentiment engine (word lists + negation + contrast rules).
// Placeholder "model": to plug in the CNN-BiLSTM-attention model later, keep the
// same return shape from analyse() and replace its body.
const P = "good great excellent nice helpful clear interesting enjoyable organized organised well best awesome useful friendly punctual enthusiastic supportive engaging amazing fine happy easy fantastic wonderful improved qualified knowledgeable enough satisfied".split(" ");
const N = "bad poor hard unclear confusing boring late slow messy unstructured disorganized irrelevant insufficient annoying difficult worst lacking missing weak problem useless unhelpful strict rude crowded outdated badly poorly".split(" ");
const NEG = "not no never hardly barely isn't wasn't don't didn't doesn't cannot can't".split(" ");
const ASPECTS = {
  Teaching: "teacher teachers lecturer lecturers faculty professor teaching explains explained sir madam staff",
  "Course content": "course module syllabus material materials content topic topics lectures lecture project notes subject",
  Facilities: "library lab labs classroom classrooms wifi canteen campus facility facilities building room rooms",
  Assessment: "exam exams marks marking grading assignment assignments evaluation test tests grade"
};
const STOP = new Set("there their these where which would about because should could really other being have this that with from were they them what when your".split(" "));

function clauseScore(clause) {
  const w = clause.toLowerCase().match(/[a-z']+/g) || [];
  let s = 0; const words = [];
  w.forEach((t, i) => {
    let v = P.includes(t) ? 1 : N.includes(t) ? -1 : 0;
    if (t === "badly" || t === "poorly") v = -2;
    if (!v) return;
    const negator = w.slice(Math.max(0, i - 3), i).find(x => NEG.includes(x));
    if (negator) v = -v;
    s += v; words.push({ word: t, value: v > 0 ? 1 : -1 });
    if (negator) words.push({ word: negator, value: v > 0 ? 1 : -1 });
  });
  return { s, words };
}

function analyse(text) {
  const parts = String(text).split(/\b(?:but|however|although|except)\b/i);
  const sc = parts.map(clauseScore);
  let total = 0;
  sc.forEach((r, i) => { total += r.s * (i === sc.length - 1 && sc.length > 1 ? 2 : 1); });
  const lw = String(text).toLowerCase().match(/[a-z']+/g) || [];
  const aspectWords = lw.map(w => w.endsWith("'s") ? w.slice(0, -2) : w);
  const aspects = Object.keys(ASPECTS).filter(a => ASPECTS[a].split(" ").some(k => aspectWords.includes(k)));
  return {
    text: String(text),
    label: total > 0 ? "Positive" : total < 0 ? "Negative" : "Neutral",
    score: total,
    confidence: Math.round(Math.min(0.95, total === 0 ? 0.5 : 0.6 + 0.12 * Math.abs(total)) * 100),
    words: sc.flatMap(r => r.words),
    aspects, contrast: parts.length > 1
  };
}

function batch(comments) {
  const items = comments.map(analyse);
  const counts = { Positive: 0, Negative: 0, Neutral: 0 };
  const aspects = {}, freq = {};
  items.forEach(r => {
    counts[r.label]++;
    r.aspects.forEach(a => { aspects[a] = aspects[a] || { Positive: 0, Negative: 0, Neutral: 0 }; aspects[a][r.label]++; });
    (r.text.toLowerCase().match(/[a-z]{5,}/g) || []).forEach(w => { if (!STOP.has(w) && !P.includes(w) && !N.includes(w)) freq[w] = (freq[w] || 0) + 1; });
  });
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([word, count]) => ({ word, count }));
  return { total: items.length, counts, aspects, topWords, items };
}
module.exports = { analyse, batch };
