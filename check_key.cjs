const { GoogleGenAI } = require('@google/genai');
async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: 'Hi' });
    console.log('KEY IS VALID');
  } catch (e) {
    console.error('KEY ERROR:', e.message);
  }
}
test();
