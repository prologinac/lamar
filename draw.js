const axios = require('axios');

async function drawCommand(sock, chatId, message, args) {
    try {
        const prompt = args.join(' ');

        if (!prompt) {
            return await sock.sendMessage(chatId, { 
                text: "> ❌ *Madrin-Md: Command Usage*\n\n> .draw [your idea]\n> _Example: .draw futuristic car in rain_" 
            }, { quoted: message });
        }

        // 1. Initial Processing Message
        await sock.sendMessage(chatId, { 
            text: `> 🎨 *Madrin-Md Art Pro: Generating...*\n\n> Prompt: ${prompt}\n> _Quality: High Definition_" 
        }, { quoted: message });

        // 2. High-Quality API Fetch (Using Flux/DALL-E Tier)
        // We add '4k, highly detailed, professional' to the prompt for better quality
        const enhancedPrompt = `${prompt}, 4k, highly detailed, cinematic lighting, masterpiece, 8k resolution`;
        const apiUrl = `https://api.boxi.biz/api/image/flux?prompt=${encodeURIComponent(enhancedPrompt)}`;
        
        const response = await axios.get(apiUrl, { timeout: 45000 }); // Longer timeout for high quality

        const imageUrl = response.data?.result?.url || response.data?.url;

        if (!imageUrl) {
            throw new Error("The HD Art Studio is currently overloaded.");
        }

        // 3. Send the image to WhatsApp
        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: `> 🧑‍🎨 *Madrin-Md Pro Art*\n\nPrompt: _${prompt}_`
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: `> ❌ *Madrin-Md Art Error:* ${error.message}` 
        }, { quoted: message });
    }
}

module.exports = drawCommand;
