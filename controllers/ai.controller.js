const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are a helpful AI assistant for T.R Construction — a construction complaint management company.

Your role:
- Help users submit, track, and understand their construction complaints
- Guide admins in managing and resolving complaints efficiently
- Answer questions about construction issues: rework, maintenance, development, defects
- Help users describe their complaint clearly
- Explain complaint statuses: "process" (being reviewed), "resolved" (fixed), "closed" (completed)
- Suggest what information to include when submitting a complaint (name, email, mobile, address, type, details, photo)
- Be concise, friendly, and professional

Complaint types handled: Rework, Maintenance, Development, Other

Do NOT answer questions unrelated to construction, complaints, or the T.R Construction platform.
Keep responses short (2-4 sentences max unless a list is needed).`;

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error_code: 1, message: 'Message is required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am the T.R Construction AI assistant, ready to help with complaints and construction queries.' }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.status(200).json({ error_code: 0, reply, message: 'OK' });
  } catch (error) {
    console.error('AI chat error:', error.message);
    return res.status(500).json({ error_code: 1, message: 'AI service unavailable. Please try again.' });
  }
};
