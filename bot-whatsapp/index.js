const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    auth: state,
    version
  })

  // Exibe o QR code manualmente
  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update
    if (qr) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('✅ BOT CONECTADO ao WhatsApp com sucesso!')
    }

    if (connection === 'close') {
      console.log('❌ Conexão fechada. Tentando reconectar...')
      startBot()
    }
  })

  // Salva as credenciais ao conectar
  sock.ev.on('creds.update', saveCreds)

  // Escuta mensagens recebidas
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text

    console.log(`Mensagem de ${sender}: ${text}`)

    if (text?.toLowerCase().includes('oi')) {
      await sock.sendMessage(sender, { text: 'Olá! Eu sou um bot 😊' })
    }
  })
}

startBot()

