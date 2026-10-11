const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, jidNormalizedUser, proto, getContentType, downloadContentFromMedia } = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec, spawn, execSync } = require('child_process');
const util = require('util');
const jimp = require('jimp');
const fflate = require('fflate');
const os = require('os');
const smsg = require("./lib/smsg")

const usePairing = true

function question(text) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(text, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairing,
        auth: state,
        markOnlineOnConnection: true,
        generateHighQualityImage: true
    })

    if (!sock.authState.creds.registered) {
        const num = await question(chalk.bgBlack.red.bold("Input Your Number: "))
        const code = await sock.requestPairingCode(num, "XXXXXXXX")
        console.log(chalk.bgBlack.red.bold("Code: ", code))
    }

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason?.loggedOut) {
                startBot()
            }
        } else if (connection === "open") {
            console.log(chalk.bgBlack.red.bold("Bot Has Been Connected!"))
        }
    })

    sock.public = true

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;
            
            const m = smsg(sock, mek);
            require("./ArcX")(sock, m, chatUpdate);
        } catch (err) {
            console.log(err);
        }
    })

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    }
}

startBot()