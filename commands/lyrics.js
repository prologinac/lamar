const axios = require('axios');

async function lyricsCommand(sock, chatId, message, args) {
    const songQuery = args.join(' ');

    // 1. Validation
    if (!songQuery) {
        return await sock.sendMessage(chatId, { 
            text: "🎵 *Please provide a song name!*\n\nExample: `.lyrics Blinding Lights`" 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        // 2. Fetch lyrics 
        // Using a robust public API for English lyrics
        const response = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songQuery)}`);
        const data = response.data;

        if (!data || !data.lyrics) {
            return await sock.sendMessage(chatId, { text: "❌ Lyrics not found for this song." });
        }

        // 3. Construct the Message
        let lyricsMessage = `🎵 *LYRICS FINDER* 🎵\n\n`;
        lyricsMessage += `✨ *Title:* ${data.title}\n`;
        lyricsMessage += `👤 *Artist:* ${data.artist}\n`;
        lyricsMessage += `───────────────────\n\n`;
        lyricsMessage += data.lyrics;

        // 4. Send with Image if available
        if (data.image) {
            await sock.sendMessage(chatId, { 
                image: { url: data.image }, 
                caption: lyricsMessage 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: lyricsMessage }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🎶', key: message.key } });

    } catch (error) {
        console.error('Lyrics Error:', error);
        await sock.sendMessage(chatId, { text: '❌ An error occurred while searching for lyrics.' });
    }
}

module.exports = lyricsCommand;
