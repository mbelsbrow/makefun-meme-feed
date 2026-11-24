// Entry for the make.fun bounty "Post the Meme, Win the Feed"
// (u-myronera-post-the-meme-win-the-feed-2de960bf), Node 22, standard
// library only. The entry itself is an X post: a meme picture about
// make.fun, posted from a public account, tagged @_myronera, carrying one
// of the entrant's play codes. This program's only job is to hand the
// house the post's address: it copies POST.json from the repository root
// to /output/POST.json, where the gate reads it. The house then reads
// the post's likes, reposts and quotes from X. Nothing else is scored.
//
// Before copying, the program checks the file actually names a post: it
// must parse as JSON with a string `url` pointing at an x.com status.
// A placeholder or malformed address fails loudly instead of shipping a
// useless entry.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_ROOT = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const DEST_ROOT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POST_FILE = "POST.json";

function checkPostAddress(sourceRoot: string): void {
  const raw = readFileSync(join(sourceRoot, POST_FILE), "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("POST.json is not valid JSON");
  }
  const url =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>).url
      : undefined;
  if (typeof url !== "string" || !/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(url)) {
    throw new Error("POST.json must name a real X status URL");
  }
}

function deliverPost(sourceRoot: string, destRoot: string): void {
  checkPostAddress(sourceRoot);
  mkdirSync(destRoot, { recursive: true });
  try {
    copyFileSync(join(sourceRoot, POST_FILE), join(destRoot, POST_FILE));
  } catch (err) {
    console.error(`POST.json could not be copied from ${sourceRoot}: ${(err as Error).message}`);
    process.exit(1);
  }
}

deliverPost(SOURCE_ROOT, DEST_ROOT);
