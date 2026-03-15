async function windowCommand(sock, chatId, message, args) {
    const category = args[0]?.toLowerCase();

    // --- NAVIGATION SELECTION ---
    // If no category is provided, send the Button Selection
    if (!category) {
        return await sock.sendMessage(chatId, {
            poll: {
                name: "🏮 *MADRIN-BOT COMMAND CENTER* 🏮\n\nSelect a category below to view commands:",
                values: [
                    ".window general",
                    ".window admin",
                    ".window owner",
                    ".window image",
                    ".window ai",
                    ".window download",
                    ".window fun",
                    ".window misc",
                    ".window github"
                ],
                selectableCount: 1
            }
        }, { quoted: message });
    }

    // --- CATEGORIES (Alphabetized) ---

    const generalMenu = `╭══════════════════════⟡
*┃⚙️ ❚❚ GENERAL COMMAND ❚❚ ⚙️ *
╰══════════════════════⟡
> .8ball
> .admins
> .alive 
> .attp
> .fact
> .groupinfo
> .jid
> .joke
> .lyrics
> .news
> .owner
> .ping 
> .quote
> .ss
> .staff
> .trt
> .tts
> .url
> .vv
> .weather`;

    const adminMenu = `╭══════════════════════⟡
*┃😎 ❚❚ ADMIN COMMANDS ❚❚ 😎 *
╰══════════════════════⟡
> .antibadword
> .antilink
> .antitag
> .ban
> .chatbot
> .clear
> .delete
> .demote
> .goodbye
> .hidetag
> .kick
> .mute
> .promote
> .resetlink
> .setgdesc
> .setgname
> .setgpp
> .tagall
> .unmute
> .warn
> .warnings
> .welcome`;

    const ownerMenu = `╭══════════════════════⟡
┃🦾 ❚❚ OWNER COMMANDS ❚❚ 🦾
╰══════════════════════⟡
> .anticall
> .antidelete
> .autoread
> .autoreact
> .autostatus
> .autotyping
> .clearsession
> .cleartmp
> .mention
> .mode
> .pmblocker
> .setmention
> .setpp
> .settings`;

    const imageMenu = `╭═════════════════════════⟡
┃ 🗺️ ❚❚ IMAGE/STICKER COMMANDS ❚❚ 🗺️
╰═════════════════════════⟡
> .blur
> .crop
> .emojimix
> .igs
> .igsc
> .meme
> .removebg
> .remini
> .simage
> .sticker
> .take
> .tgsticker`;

    const aiMenu = `╭══════════════════════⟡
*┃ 🌝 ❚❚ AI COMMANDS ❚❚ 🌝 *
╰══════════════════════⟡
> .flux
> .gemini
> .gpt
> .imagine
> .sora`;

    const downloadMenu = `╭══════════════════════⟡
┃ 🎬 ❚❚ DOWNLOADER ❚❚ 🎬
╰══════════════════════⟡
> .facebook
> .instagram
> .play
> .song
> .spotify
> .tiktok
> .video
> .ytmp3
> .ytmp4`;

    const funMenu = `╭══════════════════════⟡
*┃🤪 ❚❚ FUN COMMANDS ❚❚ 🤪 *
╰══════════════════════⟡
> .character
> .compliment
> .flirt
> .goodnight
> .insult
> .roseday
> .shayari
> .ship
> .simp
> .stupid
> .wasted`;

    const miscMenu = `╭══════════════════════⟡
┃ 🎒 ❚❚ MISC ❚❚ 🎒
╰══════════════════════⟡
> .circle
> .comrade
> .gay
> .glass
> .heart
> .horny
> .its-so-stupid
> .jail
> .lgbt
> .lolice
> .namecard
> .oogway
> .passed 
> .triggered
> .tweet
> .ytcomment`;

    const githubMenu = `╭══════════════════════⟡
┃🗝️ ❚❚ GITHUB ❚❚🗝️
╰══════════════════════⟡
> .git
> .github 
> .sc
> .script`;

    // --- LOGIC ---

    let finalMenu = "";
    
    switch (category) {
        case 'general': finalMenu = generalMenu; break;
        case 'admin': finalMenu = adminMenu; break;
        case 'owner': finalMenu = ownerMenu; break;
        case 'image': finalMenu = imageMenu; break;
        case 'ai': finalMenu = aiMenu; break;
        case 'download': finalMenu = downloadMenu; break;
        case 'fun': finalMenu = funMenu; break;
        case 'misc': finalMenu = miscMenu; break;
        case 'git':
        case 'github': finalMenu = githubMenu; break;
        default:
            finalMenu = "❌ *Category not found!* Use the buttons above.";
    }

    await sock.sendMessage(chatId, { text: finalMenu }, { quoted: message });
}

module.exports = windowCommand;
