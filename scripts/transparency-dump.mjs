import { createHmac, createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SALT = process.env.DUMP_SALT;
if (!BASE || !KEY || !SALT) throw new Error("missing env");

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const alias = (id) =>
  createHmac("sha256", SALT).update(String(id)).digest("hex").slice(0, 16);

async function fetchAll(path) {
  const rows = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const r = await fetch(`${BASE}/rest/v1/${path}`, {
      headers: { ...headers, Range: `${from}-${from + page - 1}` },
    });
    if (!r.ok) throw new Error(`${path} -> ${r.status}`);
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < page) break;
  }
  return rows;
}

const day = new Date().toISOString().slice(0, 10);
const dir = `transparency/${day}`;
mkdirSync(dir, { recursive: true });

const questions = await fetchAll(
  "questions?select=id,slug,tier,status,text_en,text_ko,option_a_en,option_b_en,created_at&order=id.asc"
);
const answersRaw = await fetchAll(
  "answers?select=id,user_id,question_id,choice,verification_tier,country_code,created_at&order=id.asc"
);
const answers = answersRaw.map((a) => ({
  id: a.id,
  person: alias(a.user_id),
  question_id: a.question_id,
  choice: a.choice,
  verification_tier: a.verification_tier,
  country_code: a.country_code,
  created_at: a.created_at,
}));
const predictionsRaw = await fetchAll(
  "predictions?select=id,user_id,question_id,predicted_pct_a,created_at&order=id.asc"
);
const predictions = predictionsRaw.map((p) => ({
  id: p.id,
  person: alias(p.user_id),
  question_id: p.question_id,
  predicted_pct_a: p.predicted_pct_a,
  created_at: p.created_at,
}));
const comments = await fetchAll(
  "comments?select=id,question_id,body,country_code,created_at&status=eq.visible&order=id.asc"
);

const files = { questions, answers, predictions, comments };
const manifest = { date: day, generated_at: new Date().toISOString(), files: {} };
for (const [name, data] of Object.entries(files)) {
  const body = JSON.stringify(data, null, 1);
  writeFileSync(`${dir}/${name}.json`, body);
  manifest.files[`${name}.json`] = {
    rows: data.length,
    sha256: createHash("sha256").update(body).digest("hex"),
  };
}
manifest.root_sha256 = createHash("sha256")
  .update(JSON.stringify(manifest.files))
  .digest("hex");
writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest, null, 1));
console.log(`dumped ${day}`, manifest.root_sha256);
