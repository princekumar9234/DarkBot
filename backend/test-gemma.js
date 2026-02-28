const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemma-3-1b-it" });
    try {
        const result = await model.generateContent("Hello");
        const resp = await result.response;
        console.log('SUCCESS [gemma-3-1b-it]:', resp.text());
    } catch (err) {
        console.log('FAILED [gemma-3-1b-it]:', err.message);
    }
}
test();
