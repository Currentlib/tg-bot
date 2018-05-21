const TelegramBot = require("node-telegram-bot-api")
const config = require("./config.json")
const bot = new TelegramBot(config.token, {polling: true})
var reload = require('require-reload')(require);
grandMenu();

//Очікування уоманди /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт", replyKeyBoard("start"))
})

//Очікування уоманди /start
bot.onText(/\/test/, (msg) => {
    console.log(msg)
})

//Очікування команди вхду в адмінку



//Набір менюшок "Клавіатур"
function replyKeyBoard(param) {
    let keys;
    let keyboard;
    if (param == "start") {
        keys = JSON.stringify({
            keyboard: [
                [
                    {text: "Купити"}
                ], [
                    {text: "Питання"}
                ], [
                    {text: "Профіль користувача"}
                ]
            ], 
            resize_keyboard: true
        });
        keyboard = {reply_markup: JSON.parse(keys)};
    }
    if (param == "admin") {
        keys = JSON.stringify({
            keyboard: [
                [
                    {text: "Товар"}
                ], [
                    {text: "Модератори"}
                ], [
                    {text: "Згенерувати ключ"}
                ], [
                    {text: "Вийти"}
                ]
            ], 
            resize_keyboard: true
        });
        keyboard = {reply_markup: JSON.parse(keys)};
    }
    return keyboard;
}

//Функція запуску роботи адмін меню
function adminMenu() {
    bot.on("text", (msg)=>{ 
        if (msg.chat.id == config.admin) {
            switch (msg.text) {
                case 'Товар':
                    bot.sendMessage(msg.chat.id, "Список товарів")
                    break;
                case 'Модератори': 
                    bot.sendMessage(msg.chat.id, "Список модерів") 
                    break;
                case 'Згенерувати ключ': 
                    bot.sendMessage(msg.chat.id, "Тут буде ключ")
                    break;
                case 'Вийти': 
                    bot.removeListener("text")
                    bot.sendMessage(msg.chat.id, "Успішно", replyKeyBoard("start"))
                    break;
            }
        } else {
            bot.sendMessage(msg.chat.id, 'Ти НЕ адмін!!!')
        }
    })
}

//Функція запуску загального меню
function grandMenu() {
    bot.on("message", (msg)=>{ 
        switch (msg.text) {
            case 'Купити':
                bot.sendMessage(msg.chat.id, msg.chat.id)
                break;
            case 'Питання': 
                bot.sendMessage(msg.chat.id, "Напишіть повідомленя адміну")
                break;
            case 'Профіль користувача': 
                bot.sendMessage(msg.chat.id, "Лише в про версії")
                break;
        }
    })
}