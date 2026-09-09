const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({ model: 'gemini-1.5-flash', contents: 'Hi' })
  .then(console.log)
  .catch(console.error);
