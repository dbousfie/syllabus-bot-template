# Chatbot API + Optional Qualtrics Integration

This project connects Brightspace to OpenAI to generate chatbot responses.

It **optionally** saves chatbot interactions into a Qualtrics survey if Qualtrics API details are provided.

## Setup Instructions

1. Create a `.env` file based on the provided `.env.example`:

   ```
   API_KEY=your_openai_api_key_here

   # (Optional) Qualtrics integration
   QUALTRICS_API_TOKEN=your_qualtrics_api_token
   QUALTRICS_SURVEY_ID=your_qualtrics_survey_id
   QUALTRICS_DATACENTER=your_qualtrics_data_center (e.g., ca1, eu1, uwo.eu)
   ```

2. If you **leave the Qualtrics fields blank**, the chatbot will still work — it will just not attempt to send responses to Qualtrics.

3. Make sure your survey has the following Embedded Data fields (if you use Qualtrics):

   - `responseText`
   - `queryText`
     Then **Publish** your survey before using it.

4. The script automatically:
   - Handles CORS for Brightspace.
   - Retries if OpenAI rate limits (429 error).
   - Logs API raw responses and Qualtrics submissions for debugging.

## Where to Find Your Qualtrics Information

- API Token: Account Settings → Qualtrics IDs → API Token.
- Survey ID: Open Survey Builder → URL → Copy ID after /SV_.
- Data Center: Your Qualtrics domain prefix (e.g., ca1, eu, uwo.eu).

Leave blank if you don't want to use Qualtrics.
