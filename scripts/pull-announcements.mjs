/**
 * Pulls the latest public Patreon posts into src/announcements.json.
 *
 * Usage: npm run announcements:pull
 * Then review the diff, PR, and merge — announcements ship as source code.
 *
 * Credentials live in .env.local (gitignored). On a 401 this script
 * refreshes the token pair and REWRITES .env.local itself — no manual
 * token maintenance.
 *
 * ONE RULE: only run this from one machine. Patreon rotates the refresh
 * token on every refresh, so a second machine's refresh strands this one.
 * Setting up a new machine = paste a fresh pair from
 * https://www.patreon.com/portal/registration/register-clients
 * (and stop running the script on the old machine).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env.local");
const OUTPUT_PATH = join(ROOT, "src", "announcements.json");

const API = "https://www.patreon.com/api/oauth2/v2";
const TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const MAX_ANNOUNCEMENTS = 5;
const EXCERPT_LENGTH = 220;

const REQUIRED_KEYS = [
  "PATREON_ACCESS_TOKEN",
  "PATREON_REFRESH_TOKEN",
  "PATREON_CLIENT_ID",
  "PATREON_CLIENT_SECRET",
];

const fail = (message) => {
  console.error(`\n[announcements:pull] ${message}\n`);
  process.exit(1);
};

const readEnv = () => {
  let raw;
  try {
    raw = readFileSync(ENV_PATH, "utf8");
  } catch {
    fail(
      `Could not read ${ENV_PATH}.\n` +
        `Create it with the values from your Patreon OAuth client\n` +
        `(see .env.local.example).`,
    );
  }
  const env = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    fail(`Missing in .env.local: ${missing.join(", ")}`);
  }
  return env;
};

const writeEnvTokens = (accessToken, refreshToken) => {
  const raw = readFileSync(ENV_PATH, "utf8");
  const replaced = raw
    .split("\n")
    .map((line) => {
      if (line.startsWith("PATREON_ACCESS_TOKEN=")) {
        return `PATREON_ACCESS_TOKEN=${accessToken}`;
      }
      if (refreshToken && line.startsWith("PATREON_REFRESH_TOKEN=")) {
        return `PATREON_REFRESH_TOKEN=${refreshToken}`;
      }
      return line;
    })
    .join("\n");
  writeFileSync(ENV_PATH, replaced);
};

const refreshTokens = async (env) => {
  console.log("[announcements:pull] Access token expired — refreshing…");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: env.PATREON_REFRESH_TOKEN,
    client_id: env.PATREON_CLIENT_ID,
    client_secret: env.PATREON_CLIENT_SECRET,
  });
  const response = await fetch(TOKEN_URL, { method: "POST", body });
  if (!response.ok) {
    fail(
      `Token refresh failed (HTTP ${response.status}).\n` +
        `The stored pair is likely stranded (did the script run on another\n` +
        `machine?). Paste a fresh access + refresh token from the Patreon\n` +
        `developer portal into .env.local and rerun.`,
    );
  }
  const tokens = await response.json();
  env.PATREON_ACCESS_TOKEN = tokens.access_token;
  // Per OAuth spec a new refresh token is optional; keep the old one if absent
  if (tokens.refresh_token) env.PATREON_REFRESH_TOKEN = tokens.refresh_token;
  // Persist immediately — losing the rotated pair strands the credentials
  writeEnvTokens(tokens.access_token, tokens.refresh_token);
  console.log("[announcements:pull] New token pair saved to .env.local");
};

/** GET a Patreon API url, refreshing the token pair once on a 401. */
const patreonGet = async (env, url, hasRetried = false) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.PATREON_ACCESS_TOKEN}` },
  });
  if (response.status === 401 && !hasRetried) {
    await refreshTokens(env);
    return patreonGet(env, url, true);
  }
  if (!response.ok) {
    fail(`Patreon API error: HTTP ${response.status} for ${url}`);
  }
  return response.json();
};

/** The posts API returns relative urls like "/Name/posts/slug-123". */
const toAbsoluteUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://www.patreon.com${url}`;
};

const toExcerpt = (html) => {
  if (!html) return "";
  const text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, "")}…`;
};

const main = async () => {
  const env = readEnv();

  const campaigns = await patreonGet(env, `${API}/campaigns`);
  const campaignId = campaigns.data?.[0]?.id;
  if (!campaignId) fail("No campaign found for this Patreon account.");

  const fields = encodeURIComponent("fields[post]");
  const postFields = "title,content,url,published_at,is_public";
  const posts = await patreonGet(
    env,
    `${API}/campaigns/${campaignId}/posts?${fields}=${postFields}`,
  );

  const announcements = (posts.data ?? [])
    .filter((post) => post.attributes.is_public && post.attributes.published_at)
    .sort((a, b) =>
      b.attributes.published_at.localeCompare(a.attributes.published_at),
    )
    .slice(0, MAX_ANNOUNCEMENTS)
    .map((post) => ({
      id: post.id,
      date: post.attributes.published_at,
      title: post.attributes.title ?? "",
      excerpt: toExcerpt(post.attributes.content),
      url: toAbsoluteUrl(post.attributes.url),
    }));

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(announcements, null, 2)}\n`);
  console.log(
    `[announcements:pull] Wrote ${announcements.length} announcement(s) to src/announcements.json`,
  );
  console.log("[announcements:pull] Review the diff, then PR + merge to ship.");
};

main();
