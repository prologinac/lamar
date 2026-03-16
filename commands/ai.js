const axios = require('axios');
const fetch = require('node-fetch');

module.exports = async (sock, chatId, message, args) => {
    try {
        const query = args.join(' ').trim();
        
        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question.\n\nExample: .gpt write a basic html code"
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        // Since the 'Manager' passes the command name, we check it here
        const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").toLowerCase();
        
        if (text.startsWith('.gpt')) {
            const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
            if (response.data?.success && response.data?.result) {
                await sock.sendMessage(chatId, { text: response.data.result.prompt }, { quoted: message });
            } else {
                throw new Error('API Error');
            }
        } else {
            // Gemini Logic
            const apis = [
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`
            ];

            for (const api of apis) {
                try {
                    const response = await fetch(api);
                    const data = await response.json();
                    const answer = data.message || data.data || data.answer || data.result;
                    if (answer) {
                        return await sock.sendMessage(chatId, { text: answer }, { quoted: message });
                    }
                } catch { continue; }
            }
        }
    } catch (error) {
        await sock.sendMessage(chatId, { text: "❌ Failed to get response." }, { quoted: message });
    }
};
