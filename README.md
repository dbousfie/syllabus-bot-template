Syllabus Bot Template
A modular, copyable bot for answering course or assignment-related questions using OpenAI. Designed to embed into Brightspace and optionally log responses to Qualtrics.

What It Does

* Accepts free-text questions 
* Uses OpenAI to generate responses based on syllabus.txt
* Optionally logs responses to a Qualtrics survey
* Can be embedded in Brightspace or hosted via GitHub Pages

How to Use

1. Create Your Own Copy

* Go to [https://github.com/dbousfie/syllabus-bot-template]
* Click **Use this template**
* Name your new repo (e.g., `syllabus-bot-3210`, `paragraph-marker`)

2. Replace the Syllabus Content

* Open `syllabus.txt`
* Replace its contents with your course material or grading criteria
* This file is sent with every query to provide context to the AI

3. Deploy Backend to Deno

* Go to [https://dash.deno.com] and sign up or log in using your GitHub account. This is required so Deno can access your repository and deploy from it directly.
* Click **+ New Project** → **Import from GitHub**
* Select your new repo
* Set **entry point** to: `main.ts`
* Name the project (this determines the public URL)
* Set **production branch** to: `main`
* Click **Create Project**

4. Add Environment Variables
   In the Deno project Settings → Environment Variables, add:

```
OPENAI_API_KEY         = your OpenAI API key
SYLLABUS_LINK          = a public link to the syllabus or course webpage
QUALTRICS_API_TOKEN    = (optional)
QUALTRICS_SURVEY_ID    = (optional)
QUALTRICS_DATACENTER   = (optional, e.g., uwo.eu)
```

These values are used by the backend to query OpenAI and optionally log responses.

5. Update the Frontend (index.html)
   Open `index.html` and update this line:

```js
fetch("https://your-bot-name.deno.dev/", {
```

Replace the placeholder with the URL from your deployed Deno backend (e.g., `https://paragraph-marker.deno.dev/`).

This is the only required change to link your frontend to your backend.

6. Deploy GitHub Pages (Frontend Hosting)

* Go to your new GitHub repo → **Settings → Pages**
* Set **Branch** to `main`, **Folder** to `/ (root)`
* Click **Save**
* GitHub will display a live URL: `https://yourusername.github.io/yourbot/`

7. (Optional) Use brightspace.html for LMS Embedding

* Copy `brightspace.html` into Brightspace as an HTML content item or widget
* You can also style it using Brightspace's Lato font or CSS styles

Notes

* Brightspace loads bots in an iframe — CORS headers are handled automatically
* Each deployed bot has its own backend; the fetch URL must match

Qualtrics Logging Setup (Optional)
If using Qualtrics, make sure your survey contains embedded data fields:

```
responseText
queryText
```

These will be populated by the bot. Responses will include a hidden HTML comment like:
`<!-- Qualtrics status: 200 -->`

Files in This Repo

* `index.html` - Main public interface
* `brightspace.html` - LMS-friendly iframe wrapper
* `main.ts` - Backend Deno script
* `syllabus.txt` - Syllabus or grading criteria context
* `README.md` - This file

License
© Dan Bousfield. Licensed under Creative Commons Attribution 4.0
[https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)
