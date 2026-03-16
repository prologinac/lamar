const axios = require('axios');
const https = require('https'); // 1. Add this at the top

async function drawCommand(sock, chatId, message, args) {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await sock.sendMessage(chatId, { text: "> ❌ Please provide a prompt!" }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: `> 🎨 *Madrin-Md: Generating HD Art...*` }, { quoted: message });

        // 2. Create the agent to bypass the expired certificate
        const agent = new https.Agent({  
            rejectUnauthorized: false 
        });

        const enhancedPrompt = `${prompt}, 4k, highly detailed, masterpiece`;
        const apiUrl = `https://api.boxi.biz/api/image/flux?prompt=${encodeURIComponent(enhancedPrompt)}`;

        // 3. Add the httpsAgent to the axios request
        const response = await axios.get(apiUrl, { 
            httpsAgent: agent, // This is the secret sauce
            timeout: 45000 
        });

        const imageUrl = response.data?.result?.url || response.data?.url;

        if (!imageUrl) throw new Error("Could not get image link.");

        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: `> 🧑‍🎨 *Madrin-Md Pro Art*\n\nPrompt: _${prompt}_`
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
    }
}

module.exports = drawCommand;
