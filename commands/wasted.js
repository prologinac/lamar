const axios = require('axios');

module.exports = async (sock, chatId, message) => {
    let userToWaste = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     message.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!userToWaste) return await sock.sendMessage(chatId, { text: 'Tag someone to waste them!' });

    try {
        let profilePic;
        try { profilePic = await sock.profilePictureUrl(userToWaste, 'image'); } 
        catch { profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; }

        const res = await axios.get(`https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`, { responseType: 'arraybuffer' });
        await sock.sendMessage(chatId, { 
            image: Buffer.from(res.data), 
            caption: `⚰️ *Wasted* : @${userToWaste.split('@')[0]}`,
            mentions: [userToWaste]
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to create image.' });
    }
};
