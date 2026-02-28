const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' }); // Adjusted path for Cwd

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.log('No key!'); return; }
    
    const genAI = new GoogleGenerativeAI(key);
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} works: ${response.text().substring(0, 30)}...`);
            return; // Stop if we find a working one
        } catch (err) {
            console.log(`❌ ${modelName} failed: ${err.message}`);
        }
    }
}

test();
