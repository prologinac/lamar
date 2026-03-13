const axios = require('axios');

async function apkCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    
    if (!query) {
        return await sock.sendMessage(chatId, { text: '❌ Please provide an app name (e.g., .apk WhatsApp)' }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { react: { text: '📥', key: message.key } });

        // 1. Fetch data from the API
        const apiUrl = `https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.success || !res.result) {
            return await sock.sendMessage(chatId, { text: '❌ Could not find that APK. Try another name.' }, { quoted: message });
        }

        const { name, size, last_update, icon, dllink } = res.result;

        // 2. Send App Details first
        const caption = `*📦 APK DOWNLOADER*\n\n` +
                        `*📝 Name:* ${name}\n` +
                        `*⚖️ Size:* ${size}\n` +
                        `*📅 Updated:* ${last_update}\n\n` +
                        `_Uploading file, please wait..._`;

        await sock.sendMessage(chatId, { 
            image: { url: icon }, 
            caption: caption 
        }, { quoted: message });

        // 3. Send the actual APK file
        await sock.sendMessage(chatId, {
            document: { url: dllink },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${name}.apk`,
            caption: `✅ Successfully downloaded ${name}`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('APK Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error downloading APK. The API might be down.' });
    }
}

module.exports = apkCommand;
