const fs = require('fs');
const https = require('https');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
if (!keyMatch) {
  console.log("No API key found in .env");
  process.exit(1);
}
const key = keyMatch[1].trim();

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(parsed.models.map(m => m.name).join(', '));
    } catch (e) {
      console.log(data);
    }
  });
}).on('error', err => console.log(err));
