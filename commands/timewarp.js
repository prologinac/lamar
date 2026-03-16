const moment = require('moment-timezone');
const fs = require('fs');

async function timewarpCommand(sock, chatId, message) {
    try {
        let target = message.mentionedJid && message.mentionedJid[0] ? message.mentionedJid[0] : 
                     message.quoted ? message.quoted.sender : 
                     chatId;
        
        const realNumber = target.split('@')[0];

        // [Number 42] - Simulated Intelligence Quotient (IQ)
        // Generates a random realistic IQ between 85 and 145
        const iq = Math.floor(Math.random() * (145 - 85 + 1)) + 85;

        // Data Generation
        const timeArusha = moment().tz('Africa/Nairobi').format('HH:mm:ss');
        const dateArusha = moment().tz('Africa/Nairobi').format('DD/MM/YYYY');

        // Phase 1: Initiation
        // [Number 35] - High-Tech Status Emojis (🛰️, ⚙️, 🧪)
        const { key } = await sock.sendMessage(chatId, { text: '🧪 `CALIBRATING TEMPORAL 𝕏 VORTEX...`' }, { quoted: message });

        // Phase 2: Audio
        if (fs.existsSync('./kamn.mp3')) {
            await sock.sendMessage(chatId, { 
                audio: { url: './kamn.mp3' }, 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: message });
        }

        await new Promise(res => setTimeout(res, 2500));

        // Phase 3: Profile Pic
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(target, 'image');
        } catch {
            ppUrl = 'https://telegra.ph/file/0c97825d1052554746765.jpg'; 
        }

        // [Number 33] - ASCII Frame Layout
        // [Number 36] - Horizontal Separators (═════════)
        const finalMsg = `『 ✨ *𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 𝗙𝗘𝗧𝗖𝗛* ✨ 』\n` +
                        `══════════════════════\n` +
                        `👤 *User:* @${realNumber}\n` +
                        `📞 *Phone:* +${realNumber}\n` +
                        `🧠 *Estimated IQ:* ${iq}\n` +
                        `🕒 *Time:* ${timeArusha}\n` +
                        `📅 *Date:* ${dateArusha}\n` +
                        `══════════════════════\n` +
                        `⚙️ *Status:* 🟢 STABLE_SYNC\n` +
                        `🛰️ *Signal:* 📶 100% (Arusha Relay)\n` +
                        `══════════════════════\n` +
                        `_𝗦𝘆𝘀𝘁𝗲𝗺 𝘀𝘁𝗮𝗯𝗹𝗲 𝗶𝗻 2026⚘෴⚘._`;

        // Final Reveal
        await sock.sendMessage(chatId, { 
            image: { url: ppUrl }, 
            caption: finalMsg,
            mentions: [target]
        }, { quoted: message });

        // Clean up initial text
        await sock.sendMessage(chatId, { delete: key });

    } catch (error) {
        console.error("Timewarp Error:", error);
    }
}

module.exports = { timewarpCommand };
