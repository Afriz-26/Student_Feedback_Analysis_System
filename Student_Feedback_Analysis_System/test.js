const { analyse } = require("./netlify/functions/lib/engine");
const cases = [["The course material was good, but the teacher's knowledge was not enough.", "Negative"], ["It was organized very badly", "Negative"], ["The labs are well equipped and the staff are very helpful.", "Positive"], ["The lectures were not good", "Negative"], ["Excellent lectures are delivered by teachers", "Positive"]];
let bad = 0; cases.forEach(([t, e]) => { const l = analyse(t).label; if (l !== e) { bad++; console.log("FAIL", t, l); } });
const mixed = analyse(cases[0][0]);
if (!mixed.aspects.includes("Teaching")) { bad++; console.log("FAIL possessive topic detection", mixed.aspects); }
if (!mixed.words.some(w => w.word === "not" && w.value < 0)) { bad++; console.log("FAIL negation highlighting", mixed.words); }
console.log(bad ? bad + " failed" : "all engine tests passed"); process.exit(bad ? 1 : 0);
