const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function pttCommand(sock, chatId, message, args) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMsg = quoted?.audioMessage || quoted?.videoMessage;

    if (!audioMsg) {
        return sock.sendMessage(chatId, { text: '❌ Please reply to an audio or video file.' });
    }

    let targetId = chatId;
    if (args.length > 0) {
        let num = args[0].replace(/[^0-9]/g, '');
        if (num.length > 5) targetId = `${num}@s.whatsapp.net`;
    }

    try {
        // Download media to buffer
        const stream = await downloadContentFromMessage(audioMsg, quoted?.audioMessage ? 'audio' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const ranIn = `./${Date.now()}.mp3`;
        const ranOut = `./${Date.now()}.opus`;
        fs.writeFileSync(ranIn, buffer);

        // Convert to native WhatsApp Opus format
        ffmpeg(ranIn)
            .audioChannels(1)
            .audioFrequency(16000)
            .toFormat('opus')
            .on('end', async () => {
                const audioBuffer = fs.readFileSync(ranOut);
                
                // Manually created waveform buffer to ensure "Waves" appear
                const manualWaveform = Buffer.from([
                    0, 20, 40, 60, 80, 100, 120, 127, 120, 100, 80, 60, 40, 20, 0,
                    10, 30, 50, 70, 90, 110, 127, 110, 90, 70, 50, 30, 10, 0
                ]);

                // Sending as a NEW message to hide the "Forwarded" tag
                await sock.sendMessage(targetId, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true, // Triggers blue microphone
                    waveform: manualWaveform, // Triggers visible waves
                    contextInfo: {
                        // By leaving forwardingScore as 0/null and not providing a forwarding ID,
                        // the message appears as a fresh recording.
                        forwardingScore: 0, 
                        isForwarded: false
                    }
                });

                // Clean up Katabump storage
                if (fs.existsSync(ranIn)) fs.unlinkSync(ranIn);
                if (fs.existsSync(ranOut)) fs.unlinkSync(ranOut);
            })
            .on('error', (err) => {
                console.error(err);
                sock.sendMessage(chatId, { text: '❌ Recording failed.' });
            })
            .save(ranOut);

    } catch (e) {
        console.error(e);
    }
}

module.exports = pttCommand;
