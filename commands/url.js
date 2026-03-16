const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function getMediaBufferAndExt(message) {
    const m = message.message || {};
    // Extracting media based on type
    const types = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'sticker',
        documentMessage: 'document'
    };

    for (const [key, type] of Object.entries(types)) {
        if (m[key]) {
            const stream = await downloadContentFromMessage(m[key], type);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            
            let ext = '.bin';
            if (key === 'imageMessage') ext = '.jpg';
            else if (key === 'videoMessage') ext = '.mp4';
            else if (key === 'audioMessage') ext = '.mp3';
            else if (key === 'stickerMessage') ext = '.webp';
            else if (key === 'documentMessage') {
                ext = path.extname(m.documentMessage.fileName || 'file.bin') || '.bin';
            }
            
            return { buffer: Buffer.concat(chunks), ext };
        }
    }
    return null;
}

async function getQuotedMediaBufferAndExt(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    if (!quoted) return null;
    return getMediaBufferAndExt({ message: quoted });
}

async function urlCommand(sock, chatId, message) {
    try {
        // 1. Get Media (Direct or Quoted)
        let media = await getMediaBufferAndExt(message);
        if (!media) media = await getQuotedMediaBufferAndExt(message);

        if (!media) {
            return await sock.sendMessage(chatId, { text: 'Send or reply to a media (image, video, audio, sticker, document) to get a URL.' }, { quoted: message });
        }

        // 2. React to show progress
        await sock.sendMessage(chatId, { react: { text: '📤', key: message.key } });

        // 3. Upload directly to Catbox using FormData
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('userhash', ''); // Anonymous upload
        form.append('fileToUpload', media.buffer, { 
            filename: `madrin_${Date.now()}${media.ext}` 
        });

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
        });

        const url = response.data;

        if (!url || typeof url !== 'string' || !url.includes('http')) {
            throw new Error('Invalid response from Catbox');
        }

        // 4. Send the result with a nice preview
        await sock.sendMessage(chatId, { 
            text: `*🔗 MEDIA URL*\n\n${url}`,
            contextInfo: {
                externalAdReply: {
                    title: "MADRIN BOT UPLOADER",
                    body: "Your permanent Catbox Link",
                    thumbnailUrl: url, 
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('[URL] error:', error?.message || error);
        await sock.sendMessage(chatId, { text: '❌ Failed to convert media to URL. Catbox might be down or file is too large.' }, { quoted: message });
    }
}

module.exports = urlCommand;
