const TelegramBot = require("node-telegram-bot-api")

const token = '552905592:AAFCbkNfdc2zn7ABBv7T1dKAg7RJuXOhC78'
const bot = new TelegramBot(token, {polling: true})

grandMenu();

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт", replyKeyBoard("start"))
})

function replyKeyBoard(param) {
    let keys;
    let keyboard;
    if (param == "start") {
        keys = JSON.stringify({
            keyboard: [
                [
                    {text: "Наявність товару/Купити"}
                ], [
                    {text: "Підтримка/Питання"}
                ], [
                    {text: "Профіль користувача"}
                ]
            ], 
            resize_keyboard: true
        });
        keyboard = {reply_markup: JSON.parse(keys)};
    }
    return keyboard;
}

function grandMenu() {
    bot.on("message", (msg)=>{ 
        switch (msg.text) {
            case 'Наявність товару/Купити': 
                bot.sendMessage(msg.chat.id, "Введіть кількість чогось")
                bot.on("text", (txt)=>{
                    bot.sendMessage(msg.chat.id, "Все вірно додано")
                    bot.removeListener("text");
                })
                break;
            case 'Підтримка/Питання': 
                bot.sendMessage(msg.chat.id, "Лише в про версії")
                break;
            case 'Профіль користувача': 
                bot.sendMessage(msg.chat.id, "Лише в про версії")
                break;
        }
    })
}