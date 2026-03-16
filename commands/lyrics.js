const axios = require('axios');

async function lyricsCommand(sock, chatId, message, args) {
    const songQuery = args.join(' ').trim();

    if (!songQuery) {
        return await sock.sendMessage(chatId, { 
            text: "🎵 *Please provide a song name!*\n\nExample: `.lyrics Blinding Lights`" 
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        // 1. Search for the song to get the ID/Details
        // LRCLIB is one of the most stable free lyrics databases
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(songQuery)}`;
        const response = await axios.get(searchUrl);

        if (!response.data || response.data.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: `❌ No lyrics found for: *${songQuery}*` 
            }, { quoted: message });
        }

        // 2. Take the first result
        const songData = response.data[0];
        
        // 3. Check for plain lyrics (synced lyrics are also available as 'syncedLyrics')
        const lyricsBody = songData.plainLyrics || "Lyrics content is empty for this track.";

        // 4. Construct the Message
        let lyricsMessage = `🎵 *LYRICS FINDER* 🎵\n\n`;
        lyricsMessage += `✨ *Title:* ${songData.trackName}\n`;
        lyricsMessage += `👤 *Artist:* ${songData.artistName}\n`;
        lyricsMessage += `💿 *Album:* ${songData.albumName || 'N/A'}\n`;
        lyricsMessage += `───────────────────\n\n`;
        lyricsMessage += lyricsBody;

        // 5. Send it
        // We use text here because LRCLIB doesn't provide images, 
        // making the response extremely fast.
        await sock.sendMessage(chatId, { text: lyricsMessage }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🎶', key: message.key } });

    } catch (error) {
        console.error('Lyrics Error:', error.message);
        await sock.sendMessage(chatId, { text: '❌ Service is currently down. Please try again later.' });
    }
}

module.exports = lyricsCommand;
