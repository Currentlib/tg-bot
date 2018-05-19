const TelegramBot = require("node-telegram-bot-api")

const token = 'token_here'
const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hello")
})