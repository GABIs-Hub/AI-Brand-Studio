require('dotenv').config();
console.log("Raw Key:", process.env.GEMINI_API_KEY);
const rawKey = process.env.GEMINI_API_KEY?.trim();
const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '') : undefined;
console.log("Parsed Key:", apiKey);
