require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const pino = require("pino")
const express = require('express') // npm install express
const app = express()
const { handleMessages } = require('./main');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

// --- KEEP ALIVE SERVER ---
const port = process.env.PORT || 3000
app.get('/', (req, res) => { res.send('Bot is running!') })
app.listen(port, () => { console.log(chalk.cyan(`Server running on port ${port}`)) })

async function startXeonBotInc() {
    if (!fs.existsSync('./session')) { fs.mkdirSync('./session') }

    // Restore Windows Session from Environment Variable
    if (!fs.existsSync('./session/creds.json') && process.env.SESSION_ID) {
        console.log(chalk.blue("🔎 SESSION_ID found. Restoring Windows session..."));
        try {
            const decodedCreds = Buffer.from(process.env.SESSION_ID, 'base64').toString('utf-8');
            fs.writeFileSync('./session/creds.json', decodedCreds);
        } catch (err) {
            console.log(chalk.red("❌ Error decoding SESSION_ID: " + err.message));
        }
    }

    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, 
        browser: ["Windows", "Chrome", "20.0.04"], // Keep the Windows Icon
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        syncFullHistory: false
    })

    XeonBotInc.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.bgGreen.black(" WINDOWS SESSION ACTIVE "));
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.restartRequired) {
                startXeonBotInc();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red("🚫 Logged out. New SESSION_ID needed."));
                if (fs.existsSync('./session')) fs.rmSync('./session', { recursive: true, force: true });
            } else {
                setTimeout(() => startXeonBotInc(), 5000);
            }
        }
    });

    XeonBotInc.ev.on('creds.update', saveCreds);
    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try { await handleMessages(XeonBotInc, chatUpdate, true); } catch (err) { console.log(err); }
    });

    return XeonBotInc;
}

startXeonBotInc();
