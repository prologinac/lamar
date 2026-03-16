const fs = require('fs');
const path = require('path');
const settings = require('./settings');
require('./config.js');

// --- 📂 1. THE COMMAND LOADER ---
// This part scans your /commands folder and prepares them for use.
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const cmd = require(`./commands/${file}`);
            const cmdName = file.split('.')[0].toLowerCase();
            commands.set(cmdName, cmd);
        } catch (e) {
            console.error(`❌ Error loading ${file}:`, e.message);
        }
    }
}

// --- 🛠️ 2. CORE UTILS (Keep these for your security checks) ---
const { isBanned } = require('./lib/isBanned');
const { isSudo } = require('./lib/index');
const { storeMessage, handleMessageRevocation } = require('./commands/antidelete');

async function handleMessages(sock, chatUpdate) {
    try {
        const message = chatUpdate.messages[0];
        if (!message?.message) return;

        // Auto-read and Store for Anti-delete
        storeMessage(sock, message);
        if (message.message?.protocolMessage?.type === 0) {
            return await handleMessageRevocation(sock, message);
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || chatId;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);

        // 📝 Get the message text
        const rawText = (
            message.message?.conversation || 
            message.message?.extendedTextMessage?.text || 
            message.message?.imageMessage?.caption || ""
        ).trim();
        
        const userMessage = rawText.toLowerCase();

        // 🛡️ SECURITY CHECKS
        // 1. Check if user is Banned
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) return;

        // 2. Check Private/Public Mode
        let modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
        if (!modeData.isPublic && !message.key.fromMe && !senderIsSudo) return;

        // 🚦 3. TRAFFIC CONTROL (Prefix Check)
        const prefix = ".";
        if (!userMessage.startsWith(prefix)) return;

        // Split into command and arguments: ".play song name" -> cmd="play", args=["song", "name"]
        const args = rawText.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        // 🏃 4. EXECUTION
        const runCommand = commands.get(cmdName);

        if (runCommand) {
            // Visual feedback: Edit message to "Ѷ" for owner (as per your old code)
            if (message.key.fromMe && cmdName !== 'type') {
                await sock.sendMessage(chatId, { text: "Ѷ", edit: message.key }).catch(() => {});
            }

            // RUN THE FILE
            // We pass the basics (sock, chatId, message, args) 
            // plus an object with extra info if needed.
            await runCommand(sock, chatId, message, args, { 
                isGroup, 
                isSudo: senderIsSudo, 
                rawText, 
                pushname: message.pushName 
            });

            console.log(`✅ Command Executed: ${prefix}${cmdName}`);
        }

    } catch (error) {
        console.error('❌ Main Handler Error:', error);
    }
}

// Export for index.js to use
module.exports = { handleMessages };
