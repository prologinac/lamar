require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const http = require('http')
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
    res.end('Bot is Live');
}).listen(port);

async function startBot() {
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');

    // Restore Session
    if (process.env.SESSION_ID && !fs.existsSync('./session/creds.json')) {
        try {
            const body = process.env.SESSION_ID.includes('~') 
                ? process.env.SESSION_ID.split('~')[1] 
                : process.env.SESSION_ID;
            const decoded = Buffer.from(body, 'base64').toString('utf-8');
            fs.writeFileSync('./session/creds.json', decoded);
        } catch (e) { console.log("Session Decode Error"); }
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const { version } = await fetchLatestBaileysVersion()

    const client = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: require('pino')({ level: 'silent' }),
        browser: ["Windows", "Chrome", "20.0.04"], // Matches your photo
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, require('pino')({ level: "fatal" })),
        }
    })

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') console.log(chalk.green("✅ Connected to WhatsApp!"));
        if (connection === 'close') {
            const shouldRestart = (new Boom(lastDisconnect?.error)?.output?.statusCode) !== DisconnectReason.loggedOut;
            if (shouldRestart) startBot();
        }
    })

    client.ev.on('creds.update', saveCreds)
    client.ev.on('messages.upsert', async chatUpdate => {
        await handleMessages(client, chatUpdate, true);
    })
}

startBot();
