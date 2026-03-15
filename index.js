require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const http = require('http')
const pino = require("pino")
const { handleMessages } = require('./main');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

// Keep-Alive Server
const port = process.env.PORT || 3000
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is Alive');
}).listen(port, '0.0.0.0');

async function startBot() {
    console.log(chalk.yellow("🚀 Starting Sila MD..."));

    if (!fs.existsSync('./session')) fs.mkdirSync('./session');

    // BETTER SESSION RESTORE
    if (process.env.SESSION_ID) {
        try {
            // Clean the string (removes spaces or prefixes like 'IK~')
            let sessionId = process.env.SESSION_ID.trim();
            if (sessionId.includes('~')) sessionId = sessionId.split('~')[1];
            
            const decoded = Buffer.from(sessionId, 'base64').toString('utf-8');
            fs.writeFileSync('./session/creds.json', decoded);
            console.log(chalk.green("📂 Session credentials restored successfully."));
        } catch (e) { 
            console.log(chalk.red("❌ Failed to decode SESSION_ID. Check your Render Environment variable!")); 
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const { version } = await fetchLatestBaileysVersion()

    const client = makeWASocket({
        version,
        printQRInTerminal: true, // This lets us see a QR in logs if session fails
        logger: pino({ level: 'info' }), // Increased logging to find errors
        browser: ["Chrome", "Windows", "114.0.5735.198"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        }
    })

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) console.log(chalk.magenta("⚠️ Session invalid! New QR Code generated in logs."));
        
        if (connection === 'open') {
            console.log(chalk.bgGreen.black(" ✅ WHATSAPP CONNECTED SUCCESSFULLY! "));
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.red(`🔌 Connection Closed. Reason: ${reason}`));
            
            if (reason !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow("🔄 Attempting to reconnect..."));
                setTimeout(() => startBot(), 5000);
            } else {
                console.log(chalk.bgRed("🚫 LOGGED OUT: Your Session ID is dead. Please generate a new one."));
            }
        }
    })

    client.ev.on('creds.update', saveCreds)
    client.ev.on('messages.upsert', async chatUpdate => {
        await handleMessages(client, chatUpdate, true);
    })
}

startBot();
