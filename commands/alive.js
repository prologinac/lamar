const settings = require("../settings");

module.exports = async (sock, chatId, message) => {
    try {
        await sock.sendMessage(chatId, { react: { text: '😎', key: message.key } });

        const aliveMessage = `
*╭━━━〔 🅷︎🅴︎🆈︎ 🅸︎🆃︎🆂︎ 🅼︎🅰︎🅳︎🆁︎🅸︎🅽︎ 🤪〕━━━┈⊷*
*┃ 𝗡𝗔𝗠𝗘:❯ 𝗥𝗮𝗺𝗮𝗱𝗵𝗮𝗻 𝗛𝗮𝘀𝗵𝗶𝗺*
*┃ 𝗩𝗘𝗥𝗦𝗜𝗢𝗡:❯ ${settings.version || '1.0.0'}*
*╰━━━━━━━━━━━━━━━┈⊷*
*𝙱𝙾𝚃 𝙸𝚂 𝙰𝙲𝚃𝙸𝚅𝙴 𝙰𝙽𝙳 𝚁𝚄𝙽𝙽𝙸𝙽𝙶!*`;

        await sock.sendMessage(chatId, {
            text: aliveMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402325089913@newsletter',
                    newsletterName: '🅼︎🅰︎🅳︎🆁︎🅸︎🅽︎ 🄷🄾🄿🄺🄸🄽🅂'
                }
            }
        }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: '*𝗕𝗼𝘁 𝗶𝘀 𝗮𝗹𝗶𝘃𝗲*' }, { quoted: message });
    }
};
