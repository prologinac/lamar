require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay 
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const settings = require('./settings')

async function startXeonBotInc() {
    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Windows", "Chrome", "114.0.5735.198"], 
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        markOnlineOnConnect: false,
        syncFullHistory: false
    })

    // SINGLE PAIRING LOGIC
    if (!XeonBotInc.authState.creds.registered) {
        // Specifically grab the first number to avoid the "replace" crash
        let targetNumber = Array.isArray(settings.ownerNumber) ? settings.ownerNumber[0] : settings.ownerNumber;
        targetNumber = targetNumber.replace(/[^0-9]/g, '');

        console.log(chalk.yellow(`⏳ Handshaking for: ${targetNumber}...`));
        
        // Essential delay to prevent "Connection Closed" 428 error
        await delay(15000); 

        try {
            let code = await XeonBotInc.requestPairingCode(targetNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black(chalk.bgGreen(`Pairing Code: `)), chalk.white.bold(code));
        } catch (error) {
            console.error(chalk.red(`Pairing Failed:`), error.message);
        }
    }

    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
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
