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
    bot.on("message", (msg)=>{ /*5. таксамо лісенер
        просто інколи треба буде (можливо) забрати ліснер message, 
        в тому тітто часто мені то треба було, бо там бот реагвав на фото
        і відповідно там був код щось тиу
                bot.on("text", (txt)=>{
                    bot.removeListener("message");
                    ЩОСЬ ТУТ РОБИТЬСЯ
                    bot.removeListener("text");
                    grandMenu();
                })
        бо і той і той лісенер мали певні реакції на текст і шоб не було конфліктів

        */
        switch (msg.text) {
            case 'Наявність товару/Купити': 
                bot.sendMessage(msg.chat.id, "Введіть кількість чогось")
                bot.on("text", (txt)=>{ //1. команда шо запускає лісенер, один раз запустив і він вічно провіряє
                    //2. якийсь код шо кудись там зберігає то шо користувач ввів через txt.data
                    bot.sendMessage(msg.chat.id, "Все вірно додано") //3. відправляєм користувачу підтвердження
                    bot.removeListener("text"); //4. і забираємо лісенер, бо він буде реагувати на всі повідомлення текстові і надалі
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