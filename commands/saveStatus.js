const fs = require('fs');
const path = require('path');

async function saveStatus(sock, chatId, message) {
    try {
        // Get the status info from the quoted message
        const statusId = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const senderJid = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!statusId || !senderJid) {
            await sock.sendMessage(chatId, { text: "❌ Can't find status to save." });
            return;
        }

        // Download the media (photo/video) from the status
        const status = await sock.downloadMediaMessage(message, "buffer");

        // Save it in the 'saved_status' folder
        const filename = `${senderJid.split('@')[0]}_${Date.now()}.jpg`;
        const filepath = path.join(__dirname, '../saved_status', filename);

        // Make sure the folder exists
        if (!fs.existsSync(path.join(__dirname, '../saved_status'))) {
            fs.mkdirSync(path.join(__dirname, '../saved_status'));
        }

        fs.writeFileSync(filepath, status);

        await sock.sendMessage(chatId, {
    text: `✅ Status saved successfully!\nSaved as: ${filename}`
});

    } catch (err) {
        console.error("Save status error:", err);
        await sock.sendMessage(chatId, { text: "❌ Failed to save status." });
    }
}

module.exports = saveStatus;