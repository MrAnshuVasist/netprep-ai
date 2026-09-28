import http from "node:http";
import { YoutubeTranscript } from "youtube-transcript";

const PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NETPrep AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Literata:wght@500;700&family=Hanken+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#1c2452;--paper:#f6f7fb;--card:#fff;--line:#d9dcea;--mark:#f0ae16;--ok:#1f8a54;--bad:#c23a3a;--mut:#5b6280}
@media(prefers-color-scheme:dark){:root{--ink:#e8ebff;--paper:#12152b;--card:#1b2040;--line:#2f365f;--mut:#9aa2c8}}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 "Hanken Grotesk",system-ui,sans-serif}
h1,h2,h3{font-family:Literata,Georgia,serif;line-height:1.2;margin:0 0 .5em}
main{max-width:820px;margin:0 auto;padding:28px 18px 60px}
.brand{font:700 20px Literata,serif;padding:18px;text-align:center}.brand b{background:var(--mark);color:#1c2452;padding:0 6px;border-radius:4px}
.hero{padding:40px 0 10px;text-align:center}.hero h1{font-size:clamp(28px,5vw,44px)}.hero p{color:var(--mut);max-width:560px;margin:0 auto 24px}
input{width:100%;padding:14px;font:inherit;border:2px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)}
input:focus,button:focus-visible,label:focus-within{outline:3px solid var(--mark);outline-offset:2px}
button{font:700 15px inherit;font-family:inherit;padding:12px 20px;border-radius:10px;border:2px solid var(--ink);background:var(--card);color:var(--ink);cursor:pointer}
button.pri{background:var(--ink);color:var(--paper)}button.pri.big{width:100%;margin-top:12px;padding:15px}button:disabled{opacity:.4;cursor:default}
.ticks{list-style:none;padding:0;margin:26px 0;display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:center;color:var(--mut)}.ticks li:before{content:"✓ ";color:var(--ok);font-weight:700}
.err{color:var(--bad);margin-top:12px;font-weight:500}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin:16px 0}
.row{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.hide{display:none!important}
.notes h3{font-size:15px;margin:14px 0 4px;border-bottom:2px solid var(--mark);display:inline-block}.notes ul{margin:0;padding-left:20px}.notes li{margin:2px 0}
.opt{display:flex;gap:10px;align-items:flex-start;padding:12px;border:2px solid var(--line);border-radius:10px;margin:8px 0;cursor:pointer}
.opt.sel{border-color:var(--ink);background:color-mix(in srgb,var(--mark) 25%,transparent)}
.bar{height:8px;background:var(--line);border-radius:4px;overflow:hidden}.bar i{display:block;height:100%;background:var(--mark);transition:width .25s}
.score{font:700 56px Literata,serif}.tag{font-size:13px;color:var(--mut)}.opt.right{border-color:var(--ok)}.opt.wrong{border-color:var(--bad)}
.qnav{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.qnav button{padding:4px 10px;font-size:13px}.qnav .ans{background:var(--mark);color:#1c2452}.qnav .rev{border-color:var(--bad)}
.spin{text-align:center;padding:60px 0;color:var(--mut)}
@media print{body{background:#fff;color:#000;font-size:10px;line-height:1.3}.brand,.row,.noprint,#home,#quiz,#result{display:none!important}
#notesPage{display:block!important}.card{border:0;padding:0;margin:0}.notes{columns:2;column-gap:16px}.notes h3{break-after:avoid}.notes section{break-inside:avoid}@page{size:A4;margin:10mm}}
</style></head><body>
<div class="brand">NET<b>Prep</b> AI</div>
<main>
<section id="home">
 <div class="hero"><h1>UGC NET AI Study Assistant</h1><p>Turn any UGC NET YouTube class into one-page revision notes and UGC NET-level practice questions.</p></div>
 <label for="url" class="tag">Paste your UGC NET YouTube Class Link</label>
 <input id="url" placeholder="https://youtube.com/watch?v=................" autocomplete="off">
 <details style="margin-top:10px"><summary class="tag" style="cursor:pointer">Captions not working? Paste the transcript instead</summary>
 <p class="tag">On YouTube: open the video, click ...more under the description, then Show transcript. Select all, copy, and paste it here.</p>
 <textarea id="tr" rows="6" style="width:100%;padding:12px;font:inherit;border:2px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink)"></textarea></details>
 <button class="pri big" id="go">Generate UGC NET Study Material</button>
 <div class="err" id="err" role="alert"></div>
 <ul class="ticks"><li>UGC NET Level Questions</li><li>Based on Your Video</li><li>One-Page Revision Notes</li><li>Instant Quiz</li><li>Detailed Explanations</li><li>Download PDF</li></ul>
</section>
<div id="load" class="spin hide">Reading the lecture and building your notes and questions. This takes about a minute.</div>

<section id="notesPage" class="hide">
 <div class="card notes" id="notes"></div>
 <div class="row noprint"><button class="pri" onclick="window.print()">Download One-Page PDF</button><button id="dlNotes">Download Notes</button><button onclick="window.print()">Print</button><button class="pri" id="startQuiz">Start practice test</button></div>
</section>

<section id="quiz" class="hide">
 <h2>Your UGC NET Practice Test</h2><div class="tag" id="qmeta"></div>
 <div class="bar" role="progressbar"><i id="prog"></i></div><div class="qnav" id="qnav"></div>
 <div class="card"><div class="tag" id="qcount"></div><p id="qtext" style="white-space:pre-line;font-weight:500"></p><div id="opts"></div></div>
 <div class="row"><button id="prev">Previous</button><button id="next">Next</button><button id="clear">Clear response</button><button id="mark">Mark for review</button><button class="pri" id="submit">Submit test</button></div>
</section>

<section id="result" class="hide"></section>
</main>
<script>
const $=s=>document.querySelector(s),esc=t=>String(t??"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
let D,ans=[],rev=[],cur=0;
const L=["A","B","C","D"];
function show(id){["home","load","notesPage","quiz","result"].forEach(x=>$("#"+x).classList.toggle("hide",x!==id))}
$("#go").onclick=async()=>{
 $("#err").textContent="";show("load");console.log("[NETPrep] Generate clicked. url:",$("#url").value,"| pasted chars:",$("#tr").value.length);
 try{const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:$("#url").value,transcript:$("#tr").value})});
  const j=await r.json();console.log("[NETPrep] Server response status:",r.status,j);if(!r.ok)throw new Error(j.error);D=j;renderNotes();show("notesPage")}
 catch(e){console.error("[NETPrep] Client error:",e);show("home");$("#err").textContent=e.message;if(/Transcript unavailable/.test(e.message))document.querySelector("details").open=true}
};
const SEC=[["core_concepts","Core Concepts"],["definitions","Important Definitions"],["scholars","Thinkers / Scholars"],["theories","Theories / Concepts"],["important_facts","Important Facts"],["comparisons","Comparisons"],["important_statements","Important Statements"],["exam_traps","Exam Traps"],["memory_tricks","Memory Tricks"],["quick_revision","UGC NET Quick Revision"]];
function renderNotes(){
 const n=D.notes||{};
 $("#notes").innerHTML=\`<h2 style="column-span:all">\${esc(D.topic||D.video.title)}</h2><div class="tag" style="column-span:all">\${esc(D.video.title)}\${D.video.channel?" · "+esc(D.video.channel):""}</div>\`+
 SEC.filter(([k])=>(n[k]||[]).length).map(([k,t])=>\`<section><h3>\${t}</h3><ul>\${n[k].map(x=>\`<li>\${esc(x)}</li>\`).join("")}</ul></section>\`).join("")+
 \`<section style="column-span:all"><h3>Remember These 5 Things</h3><ol>\${(D.remember_5||[]).map(x=>\`<li>\${esc(x)}</li>\`).join("")}</ol></section>\`;
}
$("#dlNotes").onclick=()=>{
 const n=D.notes||{};let t=\`# \${D.topic}\\n\${D.video.title}\\n\\n\`;
 SEC.forEach(([k,h])=>{if((n[k]||[]).length)t+=\`## \${h}\\n\`+n[k].map(x=>"- "+x).join("\\n")+"\\n\\n"});
 t+="## Remember These 5 Things\\n"+(D.remember_5||[]).map((x,i)=>\`\${i+1}. \${x}\`).join("\\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/markdown"}));a.download="ugc-net-notes.md";a.click();
};
$("#startQuiz").onclick=()=>{ans=Array(D.questions.length).fill(null);rev=ans.map(()=>false);cur=0;
 $("#qmeta").textContent=\`Questions: \${D.questions.length} · Difficulty: Mixed · Source: This YouTube Class\`;show("quiz");drawQ()};
function drawQ(){
 const q=D.questions[cur],N=D.questions.length;
 $("#qcount").textContent=\`Question \${cur+1} / \${N} · \${q.difficulty}\`;$("#qtext").textContent=q.question;
 $("#prog").style.width=(ans.filter(a=>a!==null).length/N*100)+"%";
 $("#opts").innerHTML=q.options.map((o,i)=>\`<label class="opt \${ans[cur]===i?"sel":""}"><input type="radio" name="o" style="width:auto" \${ans[cur]===i?"checked":""} onchange="ans[cur]=\${i};drawQ()"><span><b>\${L[i]}.</b> \${esc(o)}</span></label>\`).join("");
 $("#qnav").innerHTML=D.questions.map((_,i)=>\`<button class="\${ans[i]!==null?"ans":""} \${rev[i]?"rev":""}" onclick="cur=\${i};drawQ()">\${i+1}</button>\`).join("");
 $("#prev").disabled=cur===0;$("#next").disabled=cur===N-1;$("#mark").textContent=rev[cur]?"Unmark review":"Mark for review";
}
$("#prev").onclick=()=>{cur--;drawQ()};$("#next").onclick=()=>{cur++;drawQ()};
$("#clear").onclick=()=>{ans[cur]=null;drawQ()};$("#mark").onclick=()=>{rev[cur]=!rev[cur];drawQ()};
$("#submit").onclick=()=>{
 const un=ans.filter(a=>a===null).length;
 if(un&&!confirm(\`\${un} question(s) unanswered. Submit anyway?\`))return;
 const Q=D.questions,ok=Q.map((q,i)=>ans[i]===q.correct_answer),c=ok.filter(Boolean).length,N=Q.length;
 const cat={};Q.forEach((q,i)=>{const k=q.category||"Conceptual";(cat[k]??=[0,0]);cat[k][1]++;if(ok[i])cat[k][0]++});
 $("#result").innerHTML=\`<div class="card" style="text-align:center"><div class="tag">UGC NET PRACTICE RESULT</div><div class="score">\${c} / \${N}</div><div>\${Math.round(c/N*100)}%</div><div class="tag">Correct: \${c} · Incorrect: \${N-c}</div></div>
 <h3>Performance</h3><div class="card">\${Object.entries(cat).map(([k,[a,b]])=>\`<div style="display:flex;justify-content:space-between"><span>\${esc(k)}</span><b>\${Math.round(a/b*100)}%</b></div><div class="bar" style="margin:4px 0 10px"><i style="width:\${a/b*100}%"></i></div>\`).join("")}</div>
 <h3>Review</h3>\`+Q.map((q,i)=>\`<div class="card"><div class="tag">Q\${i+1} · \${esc(q.difficulty)} · \${esc(q.concept_tested)}</div><p style="white-space:pre-line;font-weight:500">\${esc(q.question)}</p>
 \${q.options.map((o,j)=>\`<div class="opt \${j===q.correct_answer?"right":j===ans[i]?"wrong":""}"><span><b>\${L[j]}.</b> \${esc(o)} \${j===q.correct_answer?"✓ Correct answer":""}\${j===ans[i]&&j!==q.correct_answer?"✗ Your answer":""}</span></div>\`).join("")}
 \${ans[i]===null?'<div class="tag">Not attempted</div>':""}<p><b>Explanation:</b> \${esc(q.explanation)}</p><div class="tag">AI-generated from this video at UGC NET level. Not an official PYQ.</div></div>\`).join("")+
 \`<div class="row"><button class="pri" onclick="show('notesPage')">Back to notes</button><button onclick="location.reload()">New video</button></div>\`;
 show("result");scrollTo(0,0);
};
</script></body></html>
`;

const SYSTEM_PROMPT = `You are an expert UGC NET examination preparation AI.

You will receive the transcript of ONE specific UGC NET lecture from YouTube.
Identify the concepts actually taught in it.

CONTENT SOURCE: Use ONLY the concepts, facts, theories, terminology, examples and relationships discussed in this lecture.
QUESTION STANDARD: Every question must be at UGC NET examination level and style.
VIDEO CONTENT determines WHAT the question is about. UGC NET STANDARD determines HOW it is asked.

Rules:
- No elementary questions (e.g. "Who was X?") unless genuinely UGC NET relevant.
- Prefer conceptual, statement-based (1,2,3,4 with "1 and 2 only" style options), assertion-reason, match-the-following, application, comparative and (only if the lecture supports it) chronology questions.
- Do not introduce topics not discussed in the lecture. Do not invent facts.
- Do not create fake previous-year questions. Label every question type "AI_VIDEO_BASED_UGC_NET".
- Generate exactly 10 questions: about 2 Easy, 5 Moderate, 3 Difficult. difficulty must be "Easy", "Moderate" or "Difficult".
- Exactly 4 options per question, WITHOUT "A." prefixes. correct_answer must be the 0-based index (0-3) of the correct option, as a number.
- explanation: why the correct option is right, why the others are wrong, and which lecture concept is tested.
- category: one of "Conceptual", "Statement", "Application" (used for the performance breakdown).
- Notes must be concise (fit one A4 page); prioritise. Each notes array holds short strings.
Return ONLY JSON in this shape:
{"topic":"","notes":{"core_concepts":[],"definitions":[],"scholars":[],"theories":[],"important_facts":[],"comparisons":[],"important_statements":[],"exam_traps":[],"memory_tricks":[],"quick_revision":[]},"remember_5":[],"questions":[{"type":"AI_VIDEO_BASED_UGC_NET","difficulty":"","category":"","question_type":"","question":"","options":["","","",""],"correct_answer":0,"explanation":"","concept_tested":""}]}`;

function videoId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1, 12);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

async function generate(reqBody, res) {
  const t0 = Date.now();
  const log = (...a) => console.log(`[NETPrep +${Date.now() - t0}ms]`, ...a);
  const send = (code, obj) => { log("Sending response, status:", code, obj.error ? "error: " + obj.error : "OK"); res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

  log("1. Request received. url:", reqBody?.url, "| pasted transcript chars:", String(reqBody?.transcript || "").length);
  log("2. Env check. OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY, "| model:", process.env.OPENAI_MODEL || "gpt-4o (default)", "| node:", process.version);

  const id = videoId(reqBody?.url || "");
  log("3. Extracted video id:", id);
  const pasted = String(reqBody?.transcript || "").replace(/\s+/g, " ").trim();
  if (!id && pasted.length < 300) return send(400, { error: "Please paste a valid YouTube link." });

  let text = pasted;
  if (pasted.length >= 300) {
    log("4. Using pasted transcript, chars:", pasted.length);
  } else {
    try {
      log("4. Fetching YouTube transcript for", id);
      const parts = await YoutubeTranscript.fetchTranscript(id);
      log("5. Transcript fetched. segments:", parts?.length, "| first segment:", JSON.stringify(parts?.[0]));
      text = parts.map((p) => p.text).join(" ").replace(/\s+/g, " ");
      log("6. Transcript joined. chars:", text.length);
      if (text.length < 300) throw new Error("Transcript too short: " + text.length + " chars");
    } catch (e) {
      log("TRANSCRIPT FAILED. name:", e.name, "| message:", e.message);
      log("TRANSCRIPT STACK:", e.stack);
      return send(422, {
        needPaste: true,
        error: "Transcript unavailable for this video. Please try another UGC NET class with captions.",
      });
    }
  }

  let video = { title: "", video_id: id || "", channel: "" };
  if (id) try {
    log("7. Fetching oEmbed title");
    const o = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    log("8. oEmbed status:", o.status);
    if (o.ok) { const j = await o.json(); video.title = j.title; video.channel = j.author_name; log("9. Title:", video.title, "| channel:", video.channel); }
  } catch (e) { log("oEmbed failed (non-fatal):", e.message); }

  try {
    log("10. Calling OpenAI. transcript chars sent:", Math.min(text.length, 90000));
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Lecture title: ${video.title}\n\nTranscript:\n${text.slice(0, 90000)}` },
        ],
      }),
    });
    log("11. OpenAI HTTP status:", r.status);
    const j = await r.json();
    if (!r.ok) { log("OPENAI ERROR BODY:", JSON.stringify(j)); throw new Error(j.error?.message || "OpenAI error"); }
    log("12. OpenAI usage:", JSON.stringify(j.usage), "| finish_reason:", j.choices?.[0]?.finish_reason);
    const data = JSON.parse(j.choices[0].message.content);
    log("13. JSON parsed. questions from model:", data.questions?.length, "| topic:", data.topic);
    data.questions = (data.questions || []).filter(
      (q) => q.options?.length === 4 && Number.isInteger(q.correct_answer) && q.correct_answer >= 0 && q.correct_answer < 4
    ).map((q) => ({ ...q, type: "AI_VIDEO_BASED_UGC_NET" }));
    log("14. Valid questions after filter:", data.questions.length);
    if (!data.questions.length) throw new Error("No valid questions generated");
    send(200, { video, pyqs: [], ...data }); // pyqs stays empty until a verified PYQ database is connected
  } catch (e) {
    log("GENERATION FAILED:", e.name, e.message);
    log("GENERATION STACK:", e.stack);
    send(500, { error: "Generation failed: " + e.message });
  }
}

http.createServer((req, res) => {
  console.log("[NETPrep] HTTP", req.method, req.url);
  if (req.method === "POST" && req.url === "/api/generate") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { let b = {}; try { b = JSON.parse(raw); } catch {} generate(b, res); });
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(PAGE);
  }
}).listen(process.env.PORT || 3000, () => console.log("NETPrep AI running on http://localhost:" + (process.env.PORT || 3000)));
