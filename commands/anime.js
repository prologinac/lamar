const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

module.exports = async (sock, chatId, message, args) => {
    const type = args[0]?.toLowerCase();
    const supported = ['nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 'facepalm', 'quote'];

    if (!type || !supported.includes(type)) {
        return sock.sendMessage(chatId, { text: `Usage: .anime <type>\nTypes: ${supported.join(', ')}` }, { quoted: message });
    }

    try {
        const endpoint = `https://api.some-random-api.com/animu/${type === 'facepalm' ? 'face-palm' : type}`;
        const res = await axios.get(endpoint);
        
        if (res.data.quote) {
            return await sock.sendMessage(chatId, { text: res.data.quote }, { quoted: message });
        }

        if (res.data.link) {
            await sock.sendMessage(chatId, { image: { url: res.data.link }, caption: `Madrin-MD: ${type}` }, { quoted: message });
        }
    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ Error fetching anime.' }, { quoted: message });
    }
};
