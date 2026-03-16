const settings = require('../settings');
const os = require('os');

// ✅ CHANGED: We wrap it so main.js can pass (sock, chatId, message, args)
module.exports = async (sock, chatId, message, args) => {
    // We grab the pushname from the message
    const pushname = message.pushName || 'User';
    const prefix = '.'; // You can also use settings.PREFIX if you have it
    const category = args[0]?.toLowerCase();

    // --- 🖼️ DYNAMIC DP SYNC ---
    let botPfp;
    try {
        botPfp = await sock.profilePictureUrl(sock.user.id, 'image');
    } catch {
        botPfp = 'https://files.catbox.moe/kg0u3p.jpg'; // Fallback
    }

    // --- 📋 CATEGORIES (Your same list) ---
    const categories = {
        general: `╭══════════════════════⟡\n*┃⚙️ ❚❚ GENERAL COMMAND ❚❚ ⚙️ *\n╰══════════════════════⟡\n> .8ball\n> .admins\n> .alive...`, // keep your full text here
        admin: `╭══════════════════════⟡\n*┃😎 ❚❚ ADMIN COMMANDS ❚❚ 😎 *\n╰══════════════════════⟡\n...`, // keep your full text here
        owner: `╭══════════════════════⟡\n┃🦾 ❚❚ OWNER COMMANDS ❚❚ 🦾\n╰══════════════════════⟡\n...`, // keep your full text here
        // ... include all your other categories here exactly as you had them ...
    };

    if (category === 'all') {
        let allCommands = `🏮 *MADRIN-MD COMPLETE ARCHIVE* 🏮\n\n`;
        for (const key in categories) { allCommands += categories[key] + `\n\n`; }
        return await sock.sendMessage(chatId, { image: { url: botPfp }, caption: allCommands }, { quoted: message });
    }

    if (category && categories[category]) {
        return await sock.sendMessage(chatId, { image: { url: botPfp }, caption: categories[category] }, { quoted: message });
    }

    // MAIN MENU STATS
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = Math.floor(Math.random() * (45 - 12) + 12); 

    const helpMessage = `
> *╭═══════════════════════╗*
>       𖣘 ᗰᗩᗪᖇIᑎ_ᗰᗪ 𖣘
> *╰═══════════════════════╝*

> ➤  User: ${pushname}
> ➤  Rank: GRANDMASTER
> ➤  Latency: ${ping}ms
> ➤  Ram: ${ramUsage}MB

> ╔ AVAILABLE COMMANDS ╗
> 》${prefix}help all
> 》${prefix}help owner
> 》${prefix}help admin
> 》${prefix}help ai
> 》${prefix}help download
> 》${prefix}help image
> 》${prefix}help misc
> ╚⭑★⭑★⭑★⭑★⭑★⭑★⭑★⭑╝

> *ᑭOᗯᗴᖇᗴᗪ ᗷY ᗰᗩᗪᖇIᑎ ᗷOT Tᗴᑕᕼ*`;

    await sock.sendMessage(chatId, {
        image: { url: botPfp },
        caption: helpMessage,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363423188599364@newsletter',
                newsletterName: 'MADRIN BOT',
                serverMessageId: -1
            }
        }
    }, { quoted: message });
};
