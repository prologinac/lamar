const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function takeCommand(sock, chatId, message, args) {
    try {
        // 1️⃣ IMMEDIATELY delete your command to hide your tracks
        await sock.sendMessage(chatId, { 
            delete: { 
                remoteJid: chatId, 
                fromMe: message.key.fromMe, 
                id: message.key.id, 
                participant: message.key.participant 
            } 
        });

        // 2️⃣ Check if message is a reply to a sticker
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage?.stickerMessage) return; // Exit silently

        // 3️⃣ Get the packname or use default
        const packname = args.join(' ') || '〲ᴹᵃᶠⁱᵃ࿐⚭⚯⚭';
        const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        try {
            // 4️⃣ Download the sticker
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: message.message.extendedTextMessage.contextInfo.stanzaId,
                    message: quotedMessage,
                    messageType: 'stickerMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!stickerBuffer) return;

            // 5️⃣ Add metadata using webpmux
            const img = new webp.Image();
            await img.load(stickerBuffer);

            const json = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': packname,
                'emojis': ['🤖']
            };

            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);

            img.exif = exif;
            const finalBuffer = await img.save(null);

            // 6️⃣ Send ONLY to YOUR private chat
            await sock.sendMessage(myId, {
                sticker: finalBuffer
            });

        } catch (error) {
            console.error('Sticker processing error:', error);
        }

    } catch (error) {
        console.error('Error in take command:', error);
    }
}

module.exports = takeCommand;
