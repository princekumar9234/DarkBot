const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    try {
        const result = await model.generateContent("Hello");
        const resp = await result.response;
        console.log('SUCCESS:', resp.text());
    } catch (err) {
        console.log('FAILED:', err.message);
    }
}
test();
