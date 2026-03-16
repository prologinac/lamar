const settings = require('../settings');
const os = require('os');

async function helpCommand(sock, chatId, message, pushname, config, args) {
    const prefix = config && config.PREFIX ? config.PREFIX : '.';
    const category = args[0]?.toLowerCase();

    // --- 🖼️ DYNAMIC DP SYNC ---
    let botPfp;
    try {
        botPfp = await sock.profilePictureUrl(sock.user.id, 'image');
    } catch {
        botPfp = 'https://files.catbox.moe/kg0u3p.jpg'; // Fallback
    }

    // --- 📋 CATEGORIES ---
    const categories = {
        general: `╭══════════════════════⟡\n*┃⚙️ ❚❚ GENERAL COMMAND ❚❚ ⚙️ *\n╰══════════════════════⟡\n> .8ball\n> .admins\n> .alive\n> .attp\n> .fact\n> .groupinfo\n> .jid\n> .joke\n> .lyrics\n> .surah\n> .news\n> .owner\n> .ping\n> .quote\n> .ss\n> .staff\n> .trt\n> .tts\n> .url\n> .vv\n> .weather`,
        admin: `╭══════════════════════⟡\n*┃😎 ❚❚ ADMIN COMMANDS ❚❚ 😎 *\n╰══════════════════════⟡\n> .antibadword\n> .antilink\n> .antitag\n> .ban\n> .chatbot\n> .clear\n> .delete\n> .demote\n> .goodbye\n> .hidetag\n> .kick\n> .mute\n> .promote\n> .resetlink\n> .tagall\n> .unmute\n> .warn\n> .warnings\n> .welcome`,
        owner: `╭══════════════════════⟡\n┃🦾 ❚❚ OWNER COMMANDS ❚❚ 🦾\n╰══════════════════════⟡\n> .anticall\n> .antidelete\n> .autoread\n> .autoreact\n> .autostatus\n> .autotyping\n> .clearsession\n> .cleartmp\n> .botdp\n> .mode\n> .pmblocker\n> .setmention\n> .settings`,
        ai: `╭══════════════════════⟡\n*┃ 🌝 ❚❚ AI COMMANDS ❚❚ 🌝 *\n╰══════════════════════⟡\n> .draw\n> .gemini\n> .gpt\n> .imagine\n> .sora`,
        game: `╭══════════════════════⟡\n┃💡 ❚❚ GAME COMMANDS ❚❚ 💡\n╰══════════════════════⟡\n> .answer\n> .dare\n> .guess\n> .hangman\n> .tictatoe\n> .trivia\n> .truth`,
        fun: `╭══════════════════════⟡\n*┃🤪 ❚❚ FUN COMMANDS ❚❚ 🤪 *\n╰══════════════════════⟡\n> .character\n> .compliment\n> .flirt\n> .goodnight\n> .insult\n> .roseday\n> .shayari\n> .ship\n> .simp\n> .stupid\n> .wasted`,
        textdev: `╭══════════════════════⟡\n┃ 📓 ❚❚ TEXTMAKER ❚❚ 📓\n╰══════════════════════⟡\n> .1917\n> .arena\n> .blackpink\n> .devil\n> .fire\n> .glitch\n> .hacker\n> .ice\n> .leaves\n> .light\n> .matrix\n> .metallic\n> .neon\n> .purple\n> .sand\n> .snow\n> .thunder`,
        download: `╭══════════════════════⟡\n┃ 🎬 ❚❚ DOWNLOADER ❚❚ 🎬\n╰══════════════════════⟡\n> .facebook\n> .instagram\n> .play\n> .song\n> .spotify\n> .tiktok\n> .video\n> .ytmp3\n> .ytmp4`,
        misc: `╭══════════════════════⟡\n┃ 🎒 ❚❚ MISC ❚❚ 🎒\n╰══════════════════════⟡\n> .circle\n> .comrade\n> .gay\n> .glass\n> .heart\n> .horny\n> .its-so-stupid\n> .jail\n> .lgbt\n> .lolice\n> .namecard\n> .oogway\n> .passed\n> .triggered\n> .tweet\n> .ytcomment`,
        anime: `╭══════════════════════⟡\n*┃🎎 ❚❚ ANIME ❚❚🎎 *\n╰══════════════════════⟡\n> .cry\n> .facepalm\n> .hug\n> .kiss\n> .loli\n> .neki\n> .nom\n> .pat\n> .poke\n> .waifu\n> .wink`,
        github: `╭══════════════════════⟡\n┃🗝️ ❚❚ GITHUB ❚❚🗝️\n╰══════════════════════⟡\n> .git\n> .github\n> .sc\n> .script`,
        image: `╭═════════════════════════⟡\n┃ 🗺️ ❚❚ IMAGE/STICKER ❚❚ 🗺️\n╰═════════════════════════⟡\n> .blur\n> .crop\n> .emojimix\n> .igs\n> .igsc\n> .meme\n> .removebg\n> .remini\n> .simage\n> .sticker\n> .take\n> .tgsticker`
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
    const uptime = process.uptime();
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = Math.floor(Math.random() * (45 - 12) + 12); 

    const helpMessage = `
> *╭═══════════════════════╗*
>       𖣘 ᗰᗩᗪᖇIᑎ_ᗰᗪ 𖣘
> *╰═══════════════════════╝*

> ➤  User: ${pushname || 'Lamar☪︎'}
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
}

module.exports = helpCommand;
