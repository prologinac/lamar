const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function botdpCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.imageMessage) {
            return await sock.sendMessage(chatId, { text: "> ❌ Please reply to an image with *.botdp*" }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: "> ⏳ *Madrin-Md: Updating DP...*" }, { quoted: message });

        const buffer = await downloadMediaMessage(
            { message: quoted },
            'buffer',
            {},
            { reuploadRequest: sock.updateMediaMessage }
        );

        await sock.updateProfilePicture(sock.user.id, buffer);
        await sock.sendMessage(chatId, { text: "> ✅ *Success! Profile Picture Updated.*" }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
    }
}

module.exports = botdpCommand;
