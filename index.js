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
    makeCacheableSignalKeyStore,
    delay 
} = require("@whiskeysockets/baileys")

// Keep-Alive Server
const port = process.env.PORT || 3000
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Madrin Bot Session Engine Active');
}).listen(port);

async function startBot() {
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');

    // 1. Restore Logic for Render
    if (process.env.SESSION_ID && !fs.existsSync('./session/creds.json')) {
        try {
            let stringId = process.env.SESSION_ID.trim();
            if (stringId.includes('~')) stringId = stringId.split('~')[1];
            const decoded = Buffer.from(stringId, 'base64').toString('utf-8');
            fs.writeFileSync('./session/creds.json', decoded);
            console.log(chalk.green("✅ Madrin Session Restored from Render Variables."));
        } catch (e) { console.log("Session restore error"); }
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const { version } = await fetchLatestBaileysVersion()

    const client = makeWASocket({
        version,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Chrome", "Windows", "114.0.5735.198"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        }
    })

    // 2. Pairing Code Logic
    if (!client.authState.creds.registered) {
        const settings = require('./settings');
        const phoneNumber = settings.ownerNumber.replace(/[^0-9]/g, '');
        console.log(chalk.yellow(`⏳ Requesting Pairing Code for Madrin: ${phoneNumber}`));
        await delay(6000);
        try {
            let code = await client.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black(chalk.bgCyan(` MADRIN PAIRING CODE: `)), chalk.white.bold(code));
        } catch (e) { console.log("Pairing error", e); }
    }

    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log(chalk.bgCyan.black(" ✅ MADRIN IS LIVE! "));

            // 3. Generate and Send Session ID
            const credsData = fs.readFileSync('./session/creds.json');
            const base64Session = Buffer.from(credsData).toString('base64');
            const fullSessionId = `MADRIN~${base64Session}`;

            const welcomeMsg = `*✅ MADRIN (Blackthrone) CONNECTED!*\n\nUse this *SESSION_ID* in Render to keep the bot active 24/7:\n\n\`${fullSessionId}\``;
            
            await client.sendMessage(client.user.id, { text: welcomeMsg });
            console.log(chalk.cyan("📩 Session ID sent to your WhatsApp number!"));
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBot();
        }
    })

    client.ev.on('creds.update', saveCreds)
    client.ev.on('messages.upsert', async chatUpdate => {
        await handleMessages(client, chatUpdate, true);
    })
}

startBot();
