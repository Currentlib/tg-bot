const TelegramBot = require("node-telegram-bot-api")
const config = require("./config.json")
const bot = new TelegramBot(config.token, {polling: true})
var modercode = require('coupon-code');
grandMenu();
<<<<<<< HEAD
=======
//ssS
//my comment
>>>>>>> 52788b0e65b2f0ae5ea8a7b48f72f2f8c053f66c

//Очікування уоманди /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт", replyKeyBoard("start"))
})

//Очікування уоманди /start
bot.onText(/\/test/, (msg) => {
    console.log(msg)
})

//Очікування команди вхду в адмінку
bot.onText(new RegExp('\/admin'), msg=>{
    if (msg.chat.id == config.admin) {
        bot.sendMessage(msg.chat.id, 'Вітаю у адмін панелі!', replyKeyBoard("admin"));
        adminInit(msg.chat.id);
    } else {
        bot.sendMessage(msg.chat.id, 'Ти НЕ адмін!!!')
    }
})




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
                    bot.sendMessage(msg.chat.id, keygen())
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

//Функція ініціалізації контролера адміна
function adminInit(id) {
	bot.sendMessage(id, "Що робитимемо?");
	adminMenu();

}
//Генерація одноразовового кода реєстрації модера
function keygen () {
	var authcode = modercode.generate({ parts: 4, partLen : 6 });
	var time = Date.now()+100000;

	function getDateTime(time) {

    var date = new Date(time);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "/" + month + "/" + year + ";" + hour + ":" + min;

	}
	var some = getDateTime(time);

	return 'Код для авторизації нового працівника: '+authcode+' Термін дії: '+some+'. Працівник тепер має дати боту команду /test та надіслати даний код.';
}