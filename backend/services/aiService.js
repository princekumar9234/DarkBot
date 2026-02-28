// ============================================
// AI Service - Robust Google Gemini Integration
// ============================================

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are DarkBot, an advanced AI based on Gemini/ChatGPT. Be professional and helpful. Use Markdown.`;

async function callOpenAI(messages) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI key missing.');
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 2048,
    });
    return completion.choices[0].message.content;
}

async function callGemini(messages, attachments = []) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_KEY;
    if (!key || key.includes('your_gemini_api_key')) throw new Error('Gemini key missing.');

    // Models to try in order of preference
    const modelsToTry = [
        "gemini-2.0-flash",         
        "gemini-flash-latest",      
        "gemini-pro-latest",         
        "gemini-1.5-flash",
        "gemma-3-27b-it",   // Fallback models often have separate quotas
        "gemma-3-1b-it"     // Confirmed working workaround for 429
    ];

    const genAI = new GoogleGenerativeAI(key);
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[DarkBot] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Format history correctly for SDK
            const history = messages.slice(0, -1).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({
                history,
                generationConfig: { maxOutputTokens: 2048 },
            });

            const lastMsg  = messages[messages.length - 1].content;
            const promptText = messages.length === 1 ? `${SYSTEM_PROMPT}\n\nUser: ${lastMsg}` : lastMsg;
            const parts = [{ text: promptText }, ...attachments.map(att => ({
                inlineData: { mimeType: att.mimeType, data: att.data }
            }))];

            const result = await chat.sendMessage(parts);
            const response = await result.response;
            const text = response.text();
            if (text) return text;
        } catch (err) {
            console.error(`[DarkBot] Model ${modelName} failed: ${err.message}`);
            lastError = err;
            // 429 = No quota, 404 = Model not found, 400 = invalid request/history
            if (err.message.includes('429') || err.message.includes('404') || err.message.includes('400')) {
                continue; 
            }
            break; // Stop on critical errors like 403 (Unauthorized) or 401
        }
    }

    throw lastError || new Error('All models failed.');
}

module.exports = { callOpenAI, callGemini };
