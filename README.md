# Syllabus Bot

Minimal open-source bot that answers course/assignment questions using OpenAI with `syllabus.md` as context. Runs on Cloudflare Workers with a static frontend on GitHub Pages. Embeds in Brightspace. Logs every query, response, and student feedback rating to Qualtrics for quality control.

## How it works

Three pieces, in two places:

- **Frontend** (`index.html`) — hosted on GitHub Pages. Students see a web page, type a question, click submit, get an answer, and rate it 👍 or 👎.
- **Backend** (`worker.js`) — runs on Cloudflare Workers. Receives each request, fetches `syllabus.md` from this GitHub repo at runtime, sends it to OpenAI with the question, returns the answer, and logs to Qualtrics.
- **Content** (`syllabus.md`) — lives in this repo. The worker fetches a fresh copy on every request, so editing `syllabus.md` and committing immediately updates what the bot knows. No redeploy needed.

**Where `worker.js` actually runs:** the running copy is stored in Cloudflare, not in this repo. The copy in this repo is your backup and template. When you change `worker.js`, the change that takes effect is the one you paste into Cloudflare's editor — that's what actually changes the running bot. Committing the same change to GitHub is just so you have a backup.

For `syllabus.md` the opposite is true: editing it in GitHub *is* what changes behavior, because that's where the worker reads it from at runtime.

## Setup

### 1. Create your repo
Use this template on GitHub. Name it after your course (e.g., `syllabus-bot-3210`).

### 2. Edit `syllabus.md`
Replace the contents with your course policies, grading criteria, deadlines, readings — anything you want the bot to know. Whatever's in this file gets sent to OpenAI as context with every question.

### 3. Deploy the worker

Sign up free at https://dash.cloudflare.com — no credit card required.

1. In the dashboard: **Compute (Workers)** → **Create** → **Start with Hello World!**
2. Name your worker (e.g., `3210bot`). The name becomes part of your URL: `<name>.<your-subdomain>.workers.dev`.
3. After it deploys, click **Edit code** (top right).
4. **Clear the editor first.** Click in the code area, Ctrl+A (or Cmd+A on Mac), Delete. The editor must be completely empty before pasting — pasting over selected code can result in everything being commented out, leaving the worker stuck on Hello World.
5. Open `worker.js` from this repo, copy all of it, paste into the empty editor.
6. Click **Deploy** (top right, blue button).

To verify the deploy: visit `https://<your-name>.<your-subdomain>.workers.dev` in a browser. You should see "Method Not Allowed" — that's correct (the worker only accepts POST requests). If you see "Hello World!" instead, the paste didn't take; redo from step 4.

### 4. Set environment variables

In the worker's page → **Settings** tab → scroll to **Variables and Secrets** → **+ Add** for each:

| Name | Type | Required | Value |
|---|---|---|---|
| `OPENAI_API_KEY` | Secret | yes | Your OpenAI API key (`sk-...`) |
| `SYLLABUS_URL` | Text | yes | Raw GitHub URL of this repo's `syllabus.md` |
| `COURSE_PAGE_URL` | Text | yes | Public course web page; appears at the bottom of every response |
| `QUALTRICS_API_TOKEN` | Secret | for logging | |
| `QUALTRICS_SURVEY_ID` | Text | for logging | starts with `SV_` |
| `QUALTRICS_DATACENTER` | Text | for logging | e.g., `uwo.eu` |
| `OPENAI_MODEL` | Text | optional | Defaults to `gpt-4o-mini` |

For `SYLLABUS_URL`, the easiest way to get the right value: open `syllabus.md` in your repo on GitHub, click the **Raw** button, copy the URL from your browser's address bar. Format looks like:
```
https://raw.githubusercontent.com/<username>/<repo>/main/syllabus.md
```
Test it by pasting into a browser tab — you should see your syllabus text. If you get 404, the username, repo name, or branch is wrong.

**Why Secret vs Text:** Secret values are encrypted in the dashboard and hidden after saving (you can replace them but never view them again). Text values stay visible. Use Secret for anything sensitive — API keys, tokens.

### 5. Configure Qualtrics (for logging and feedback)

In your Qualtrics survey, add three embedded data fields with these exact names:
- `queryText`
- `responseText`
- `feedback`

Each question creates one Qualtrics row (with `feedback` empty). Each thumbs-click creates a second row with the same query/response and a `feedback` value of either `helpful` or `not_helpful`. To find responses students flagged as bad, filter for `feedback = not_helpful`.

### 6. Point the frontend at your worker

Open `index.html` in this repo. Near the top of the `<script>` block:
```js
const WORKER_URL = "https://<your-name>.<your-subdomain>.workers.dev/";
```
Change the URL to your Cloudflare worker URL. Commit.

### 7. Publish the frontend
- Repo → **Settings** → **Pages**
- Branch: `main`, Folder: `/ (root)` → **Save**
- Wait 1–2 minutes for the first build, then visit the published URL (e.g., `https://<username>.github.io/<repo>/`)
- For Brightspace: paste `brightspace.html` as a content item or widget

## Day-to-day editing

| Change | What to do | Live immediately? |
|---|---|---|
| Edit syllabus content | Edit `syllabus.md` in GitHub, commit | Yes, on next request |
| Update the course web link | Edit `COURSE_PAGE_URL` in Cloudflare dashboard | Yes |
| Switch OpenAI model | Edit `OPENAI_MODEL` in dashboard | Yes |
| Rotate any API key | Edit the Secret in dashboard | Yes |
| Change frontend appearance/text | Edit `index.html` on GitHub | After GitHub Pages rebuilds (1–2 min) and after browser hard refresh |
| Change prompt or backend logic | Edit `worker.js` in Cloudflare's editor → click **Deploy** | After Deploy click |

GitHub Pages and browser caching can both delay seeing changes to `index.html`. After committing, give it 1–2 minutes, then hard-refresh (Ctrl+Shift+R / Cmd+Shift+R), or open in a private window.

## Reading feedback in Qualtrics

In your survey's data viewer, filter `feedback` for `not_helpful`. Each row shows the query that produced the bad response and the response text itself. Use these to:
- Identify gaps in your syllabus (the bot couldn't answer because the info wasn't there)
- Identify confusing language (students asked things you thought were covered)
- Identify outdated information (deadlines, policies you forgot to update)

## Notes

- **CORS** is handled by the worker, so iframe and cross-domain calls from Brightspace and GitHub Pages work without extra config.
- **Fetch caching is disabled** for syllabus reads (`cache: "no-store"`), so syllabus edits appear immediately. Cloudflare's default fetch caching would otherwise serve stale content — we explicitly opt out.
- **Per-bot isolation:** each bot is its own Cloudflare Worker with its own env vars. API keys can differ between bots, which lets you track costs per course.
- **Token cap:** Responses are limited to 1500 tokens. Increase `max_tokens` in `worker.js` if needed (then redeploy).
- **Free tier:** Cloudflare Workers free tier is 100,000 requests/day. No credit card required.
- **Feedback clicks are free:** thumbs-up/down submissions don't call OpenAI, so they don't cost anything beyond the negligible Qualtrics API call.

## Files
- `index.html` — public interface with feedback buttons
- `brightspace.html` — LMS iframe wrapper
- `worker.js` — Cloudflare Workers backend (running copy lives in Cloudflare; this is the backup)
- `syllabus.md` — course content used as context
- `README.md` — this file

## License
© Dan Bousfield. CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
