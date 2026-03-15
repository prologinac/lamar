const axios = require('axios');

async function lyricsCommand(sock, chatId, message, args) {
    // 1. Join args and clean up whitespace
    let songQuery = args.join(' ').trim();

    if (!songQuery) {
        return await sock.sendMessage(chatId, { 
            text: "🎵 *Please provide a song name!*\n\nExample: `.lyrics Blinding Lights`" 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        // 2. Using a different, highly stable lyrics API
        // This one is specifically for developers and very reliable for English songs
        const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(songQuery)}`);
        const data = response.data;

        // 3. Check if the API actually returned lyrics
        if (!data || !data.lyrics) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Lyrics not found for: *${songQuery}*\n\nTry adding the artist name, e.g., \`.lyrics The Weeknd Blinding Lights\`` 
            }, { quoted: message });
        }

        // 4. Construct the Message
        let lyricsMessage = `🎵 *LYRICS FINDER* 🎵\n\n`;
        lyricsMessage += `✨ *Title:* ${data.title || 'Unknown'}\n`;
        lyricsMessage += `👤 *Artist:* ${data.artist || 'Unknown'}\n`;
        lyricsMessage += `───────────────────\n\n`;
        lyricsMessage += data.lyrics;

        // 5. Send the response
        // Note: Lyrist API doesn't always provide an image, so we send text
        await sock.sendMessage(chatId, { text: lyricsMessage }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🎶', key: message.key } });

    } catch (error) {
        console.error('Lyrics Error:', error.message);
        await sock.sendMessage(chatId, { text: '❌ System error: The lyrics service is currently unavailable.' });
    }
}

module.exports = lyricsCommand;
