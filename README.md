Syllabus Bot Template
A copyable, modular bot for answering syllabus questions using OpenAI.
Designed to embed cleanly into Brightspace, with optional Qualtrics logging.

What It Does

* Accepts free-text questions
* Uses OpenAI to generate responses from your syllabus.txt
* Optionally logs questions and responses to a Qualtrics survey
* Can be linked or embedded via iframe in Brightspace

How to Use

**1. Fork This Repo**
Click Fork (top-right) on GitHub to make your own copy.

**2. Replace the Syllabus**
Edit `syllabus.txt` with your course content.

You do **not** need to include a syllabus link in the text itself.
Instead, add the course web page URL as an environment variable in Deno:

```
SYLLABUS_LINK = https://your.link.here
```

The bot will automatically append this at the end of each response:

```
There may be errors in my responses; always refer to the course web page: https://your.link.here
```

**3. Customize the Interface (Optional)**

* `index.html` is the standalone public bot page
* `brightspace.html` is for embedding in Brightspace via iframe
* You can change headers, labels, or placeholders as needed

**4. Deploy Backend to Deno**

* Go to [https://dash.deno.com](https://dash.deno.com)
* Sign in with GitHub
* Click "Deploy from GitHub"
* Set `main.ts` as the entry point
* Add environment variables under "Settings" → "Environment Variables":

```
OPENAI_API_KEY         = your key  
QUALTRICS_API_TOKEN    = optional  
QUALTRICS_SURVEY_ID    = optional  
QUALTRICS_DATACENTER   = optional (e.g., uwo.eu)  
SYLLABUS_LINK          = required (Brightspace or course page link)
```

If Qualtrics values are missing, the bot still works — it just skips logging.

**Required Setup in Qualtrics (optional):**
In your Qualtrics survey:

* Go to Survey Flow
* Click Add a New Element → Embedded Data
* Add the following exact variable names:

```
responseText  
queryText  
```

Click Apply and Publish the survey.

**5. Deploy Frontend to GitHub Pages**

* Go to your repo → Settings → Pages
* Set source to Branch: main, Folder: root
* Save
* Visit:

  ```
  https://your-username.github.io/your-repo-name/
  ```

This is your public bot URL.

6. Add to Brightspace

Use the included brightspace.html file. It is styled to match Brightspace’s interface and loads your bot using an iframe.

You only need to change the src attribute in the iframe:

<iframe src="https://yourusername.github.io/your-bot-repo/" width="100%" height="800px" style="border: none;"></iframe>

Once updated, paste the entire contents of brightspace.html into a Brightspace HTML content item or widget.


Notes

* The backend handles CORS automatically
* If Qualtrics logging is enabled, the response includes a hidden HTML comment like:
  `<!-- Qualtrics status: 200 -->`

---

Files You Need

* `index.html`
* `brightspace.html`
* `syllabus.txt`
* `main.ts`
* `README.md`

© Dan Bousfield, licensed under Creative Commons Attribution 4.0
[https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)


