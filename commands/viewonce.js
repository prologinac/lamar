const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const viewOnce = quoted?.imageMessage?.viewOnce || quoted?.videoMessage?.viewOnce;

        if (!viewOnce) return await sock.sendMessage(chatId, { text: 'Reply to a ViewOnce message!' });

        const mediaType = quoted.imageMessage ? 'image' : 'video';
        const stream = await downloadContentFromMessage(quoted[`${mediaType}Message`], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await sock.sendMessage(sock.user.id.split(':')[0] + '@s.whatsapp.net', { 
            [mediaType]: buffer, 
            caption: `🥷 *Recovery*\nFrom: ${chatId}` 
        });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    } catch (e) { console.error(e); }
};
