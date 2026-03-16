const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
};

// --- APIS ---
async function getIzumiVideo(url) {
    const res = await axios.get(`https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(url)}&format=720`, AXIOS_DEFAULTS);
    return res.data?.result?.download ? res.data.result : null;
}

async function getOkatsuVideo(url) {
    const res = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(url)}`, AXIOS_DEFAULTS);
    return res.data?.result?.mp4 ? { download: res.data.result.mp4, title: res.data.result.title } : null;
}

async function videoCommand(sock, chatId, message, args) {
    try {
        // Join args to handle names with spaces (e.g., .video rush hour)
        const searchQuery = args.join(' ');
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { text: '> ❌ Please provide a name or YouTube link!' }, { quoted: message });
        }

        let videoUrl = '';
        let videoTitle = '';

        // 1. Resolve URL or Search
        if (searchQuery.startsWith('http')) {
            videoUrl = searchQuery;
        } else {
            const search = await yts(searchQuery);
            const video = search.videos[0];
            if (!video) return await sock.sendMessage(chatId, { text: '> ❌ No results found.' }, { quoted: message });
            videoUrl = video.url;
            videoTitle = video.title;
        }

        // 2. Initial Notification
        await sock.sendMessage(chatId, { text: `> 📥 *Madrin-Md is downloading:* \n> ${videoTitle || videoUrl}` }, { quoted: message });

        // 3. Try Downloaders
        let videoData = await getIzumiVideo(videoUrl);
        if (!videoData) videoData = await getOkatsuVideo(videoUrl);

        if (!videoData || !videoData.download) {
            throw new Error("Download servers are not responding.");
        }

        // 4. Send the Video
        await sock.sendMessage(chatId, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${videoData.title || 'video'}.mp4`,
            caption: `*${videoData.title || 'Madrin Video'}*\n\n> *_Downloaded by Madrin_*`
        }, { quoted: message });

    } catch (error) {
        console.error('[VIDEO ERROR]', error.message);
        await sock.sendMessage(chatId, { text: `> ❌ *Error:* ${error.message}` }, { quoted: message });
    }
}

module.exports = videoCommand;
