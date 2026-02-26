const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    try {
        // 1. IMMEDIATELY delete your command message to leave no trace
        await sock.sendMessage(chatId, { 
            delete: { 
                remoteJid: chatId, 
                fromMe: message.key.fromMe, 
                id: message.key.id, 
                participant: message.key.participant 
            } 
        });

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedImage = quoted?.imageMessage;
        const quotedVideo = quoted?.videoMessage;

        if ((quotedImage && quotedImage.viewOnce) || (quotedVideo && quotedVideo.viewOnce)) {
            const isVideo = !!quotedVideo;
            const mediaType = isVideo ? 'video' : 'image';
            const mediaContent = isVideo ? quotedVideo : quotedImage;

            // 2. Identify YOU as the recipient
            const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            // 3. Download the media silently
            const stream = await downloadContentFromMessage(mediaContent, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            // 4. Send the recovered file to your private chat
            await sock.sendMessage(myId, { 
                [mediaType]: buffer, 
                caption: `🥷 *Stealth Recovery*\n*From Chat:* ${chatId}\n*Sender:* @${(message.key.participant || message.key.remoteJid).split('@')[0]}`,
                mentions: [message.key.participant || message.key.remoteJid]
            });
        }
    } catch (err) {
        // Silently log errors to your terminal
        console.error("Stealth Error:", err);
    }
}

module.exports = viewonceCommand;
