const fs = require('fs');
const path = require('path');
const warningsPath = path.join(process.cwd(), 'data', 'warnings.json');

module.exports = async (sock, chatId, message) => {
    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   message.message?.extendedTextMessage?.contextInfo?.participant;

    if (!target) return sock.sendMessage(chatId, { text: 'Tag a user to check warnings.' });

    const warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
    const count = warnings[target] || 0;
    await sock.sendMessage(chatId, { text: `@${target.split('@')[0]} has ${count} warning(s).`, mentions: [target] });
};
