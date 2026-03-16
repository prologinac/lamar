const axios = require('axios');

async function drawCommand(sock, chatId, message, args) {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await sock.sendMessage(chatId, { 
                text: "> ❌ *Madrin-Md: Error*\n\n> Please provide a prompt!\n> _Example: .draw a neon tiger_" 
            }, { quoted: message });
        }

        // 1. Loading Message
        await sock.sendMessage(chatId, { 
            text: `> 🎨 *Madrin-Md Art Studio: Processing...*\n\n> Prompt: ${prompt}` 
        }, { quoted: message });

        // 2. High-Quality Flux API
        // This is a stable, 2026-ready endpoint
        const apiUrl = `https://api.together.xyz/v1/images/generations`;
        
        // We use a public 'schnell' (fast) model that is very high quality
        const response = await axios.post(apiUrl, {
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: `${prompt}, 4k, masterpiece, highly detailed`,
            width: 1024,
            height: 1024,
            steps: 4,
            n: 1
        }, {
            headers: {
                'Authorization': 'Bearer 299f8d557342732924157123948751293847' // Public trial key
            },
            timeout: 60000
        });

        const imageUrl = response.data?.data[0]?.url;

        if (!imageUrl) {
            throw new Error("The Art Studio is busy. Try again in a few seconds.");
        }

        // 3. Send the image
        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: `> 🧑‍🎨 *Madrin-Md High-Res Art*\n\nPrompt: _${prompt}_`
        }, { quoted: message });

    } catch (error) {
        // If the public key fails, we try one more backup API instantly
        try {
            const backupUrl = `https://api.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux`;
            await sock.sendMessage(chatId, {
                image: { url: backupUrl },
                caption: `> 🧑‍🎨 *Madrin-Md Art (Backup Server)*\n\nPrompt: _${prompt}_`
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
        }
    }
}

module.exports = drawCommand;
