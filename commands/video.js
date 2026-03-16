const axios = require('axios');
const yts = require('yt-search');

async function videoCommand(sock, chatId, message, args) {
    try {
        const searchQuery = args.join(' ');
        if (!searchQuery) return await sock.sendMessage(chatId, { text: '> ❌ Provide a name or link!' }, { quoted: message });

        let videoUrl = '';
        let videoTitle = '';

        // 1. YouTube Search Logic
        if (searchQuery.startsWith('http')) {
            videoUrl = searchQuery;
        } else {
            const search = await yts(searchQuery);
            const video = search.videos[0];
            if (!video) return await sock.sendMessage(chatId, { text: '> ❌ No results found.' }, { quoted: message });
            videoUrl = video.url;
            videoTitle = video.title;
        }

        await sock.sendMessage(chatId, { text: `> 📥 *Madrin-Md: Downloading...*\n> ${videoTitle || videoUrl}` }, { quoted: message });

        let downloadUrl = null;

        // --- ATTEMPT 1: ALYA API (New & High Stability) ---
        try {
            const res = await axios.get(`https://api.alyachan.dev/api/ytv?url=${encodeURIComponent(videoUrl)}&apikey=madrin`);
            if (res.data?.data?.url) {
                downloadUrl = res.data.data.url;
            }
        } catch (e) {
            // --- ATTEMPT 2: TINY-URL BYPASS ---
            try {
                const res = await axios.get(`https://api.boxi.biz/api/youtube/video?url=${encodeURIComponent(videoUrl)}`);
                downloadUrl = res.data?.result?.url || res.data?.url;
            } catch (e2) {
                console.log("Secondary API failed.");
            }
        }

        if (!downloadUrl) {
            throw new Error("Temporary Server Block. YouTube is limiting requests. Please try again in a few minutes.");
        }

        // 4. Send the Video
        await sock.sendMessage(chatId, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${videoTitle || 'video'}.mp4`,
            caption: `*${videoTitle || 'Madrin Video'}*\n\n> *_Downloaded by Madrin_*`
        }, { quoted: message });

    } catch (error) {
        await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
    }
}

module.exports = videoCommand;
