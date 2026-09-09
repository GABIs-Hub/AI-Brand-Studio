const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.list().then(res => {
  for (const model of res) {
    console.log(model.name);
  }
}).catch(console.error);
