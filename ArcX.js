console.clear()
require("./settings")
const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
makeInMemoryStore,
jidNormalizedUser,
proto,
getContentType,
downloadContentFromMedia,
downloadMediaMessage,
generateWAMessage,
generateWAMessageFromContent,
generateForwardMessageContent,
generateWAMessageContent,
prepareWAMessageMedia,
extractGroupMetadata,
areJidsSameUser,
getDevice,
isJidGroup,
isJidUser,
isJidStatusBroadcast,
isJidNewsletter,
jidDecode,
jidEncode,
S_WHATSAPP_NET,
WA_DEFAULT_EPHEMERAL,
makeCacheableSignalKeyStore,
getAggregateVotesInPollMessage,
WAProto,
delay
} = require('@whiskeysockets/baileys');

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

module.exports = async(sock, m, chatUpdate) => {
try {

const { type, quotedMsg, mentioned, now, fromMe } = m;
const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.documentMessage?.caption || m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.message?.templateButtonReplyMessage?.selectedId || (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') || m.message?.buttonsMessage?.contentText || m.message?.listMessage?.description || m.message?.listMessage?.title || m.message?.viewOnceMessage?.message?.conversation || m.message?.viewOnceMessage?.message?.extendedTextMessage?.text || m.message?.viewOnceMessage?.message?.imageMessage?.caption || m.message?.viewOnceMessage?.message?.videoMessage?.caption || m.message?.viewOnceMessageV2?.message?.conversation || m.message?.viewOnceMessageV2?.message?.extendedTextMessage?.text || m.message?.viewOnceMessageV2?.message?.imageMessage?.caption || m.message?.viewOnceMessageV2?.message?.videoMessage?.caption || m.message?.viewOnceMessageV2Extension?.message?.conversation || m.message?.viewOnceMessageV2Extension?.message?.extendedTextMessage?.text || m.message?.viewOnceMessageV2Extension?.message?.imageMessage?.caption || m.message?.viewOnceMessageV2Extension?.message?.videoMessage?.caption || m.message?.editedMessage?.message?.conversation || m.message?.editedMessage?.message?.extendedTextMessage?.text || m.message?.editedMessage?.message?.imageMessage?.caption || m.message?.editedMessage?.message?.videoMessage?.caption || '';
const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^><]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^><]/gi)[0] : '';
const isCmd = body.startsWith(prefix);
const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1);
const pushname = m.pushName || "No Name";
const text = q = args.join(" ");
const isGroup = m.key.remoteJid.endsWith('@g.us');
const sender = isGroup ? (m.key.participant || m.participant) : m.key.remoteJid;
const senderNumber = sender ? sender.split('@')[0] : '';
const botNumber = sock.user.id ? jidNormalizedUser(sock.user.id) : '';
const from = m.key.remoteJid;
const ownerNumbers = global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
const isOwner = ownerNumbers.includes(sender) || m.key.fromMe;
const groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => ({})) : {};
const groupName = isGroup ? groupMetadata.subject : '';
const groupMembers = isGroup ? groupMetadata.participants || [] : [];
const groupAdmins = isGroup ? groupMembers.filter(v => v.admin !== null).map(v => v.id) : [];
const isGroupAdmins = isGroup ? groupAdmins.includes(sender) : false;
const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
const isQuoted = m.quoted ? true : false;
const quotedType = isQuoted ? getContentType(m.quoted.message) : '';
const mime = (m.quoted ? m.quoted.mtype : m.mtype) || '';
const isMedia = /image|video|sticker|audio/.test(mime);

if (m.message) {
    const isChannel = from.endsWith('@newsletter');
    const chatType = isGroup ? "GROUP" : isChannel ? "CHANNEL" : "PRIVATE";

    console.log(chalk.hex("#FF0000").bold(`cr : ⏤ 𝖠𝗋𝖼𝗏𝗒𝗇`));
    console.log(chalk.hex("#FFD700").bold(`🎭 SUCCESSFULLY CONNECTED 🎭`));
    console.log(chalk.hex("#1E90FF").bold("┌───────────────────────────────┐"));
    console.log(chalk.hex("#1E90FF").bold("│       NEW MESSAGE LOG         │"));
    console.log(chalk.hex("#1E90FF").bold("├───────────────────────────────┤"));
    console.log(chalk.hex("#FF8C00")(`│ 📅 ${chalk.hex("#FFFFFF")("Date        :")} ${chalk.hex("#DA00FF")(new Date().toLocaleString())}`));
    console.log(chalk.hex("#00CED1")(`│ 💭 ${chalk.hex("#FFFFFF")("Type        :")} ${chalk.hex("#DA00FF")(chatType)}`));
    console.log(chalk.hex("#7CFC00")(`│ 👤 ${chalk.hex("#FFFFFF")("Sender      :")} ${chalk.hex("#DA00FF")(pushname || "Unknown")}`));
    console.log(chalk.hex("#00FA9A")(`│ 🆔 ${chalk.hex("#FFFFFF")("JID         :")} ${chalk.hex("#DA00FF")(sender)}`));
    console.log(chalk.hex("#FF69B4")(`│ 💬 ${chalk.hex("#FFFFFF")("Chat        :")} ${chalk.hex("#DA00FF")(from)}`));
    console.log(chalk.hex("#FFA500")(`│ 📝 ${chalk.hex("#FFFFFF")("Command     :")} ${chalk.hex("#DA00FF")(isCmd ? command : "-")}`));
    console.log(chalk.hex("#20B2AA")(`│ 📨 ${chalk.hex("#FFFFFF")("Message     :")} ${chalk.hex("#DA00FF")((body || "[ Media ]").slice(0, 60))}`));
    if (isGroup) {
        console.log(chalk.hex("#9370DB")(`│ 👥 ${chalk.hex("#FFFFFF")("Group       :")} ${chalk.hex("#DA00FF")(groupName)}`));
    }
    console.log(chalk.hex("#1E90FF").bold("└───────────────────────────────┘"));
}

const thumb = fs.readFileSync("./src/menu.jpg")

function getRuntime(seconds) {
    const sNum = Number(seconds);
    const d = Math.floor(sNum / (3600 * 24));
    const h = Math.floor((sNum % (3600 * 24)) / 3600);
    const m = Math.floor((sNum % 3600) / 60);
    const s = Math.floor(sNum % 60);

    return `${d}d ${h}h ${m}m ${s}s`;
}

const runtime = getRuntime(process.uptime())

if (!isOwner && !sock.public) {
    return;
}
switch (command) {
case "menu": {
    await sock.sendMessage(m.chat, {
        buttonsMessage: {
            locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: -0,
                name: global.botName,
                address: pushname,
                jpegThumbnail: thumb
            },
            contentText: `Hey there, ${pushname}! 👋 I'm ${global.botName}, your friendly WhatsApp bot built by ArcvynX as a free base bot for GitHub.
╭╮ » Bot Information
││ *Bot Name*: ${global.botName}
││ *Version*: 1.0.0
││ *Status*: ${sock.public ? "public" : "self"}
││ *Type*: Case - CJS
││ *Runtime*: ${runtime}
╰╯`,
            footerText: global.botName,
            buttons: [
                {
                    buttonId: "example",
                    buttonText: {
                        displayText: "Example List Button"
                    },
                    type: 1,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify({
                            title: "Example",
                            sections: [
                                {
                                    title: "Example",
                                    highlight_label: "Example",
                                    rows: [
                                        {
                                            title: "Example",
                                            description: "Just Example You Stupid",
                                            id: "X"
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                }
            ],
            headerType: 6
        }
    })
}
break

case "self":
case "public": {
    if (!isOwner) return m.reply("Fitur khusus Owner!")
    
    if (command === "self") {
        sock.public = false
        await sock.sendMessage(m.chat, {
            image: thumb,
            caption: "Bot Sudah Berhasil Self",
            footer: global.botName
        })
    } else if (command === "public") {
        sock.public = true
        await sock.sendMessage(m.chat, {
            image: thumb,
            caption: "Bot Sudah Berhasil Public",
            footer: global.botName
        })
    }
}
break

default: {
    if (isOwner && body) {
        let evaled;
        try {
            if (body.startsWith('>')) {
                let code = body.slice(1);
                try {
                    evaled = await eval(`(async () => { return ${code} })()`);
                } catch (err) {
                    evaled = await eval(`(async () => { ${code} })()`).catch(e => e);
                }
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await sock.reply(from, evaled, m);
            } else if (body.startsWith('$')) {
                let code = body.slice(1);
                let { exec } = require('child_process');
                exec(code, (err, stdout) => {
                    if (err) return sock.reply(from, `${err}`, m);
                    if (stdout) return sock.reply(from, stdout, m);
                });
            } else if (body.startsWith('=>')) {
                let code = body.slice(2);
                try {
                    let evaled = await eval(`(async () => { ${code} })()`);
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await sock.reply(from, evaled, m);
                } catch (err) {
                    await sock.reply(from, `${err}`, m);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}
break
}

} catch (err) {
console.log(`[ Error At File ${__filename} ]: ${err}`)
}
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.yellowBright(`[ UPDATE ] File ${__filename} telah diubah, memuat ulang...`));
    delete require.cache[file];
    require(file);
});