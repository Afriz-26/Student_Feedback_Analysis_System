const { analyse, batch } = require("./lib/engine");
const H = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const out = (code, body) => ({ statusCode: code, headers: H, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return out(204, {});
  if (event.httpMethod !== "POST") return out(405, { error: "Use POST with JSON: { text } or { comments: [] }" });
  let data;
  try { data = JSON.parse(event.body || "{}"); } catch { return out(400, { error: "Request body is not valid JSON." }); }
  if (typeof data.text === "string") {
    const t = data.text.trim();
    if (t.length < 3) return out(400, { error: "Write a comment of at least 3 characters." });
    if (t.length > 1000) return out(400, { error: "Comment is too long (limit 1000 characters)." });
    return out(200, { result: analyse(t) });
  }
  if (Array.isArray(data.comments)) {
    const list = data.comments.map(c => String(c).trim()).filter(c => c.length >= 3).map(c => c.slice(0, 1000));
    if (!list.length) return out(400, { error: "No usable comments found." });
    if (list.length > 2000) return out(400, { error: "Too many comments (limit 2000 per request)." });
    return out(200, batch(list));
  }
  return out(400, { error: "Send { text: string } or { comments: string[] }." });
};
