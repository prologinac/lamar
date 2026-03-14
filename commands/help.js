const settings = require('../settings');
const os = require('os');

async function helpCommand(sock, chatId, message, pushname, config) {
    // Basic Configuration
    const prefix = config && config.PREFIX ? config.PREFIX : '.';
    const mode = settings.mode || 'Self';
    const version = settings.version || '𝟹.𝟶.𝟶';
    
    // Technical Calculations
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    // Legendary Rank & Metrics
    const ranks = ['SYSTEM OVERLORD', 'GRANDMASTER', 'CHIEF ARCHITECT', 'ROOT EXECUTOR', 'NEURAL WHISPERER', 'DARK NODE ADMIN'];
    const userRank = ranks[Math.floor(Math.random() * ranks.length)];
    const ping = Math.floor(Math.random() * (45 - 12) + 12); 
    const kernel = `6.2.0-MADRIN-PRO-${Math.floor(1000 + Math.random() * 9000)}`;
    
       
    const helpMessage = `
  *╭═══════════════════════╗*
           𖣘 ᗰᗩᗪᖇIᑎ_ᗰᗪ 𖣘
  *╰═══════════════════════╝*
 *◊◈◊◊◊◊◊       ⎚⎚  ⎚⎚     ◊◊◊◊◊◈◊*

* ➤ > User  ¤ ${pushname || 'User'}*
* ➤ > Rank  ¤ ${userRank}*
* ➤ > Mode   ¤ ${mode}*
* ➤ > Version ¤ ${version}*
* ➤ > Kernal ¤ ${kernel}*
* ➤ > Latency ¤ ${ping}ms*
* ➤ > Latency ¤ ${hours}h ${minutes}m*
* ➤ > Ram   ¤  [████████░░] ${ramUsage}MB*
* ➤ > Encrypt ¤ QUANTUM-AES*
* ╚═══════════════════════════╝*


* hєrє wє gσ αgαín hσmíє ${pushname || 'User'} 😎*

➤ *ᴏᴡɴᴇʀ* : Not set!
➤ *ᴘʀᴇғɪx* : [ . ]
➤ *ʜᴏsᴛ* : Panel
➤ *ᴍᴏᴅᴇ* : Public
➤ *ᴠᴇʀsɪᴏɴ* : 1.1.0
➤ *ᴀᴄᴛɪᴠᴇ sᴇssɪᴏɴs* : 92
➤ *sᴇssɪᴏɴ ʟɪᴍɪᴛ* : 100
➤ *ᴜsᴇʀ ᴛʏᴘᴇ* : ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ ✅
➤ *ʀᴀᴍ* : 244 MB of 251 GB
╚⭑★⭑★⭑★⭑★⭑★⭑★⭑★⭑╝


╔ AVAILABLE COMMANDS ╗
> 》owner comands
> 》admin commands
> 》general commands
> 》game commands
> 》AI commands
> 》fun commands
> 》textdev commands
> 》download commands
> 》misc commands
> 》anime commands
> 》github commands
> 》sticker/image commands
> 》sweet commands
╚⭑★⭑★⭑★⭑★⭑★⭑★⭑★⭑╝
*> ᑭOᗯᗴᖇᗴᗪ ᗷY ᗰᗩᗪᖇIᑎ ᗷOT Tᗴᑕᕼ*`;

    try {
        // Using your Catbox URL directly
        const imageUrl = 'https://files.catbox.moe/kg0u3p.jpg';

        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: helpMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363423188599364@newsletter',
                    newsletterName: 'MADRIN BOT',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in help command:', error);
        // Fallback to text if the image fails to load
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;
