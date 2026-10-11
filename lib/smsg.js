const { proto, getContentType, jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = (conn, m) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.isGroup ? m.key.participant : m.fromMe ? conn.user.id : m.chat;
        m.sender = jidNormalizedUser(m.sender);
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        try {
            m.quoted = m.msg?.contextInfo?.quotedMessage || null;
            if (m.quoted) {
                let type = getContentType(m.quoted);
                m.quoted.mtype = type;
                m.quoted.id = m.msg.contextInfo.stanzaId;
                m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
                m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
                m.quoted.sender = jidNormalizedUser(m.msg.contextInfo.participant);
                m.quoted.fromMe = m.quoted.sender === jidNormalizedUser(conn.user.id);
                m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
                m.quoted.mentionedJid = m.msg.contextInfo.mentionedJid || [];
                m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                    key: {
                        remoteJid: m.quoted.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    },
                    message: m.quoted
                });
            }
        } catch {
            m.quoted = null;
        }
        try {
            m.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
        } catch {
            m.mentionedJid = [];
        }
        let v = m.quoted ? m.quoted : m.msg;
        let c = v.caption || v.text || v.conversation || '';
        m.text = typeof c === 'string' ? c : c.text || '';
    }
    
    conn.reply = (jid, text = '', quoted = '', options) => {
        return conn.sendMessage(jid, { text: text, ...options }, { quoted: quoted });
    };

    return m;
};