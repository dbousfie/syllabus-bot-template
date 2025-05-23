<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set CORS headers to allow requests from Brightspace
header("Access-Control-Allow-Origin: https://westernu.brightspace.com");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// Retrieve API keys and survey info from environment variables
$openai_api_key = getenv('API_KEY');
$qualtrics_api_token = getenv('QUALTRICS_API_TOKEN');
$qualtrics_survey_id = getenv('QUALTRICS_SURVEY_ID');
$qualtrics_datacenter = getenv('QUALTRICS_DATACENTER');

// Check OpenAI API Key
if (!$openai_api_key) {
    echo "Error: OpenAI API key not found.";
    exit();
}

// Check for POST and 'query'
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['query'])) {
    $query = $_POST['query'];

    // Read syllabus.txt
    $syllabus_content = file_get_contents('syllabus.txt');
    if ($syllabus_content === false) {
        echo "Error: Unable to read syllabus.txt file.";
        exit();
    }

    // Prepare assistant instructions
    $assistant_instructions = "You are an accurate assistant. You try to always provide the URL of the data after your answer. You always finish your responses with 'there may be errors in my responses; always refer to the course web page'.";

    // OpenAI API call setup
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openai_api_key,
    ]);

    $messages = [
        ['role' => 'system', 'content' => $assistant_instructions],
        ['role' => 'system', 'content' => "Here is important context from syllabus.txt:\n" . $syllabus_content],
        ['role' => 'user', 'content' => $query],
    ];

    $data = [
        'model' => 'gpt-4o-mini',
        'messages' => $messages,
    ];

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    // Retry logic for 429 errors
    $max_retries = 5;
    $retry_delay = 2;
    $retry_count = 0;

    do {
        $response = curl_exec($ch);
        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($http_status == 429) {
            sleep($retry_delay);
            $retry_count++;
        } else {
            break;
        }
    } while ($retry_count < $max_retries);

    if (curl_errno($ch)) {
        echo 'cURL Error: ' . curl_error($ch);
        curl_close($ch);
        exit();
    }

    curl_close($ch);
    $response_data = json_decode($response, true);

    if (!isset($response_data['choices'][0]['message']['content'])) {
        echo "API error or no response content.";
        file_put_contents('openai_raw_response.json', $response);
        exit();
    }

    $ai_response = $response_data['choices'][0]['message']['content'];

    // Output AI response for user first
    echo $ai_response;

    // Only send to Qualtrics if all Qualtrics variables are set
    if ($qualtrics_api_token && $qualtrics_survey_id && $qualtrics_datacenter) {
        $qualtrics_url = "https://$qualtrics_datacenter.qualtrics.com/API/v3/surveys/$qualtrics_survey_id/responses";

        $qualtrics_payload = json_encode([
            'values' => [
                'responseText' => $ai_response,
                'queryText' => $query
            ]
        ]);

        $qh = curl_init();
        curl_setopt($qh, CURLOPT_URL, $qualtrics_url);
        curl_setopt($qh, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($qh, CURLOPT_POST, true);
        curl_setopt($qh, CURLOPT_POSTFIELDS, $qualtrics_payload);
        curl_setopt($qh, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "X-API-TOKEN: $qualtrics_api_token"
        ]);

        $qualtrics_response = curl_exec($qh);
        $qualtrics_status = curl_getinfo($qh, CURLINFO_HTTP_CODE);
        curl_close($qh);

        file_put_contents('qualtrics_log.txt', "Status: $qualtrics_status\nResponse: $qualtrics_response\n", FILE_APPEND);

        // Hide Qualtrics status in HTML comment
        echo "\n<!-- Qualtrics status: $qualtrics_status -->";
    }
} else {
    echo "Invalid request.";
}
?>
