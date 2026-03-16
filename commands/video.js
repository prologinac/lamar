const axios = require('axios');
const yts = require('yt-search');

async function videoCommand(sock, chatId, message, args) {
    try {
        const searchQuery = args.join(' ');
        if (!searchQuery) return await sock.sendMessage(chatId, { text: '> ❌ Provide a name or link!' }, { quoted: message });

        let videoUrl = searchQuery.startsWith('http') ? searchQuery : null;
        let videoTitle = '';

        if (!videoUrl) {
            const search = await yts(searchQuery);
            const video = search.videos[0];
            if (!video) return await sock.sendMessage(chatId, { text: '> ❌ No results found.' }, { quoted: message });
            videoUrl = video.url;
            videoTitle = video.title;
        }

        await sock.sendMessage(chatId, { text: `> 📥 *Madrin-Md: Downloading...*\n> ${videoTitle || videoUrl}` }, { quoted: message });

        // --- LOKESH-DEV API (High Success Rate) ---
        const res = await axios.get(`https://api.lokeshder.com/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`);
        const downloadUrl = res.data?.data?.url_video || res.data?.result?.url;

        if (!downloadUrl) throw new Error("YouTube blocked this request. Try a different video.");

        await sock.sendMessage(chatId, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            caption: `*${videoTitle || 'Madrin Video'}*\n\n> *_Downloaded by Madrin_*`
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
    }
}

module.exports = videoCommand;
