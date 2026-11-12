require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_CHAT_ID);

if (!TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

function isAdmin(msg) {
  return msg.from.id === ADMIN_ID;
}

function loadB() {
  try {
    return JSON.parse(fs.readFileSync('b.js', 'utf8'));
  } catch (e) {
    // if b.js is a module, require it instead:
    return require('./b.js');
  }
}

bot.onText(/\/start/, (msg) => {
  if (!isAdmin(msg)) return;
  bot.sendMessage(msg.chat.id, 'Bot running. Commands: /run /status /show');
});

bot.onText(/\/run/, (msg) => {
  if (!isAdmin(msg)) return;
  try {
    const data = loadB();
    const count = typeof data === 'object' ? Object.keys(data).length : 'n/a';
    bot.sendMessage(msg.chat.id, `✅ Executed. b.js has ${count} keys.`);
  } catch (e) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`);
  }
});

bot.onText(/\/status/, (msg) => {
  if (!isAdmin(msg)) return;
  const uptime = process.uptime().toFixed(0);
  bot.sendMessage(msg.chat.id, `✅ Alive. Uptime: ${uptime}s`);
});

bot.onText(/\/show/, (msg) => {
  if (!isAdmin(msg)) return;
  try {
    const content = fs.readFileSync('b.js', 'utf8').slice(0, 3500);
    bot.sendMessage(msg.chat.id, '```\n' + content + '\n```', { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`);
  }
});

console.log('Bot started');