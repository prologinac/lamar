const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const warningsPath = path.join(process.cwd(), 'data', 'warnings.json');

module.exports = async (sock, chatId, message, args, context) => {
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: 'Groups only!' });
    
    const senderId = message.key.participant || message.key.remoteJid;
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
    
    if (!isBotAdmin) return sock.sendMessage(chatId, { text: 'Make bot admin first!' });
    if (!isSenderAdmin && !context.isSudo) return sock.sendMessage(chatId, { text: 'Admins only!' });

    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   message.message?.extendedTextMessage?.contextInfo?.participant;

    if (!target) return sock.sendMessage(chatId, { text: 'Tag someone to warn!' });

    let warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8') || '{}');
    warnings[target] = (warnings[target] || 0) + 1;
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

    if (warnings[target] >= 3) {
        await sock.groupParticipantsUpdate(chatId, [target], "remove");
        await sock.sendMessage(chatId, { text: `@${target.split('@')[0]} kicked for reaching 3 warnings.`, mentions: [target] });
        delete warnings[target];
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
    } else {
        await sock.sendMessage(chatId, { text: `⚠️ @${target.split('@')[0]} warned! (${warnings[target]}/3)`, mentions: [target] });
    }
};
