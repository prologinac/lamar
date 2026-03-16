async function onlineCommand(sock, chatId, message, args) {
    const status = args[0]?.toLowerCase();

    if (status === 'on') {
        // Broadcasters 'available' (Online) status to WhatsApp
        await sock.sendPresenceUpdate('available');
        return await sock.sendMessage(chatId, { 
            text: "> ╭══════════════════════⟡\n> ┃ 🟢 *Online mode: ON*\n> ╰══════════════════════⟡\n> Madrin-Md is now appearing online." 
        }, { quoted: message });
    } 
    
    if (status === 'off') {
        // Broadcasters 'unavailable' (Offline) status
        await sock.sendPresenceUpdate('unavailable');
        return await sock.sendMessage(chatId, { 
            text: "> ╭══════════════════════⟡\n> ┃ 🔴 *Online mode: OFF*\n> ╰══════════════════════⟡\n> Madrin-Md status is now hidden." 
        }, { quoted: message });
    }

    // Help message if no argument is provided
    const usage = `> ╭══════════════════════⟡\n> ┃ 💡 ❚❚ STATUS CONTROL ❚❚ 💡\n> ╰══════════════════════⟡\n> .online on\n> .online off`;

    await sock.sendMessage(chatId, { text: usage }, { quoted: message });
}

module.exports = onlineCommand;
