async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(chatId, { text: '𝗧𝗵𝗲 𝗴𝗿𝗼𝘂𝗽 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘂𝗻𝗺𝘂𝘁𝗲𝗱 .𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗮𝗴𝗮𝗶𝗻 𝗳𝗼𝗼𝗹𝘀😜.' });
}

module.exports = unmuteCommand;
