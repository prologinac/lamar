async function onlineCommand(sock, chatId, message, args) {
    const status = args[0]?.toLowerCase();

    if (status === 'on') {
        await sock.sendPresenceUpdate('available');
        return await sock.sendMessage(chatId, { 
            text: "> 🌐 Always Online: *ENABLED*\n> _You will appear online even when sleeping._" 
        }, { quoted: message });
    } 
    
    if (status === 'off') {
        await sock.sendPresenceUpdate('unavailable');
        return await sock.sendMessage(chatId, { 
            text: "> 🌐 Always Online: *DISABLED*" 
        }, { quoted: message });
    }

    // Usage help if no argument is provided
    const usage = `*🏮 ONLINE CONTROL*\n\n> .online on\n> .online off`;

    await sock.sendMessage(chatId, { text: usage }, { quoted: message });
}

module.exports = onlineCommand;
