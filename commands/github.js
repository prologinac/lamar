const axios = require('axios');
const moment = require('moment-timezone');

async function githubCommand(sock, chatId, message) {
    // Hardcoded path so it ONLY fetches this repo
    const repoPath = "prologinac/lamar";

    try {
        await sock.sendMessage(chatId, {
            react: { text: '⚔️', key: message.key }
        });

        // Fetching the specific data
        const response = await axios.get(`https://api.github.com/repos/${repoPath}`);
        const json = response.data;

        let legendaryTxt = `*┏━━━━━━━━━━━━━━━━━━━━┓*\n`;
        legendaryTxt += `*┃      🔱  GITHUB ASCENDANCY  🔱      ┃*\n`;
        legendaryTxt += `*┗━━━━━━━━━━━━━━━━━━━━┛*\n\n`;
        
        legendaryTxt += `*⛩️ REPOSITORY:* ${json.name.toUpperCase()}\n`;
        legendaryTxt += `*👑 ARCHITECT:* ${json.owner.login}\n\n`;
        
        legendaryTxt += `*📜 DESCRIPTION:* \n_${json.description || 'No description provided.'}_\n\n`;
        
        legendaryTxt += `*📊 STATISTICS:*\n`;
        legendaryTxt += `*◈ 🌟 STARS:* ${json.stargazers_count.toLocaleString()}\n`;
        legendaryTxt += `*◈ 🍴 FORKS:* ${json.forks_count.toLocaleString()}\n`;
        legendaryTxt += `*◈ 👁️ WATCH:* ${json.watchers_count.toLocaleString()}\n`;
        legendaryTxt += `*◈ 📁 SIZE:* ${(json.size / 1024).toFixed(2)} MB\n\n`;
        
        legendaryTxt += `*⏳ LAST ASCENSION:* \n${moment(json.updated_at).format('MMMM Do YYYY, h:mm:ss a')}\n\n`;
        
        legendaryTxt += `*🔗 GATEWAY:* \nhttps://github.com/prologinac/lamar\n\n`;
        
        legendaryTxt += `*⚔️ POWERED BY YOUR BOT ⚔️*`;

        await sock.sendMessage(chatId, { 
            image: { url: json.owner.avatar_url }, 
            caption: legendaryTxt,
            contextInfo: {
                externalAdReply: {
                    title: `OFFICIAL REPO: ${json.name}`,
                    body: `Main Language: ${json.language || 'JavaScript'}`,
                    mediaType: 1,
                    thumbnailUrl: json.owner.avatar_url,
                    sourceUrl: "https://github.com/prologinac/lamar"
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('GitHub Error:', error.message);
        await sock.sendMessage(chatId, { text: "❌ Failed to fetch repository data." });
    }
}

module.exports = githubCommand;
