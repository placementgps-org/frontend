import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../server/.env');

const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('D_ID_API_KEY=')) {
    apiKey = line.replace('D_ID_API_KEY=', '').trim();
  }
}

let authHeader;
if (apiKey.includes(':')) {
  authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;
} else if (apiKey.startsWith('Basic ') || apiKey.startsWith('Bearer ')) {
  authHeader = apiKey;
} else {
  authHeader = `Bearer ${apiKey}`;
}

const testUrls = [
  'https://clips-presenters.d-id.com/v2/matt/hbMP8_7cv7/BTuR3JVOBy/image.png',
  'https://clips-presenters.d-id.com/v2/amy/image.png',
  'https://clips-presenters.d-id.com/v2/jack/image.png',
  'https://clips-presenters.d-id.com/v2/alyssa/image.png',
  'https://clips-presenters.d-id.com/v2/alex/image.png'
];

for (const url of testUrls) {
  try {
    const res = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: url,
        script: {
          type: 'text',
          input: 'Hello',
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-GuyNeural',
          },
        },
      }),
    });

    console.log(`URL ${url} -> Status: ${res.status}`);
    const b = await res.text();
    if (res.status !== 201) console.log('  Error:', b);
  } catch (err) {
    console.error(err);
  }
}
