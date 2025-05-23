© Dan Bousfield, licensed under CC BY 4.0
https://creativecommons.org/licenses/by/4.0/

Syllabus Bot Template
A copyable, modular bot for answering syllabus questions using OpenAI.
Designed to embed cleanly into Brightspace, with optional Qualtrics logging.

What It Does

* Accepts free-text questions
* Uses OpenAI to generate responses from your syllabus.txt
* Optionally logs questions and responses to a Qualtrics survey
* Can be linked or embedded via iframe in Brightspace

How to Use

1. Fork This Repo
   Click Fork (top-right) on GitHub to make your own copy.

2. Replace the Syllabus
   Edit syllabus.txt with your course content.

3. Customize the Interface (Optional)

* index.html is the standalone public bot page
* brightspace.html is for embedding in Brightspace via iframe
* You can change headers, labels, or placeholders as needed

4. Deploy Backend to Deno

* Go to [https://dash.deno.com](https://dash.deno.com)
* Sign in with GitHub
* Click "Deploy from GitHub"
* Set main.ts as the entry point
* Add environment variables under "Settings" → "Environment Variables":

OPENAI\_API\_KEY = your key
QUALTRICS\_API\_TOKEN = optional
QUALTRICS\_SURVEY\_ID = optional
QUALTRICS\_DATACENTER = optional (e.g., uwo.eu)

If Qualtrics values are missing, the bot still works — it just skips logging.

**Required Setup in Qualtrics** (only if using logging):
In your Qualtrics survey:

* Go to Survey Flow
* Click Add a New Element → Embedded Data
* Add the following exact variable names:

responseText
queryText

Click Apply and Publish the survey. These fields store the user’s query and the AI response.

5. Deploy Frontend to GitHub Pages

* Go to your repo → Settings → Pages
* Set source to Branch: main, Folder: root
* Save
* Visit: [https://your-username.github.io/your-repo-name/](https://your-username.github.io/your-repo-name/)

This is your public bot URL.

Brightspace Integration
Use brightspace.html as an iframe loader.
Update its src to match your GitHub Pages link.
Paste the brightspace.html content into Brightspace.

Notes

* The backend handles CORS automatically
* If Qualtrics logging is enabled, response includes a hidden HTML comment like:

<!-- Qualtrics status: 200 -->

Files You Need

* index.html
* brightspace.html
* syllabus.txt
* main.ts
* README.md (this file)

