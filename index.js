const http = require('http');
const fs = require('fs');
const chalk = require('chalk');
const pino = require("pino");

let globalPairingCode = "WAITING... (If stuck, check your owner number in settings.js)";

// 1. WEB SERVER (Check this URL in your browser)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<html><body style="background:#000;color:#25D366;text-align:center;font-family:sans-serif;">
               <h1>RENDER PAIRING STATUS</h1>
               <div style="font-size:40px;border:2px solid #25D366;padding:20px;display:inline-block;margin-top:20px;">
               ${globalPairingCode}</div>
               <p style="color:#fff;">Auto-refreshing every 5s...</p>
               <script>setTimeout(()=>location.reload(), 5000)</script>
               </body></html>`);
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
    console.log(chalk.blue("--- STARTING BOOT SEQUENCE ---"));
    
    let { version } = await fetchLatestBaileysVersion();
    
    // FORCE CLEAR BROKEN SESSION
    if (fs.existsSync('./session/creds.json')) {
        console.log(chalk.yellow("Found existing credentials..."));
    } else {
        console.log(chalk.cyan("No session found. Starting Fresh Pairing..."));
    }

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

    // 2. FORCED PAIRING LOGIC
    if (!XeonBotInc.authState.creds.registered) {
        // CLEAN THE NUMBER
        let targetNumber = settings.ownerNumber;
        if (Array.isArray(targetNumber)) targetNumber = targetNumber[0];
        targetNumber = targetNumber.toString().replace(/[^0-9]/g, '');

        if (!targetNumber) {
            globalPairingCode = "ERROR: No ownerNumber found in settings.js";
            console.log(chalk.red(globalPairingCode));
        } else {
            console.log(chalk.yellow(`Target Number identified: ${targetNumber}`));
            console.log(chalk.white("Waiting 10s for socket to stabilize..."));
            
            await delay(10000); 

            try {
                console.log(chalk.magenta("Sending pairing request to WhatsApp..."));
                let code = await XeonBotInc.requestPairingCode(targetNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                globalPairingCode = code;
                console.log(chalk.green("---------------------------"));
                console.log(chalk.green("YOUR CODE IS: ") + chalk.bold.white(code));
                console.log(chalk.green("---------------------------"));
            } catch (error) {
                console.log(chalk.red("PAIRING REQUEST FAILED!"));
                console.error(error);
                globalPairingCode = "FAILED: " + error.message;
            }
        }
    }

    XeonBotInc.ev.on('creds.update', saveCreds);
    
    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
            globalPairingCode = "CONNECTED ✅";
            console.log(chalk.green(`✅ SUCCESS: Bot is Online!`));
        }
        if (connection === 'close') {
            console.log(chalk.red("Connection closed. Reconnecting..."));
            startXeonBotInc();
        }
    });

    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        await handleMessages(XeonBotInc, chatUpdate, true);
    });

    return XeonBotInc;
}

startXeonBotInc().catch(err => console.log("Main Error: " + err));
