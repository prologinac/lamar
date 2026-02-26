const http = require('http');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const pino = require("pino");

// Global variable to store the code for the web view
let globalPairingCode = "Generating code... please refresh in 15 seconds.";

// 1. WEB INTERFACE (View your pairing code at your Render URL)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
        <html>
            <head>
                <title>Xeon Bot Pairing</title>
                <style>
                    body { font-family: sans-serif; text-align: center; margin-top: 50px; background: #111; color: white; }
                    .code { font-size: 50px; font-weight: bold; color: #25D366; letter-spacing: 5px; background: #222; padding: 20px; border-radius: 10px; display: inline-block; }
                </style>
            </head>
            <body>
                <h1>Xeon Bot Pairing Code</h1>
                <div class="code">${globalPairingCode}</div>
                <p>Enter this code on your WhatsApp (Linked Devices > Link with Phone Number)</p>
                <script>setTimeout(() => { location.reload(); }, 5000);</script>
            </body>
        </html>
    `);
    res.end();
}).listen(process.env.PORT || 10000, '0.0.0.0');

require('./settings');
const { handleMessages } = require('./main');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay 
} = require("@whiskeysockets/baileys");
const settings = require('./settings');

async function startXeonBotInc() {
    let { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
    });

    // 2. PAIRING LOGIC
    if (!XeonBotInc.authState.creds.registered) {
        let targetNumber = Array.isArray(settings.ownerNumber) ? settings.ownerNumber[0] : settings.ownerNumber;
        targetNumber = targetNumber.replace(/[^0-9]/g, '');

        await delay(10000); 

        try {
            let code = await XeonBotInc.requestPairingCode(targetNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            
            // Update global variable so it shows on the website
            globalPairingCode = code;
            
            console.log(chalk.black.bgGreen(`Pairing Code: ${code}`));
        } catch (error) {
            console.error(chalk.red(`Pairing Failed:`), error.message);
            globalPairingCode = "Error: " + error.message;
        }
    }

    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
            globalPairingCode = "CONNECTED ✅";
            console.log(chalk.green(`✅ Bot is Online!`));
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                if (fs.existsSync('./session')) fs.rmSync('./session', { recursive: true, force: true });
            }
            startXeonBotInc();
        }
    });

    XeonBotInc.ev.on('creds.update', saveCreds);
    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        await handleMessages(XeonBotInc, chatUpdate, true);
    });

    return XeonBotInc;
}

startXeonBotInc();
