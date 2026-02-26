const axios = require('axios');

module.exports = async function getProfilePic(sock, chatId, message, args) {
  try {
    const context = message.message?.extendedTextMessage?.contextInfo;
    let targetJid;

    // 1. Logic to determine the target (Phone Number, Mention, or Reply)
    if (args[0] && args[0].length > 5) {
      // Direct number: .pp 923427582273
      targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    } else if (context?.mentionedJid && context.mentionedJid.length > 0) {
      // Mention: .pp @user
      targetJid = context.mentionedJid[0];
    } else if (context?.participant) {
      // Reply to message
      targetJid = context.participant;
    }

    // 2. If no target found, show the Usage Guide
    if (!targetJid) {
      const usageMessage = `ℹ️ *Usage:*
• .pp <phone number> (e.g., .pp 255780309253)
• Reply to someone's message
• Mention someone (@user) in a group`;
      
      return await sock.sendMessage(chatId, { text: usageMessage }, { quoted: message });
    }

    // 3. Delete command message
    await sock.sendMessage(chatId, { 
        delete: { 
            remoteJid: chatId, 
            fromMe: message.key.fromMe, 
            id: message.key.id, 
            participant: message.key.participant 
        } 
    });

    // 4. Identify YOUR private chat ID
    const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // 5. Fetch and Download the Image
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(targetJid, 'image');
    } catch {
      return; 
    }

    const res = await axios.get(ppUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);

    // 6. Extract clean phone number for the caption
    const phoneNumber = targetJid.split('@')[0];

    // 7. Send to your private DM
    await sock.sendMessage(myId, {
      image: buffer,
      caption: `🥷 *Stealth PP Capture*\n\n*Number:* ${phoneNumber}\n*Link:* https://wa.me/${phoneNumber}`,
      mentions: [targetJid]
    });

  } catch (err) {
    console.error('PP Stealth Error:', err);
  }
};
