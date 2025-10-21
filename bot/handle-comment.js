import { request } from "undici";
import crypto from "node:crypto";
import { analyzeFile } from "./analyze-file.js";
import { makeReply } from "./lib/formatReply.js";

const GH_EVENT_PATH = process.env.GITHUB_EVENT_PATH;
const GH_TOKEN = process.env.GITHUB_TOKEN;

if (!GH_EVENT_PATH || !GH_TOKEN) {
  console.error("Missing required env: GITHUB_EVENT_PATH or GITHUB_TOKEN");
  process.exit(1);
}

const event = JSON.parse(await (await import("node:fs/promises")).readFile(GH_EVENT_PATH, "utf8"));

const isIssueEvent = !!event.issue && !event.comment;
const isCommentEvent = !!event.comment;

if (!isIssueEvent && !isCommentEvent) {
  console.log("Not an issue/comment event; skipping.");
  process.exit(0);
}

const repo = event.repository.full_name;
const [owner, repoName] = repo.split("/");
const issueNumber = (event.issue || event).number;

const body = (event.comment?.body || event.issue?.body || "").trim();

// Try to find an attachment URL from GitHub's uploaded asset markdown or any URL pasted.
const attachmentRegex = /(https?:\/\/[^\s)]+\.pdf|https?:\/\/user-images\.githubusercontent\.com\/[^\s)]+)/ig;
const urls = [...new Set(Array.from(body.matchAll(attachmentRegex)).map(m => m[1]))];

if (urls.length === 0) {
  // Nothing to parse; if user typed a slash command, you could process here.
  console.log("No attachment URLs found.");
  process.exit(0);
}

// For this event, process the first file URL (you can extend to multi-file).
const fileUrl = urls[0];

let fileBuf;
try {
  const { body: stream } = await request(fileUrl);
  fileBuf = Buffer.from(await stream.arrayBuffer());
} catch (e) {
  await postComment(owner, repoName, issueNumber, `Couldn't download the file. Error: ${e.message}`);
  process.exit(0);
}

// Compute SHA-512
const sha512 = crypto.createHash("sha512").update(fileBuf).digest("hex");
const shaShort = sha512.slice(0, 16);

// Analyze (PDF text/metadata if PDF, otherwise just classification by magic bytes + filename)
const analysis = await analyzeFile(fileBuf, { filenameGuess: guessNameFromUrl(fileUrl) });

// Build the "listening-first" reply + opinionated summary
const reply = makeReply({
  filename: analysis.filename || guessNameFromUrl(fileUrl),
  sizeHuman: humanSize(fileBuf.length),
  sha512,
  shaShort,
  analysis
});

// Post
await postComment(owner, repoName, issueNumber, reply);

async function postComment(owner, repo, issue_number, body) {
  const res = await request(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${GH_TOKEN}`,
      "accept": "application/vnd.github+json",
      "content-type": "application/json"
    },
    body: JSON.stringify({ body })
  });

  if (res.statusCode >= 300) {
    const text = await res.body.text();
    console.error("Failed to post comment:", res.statusCode, text);
  }
}

function humanSize(bytes) {
  const units = ["B","KB","MB","GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length-1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}
function guessNameFromUrl(u) {
  try {
    const p = new URL(u).pathname;
    return decodeURIComponent(p.split("/").pop() || "uploaded-file");
  } catch { return "uploaded-file"; }
}
