const axios = require('axios');

/**
 * Handles the Quran Surah command
 * @param {Object} sock - The Baileys socket connection
 * @param {String} chatId - The JID of the chat
 * @param {Object} message - The original message object (usermessage)
 * @param {Array} args - The arguments passed with the command (surah number)
 */
async function surahCommand(sock, chatId, message, args) {
    const surahNumber = args[0];

    // 1. Validate Input (Must be 1-114)
    if (!surahNumber || isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return await sock.sendMessage(chatId, { 
            text: "📖 *Invalid Surah Number!*\n\nPlease provide a number between 1 and 114.\nExample: `@surah 36`" 
        }, { quoted: message });
    }

    try {
        // 2. React to show the bot is processing
        await sock.sendMessage(chatId, { react: { text: '📖', key: message.key } });

        // 3. Fetch Surah Details (Arabic Name, English Meaning, etc.)
        const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const surah = response.data.data;

        // 4. Construct the Header Message
        const infoHeader = `*╭═══ 📖 QURAN KAREEM 📖 ═══╮*\n\n` +
                           `*✨ Surah:* ${surah.englishName} (${surah.name})\n` +
                           `*📜 Meaning:* ${surah.englishNameTranslation}\n` +
                           `*🔢 Ayahs:* ${surah.numberOfAyahs}\n` +
                           `*📍 Type:* ${surah.revelationType}\n\n` +
                           `_🎧 Now sending recitation by Mishary Rashid Alafasy..._`;

        await sock.sendMessage(chatId, { text: infoHeader }, { quoted: message });

        // 5. Send the Audio File (Direct Stream from CDN)
        // This doesn't store files on your server, saving RAM.
        const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;

        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false, // Set to true if you want it as a voice note
            contextInfo: {
                externalAdReply: {
                    title: `Surah ${surah.englishName}`,
                    body: "Mishary Rashid Alafasy",
                    mediaType: 2,
                    sourceUrl: "https://quran.com"
                }
            }
        }, { quoted: message });

        // 6. Final success reaction
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Quran Command Error:', error);
        await sock.sendMessage(chatId, { text: '❌ An error occurred while fetching the Surah. Please try again later.' });
    }
}

module.exports = surahCommand;
