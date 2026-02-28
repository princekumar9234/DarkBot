const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    
    for(const modelName of models) {
        console.log(`Testing: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const resp = await result.response;
            console.log(`SUCCESS [${modelName}]:`, resp.text().substring(0, 50));
            return;
        } catch (err) {
            console.log(`FAILED [${modelName}]:`, err.message);
        }
    }
}
test();
