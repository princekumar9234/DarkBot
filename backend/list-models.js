const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

async function list() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).listModels(); // This might not work in SDK
        console.log(models);
    } catch (err) {
        console.log('Listing failed directly, trying fetch...');
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await resp.json();
            console.log(JSON.stringify(data, null, 2));
        } catch (err2) {
            console.log('Fetch also failed:', err2.message);
        }
    }
}
list();
