const TelegramBot = require("node-telegram-bot-api")
const config = require("./config.json")
const bot = new TelegramBot(config.token, {polling: true})
var modercode = require('coupon-code');
const menu = require("./menu.json")
grandMenu();
//DATABASE
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

//Паттерн бд
db.defaults({items: []})
.write()

//Очікування уоманди /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт", replyKeyBoard(menu.start))
})

//Очікування уоманди /start
bot.onText(/\/test/, (msg) => {
    let abc = "start"
    console.log(menu.start)
})

bot.on("callback_query", query=>{
    let parsed = JSON.parse(query.data)
    //console.log(query)
    if (parsed.isEdit) {
        bot.sendMessage(query.from.id, "Введіть нову назву товару")
        let obj = {
            name: "",
            price: ""
        };
        bot.on("text", (name)=>{
            if (name.text != "Додати товар") {
                obj.name = name.text;
                bot.sendMessage(name.chat.id, "Введіть нову ціну товару");
                bot.removeListener("text")
                bot.on("text", (price)=>{
                    obj.price = price.text;
                    db.get("items")
                    .find({name: parsed.name})
                    .assign({name: obj.name, price: obj.price}) 
                    .write();
                    db.save();
                    bot.sendMessage(price.chat.id, "Товар успішно змінено");
                    bot.removeListener("text")
                })
            }
        })
    }

    if (parsed.isDelete) {
        bot.sendMessage(query.from.id, `Ви впевнені, що хочете видалити ${parsed.name}?`)
    }
})

//Набір кнопок при повідомленнях

function inlineKeyBoard(param, name) {
    let keys;
    let keyboard;
    if (param == "item") {
        keys = {
            inline_keyboard: [
                [{text: "Редагувати", callback_data: JSON.stringify({name: name, isEdit: true})}, {text: 'Видалити', callback_data: JSON.stringify({name: name, isDelete: true})}]
            ]
        }
        keyboard = {
            reply_markup: JSON.stringify(keys)
        }
    }
    return keyboard;
}


//Набір менюшок "Клавіатур"
function replyKeyBoard(param) {
    let keyboard = {reply_markup: param};
    return keyboard;
}

//Функція запуску загального меню
function grandMenu() {
    bot.on("message", (msg)=>{ 
        //Адмін меню
        if (msg.chat.id == config.admin) {
            switch (msg.text) {

                case 'Товар':
                    bot.sendMessage(msg.chat.id, "Список товарів", replyKeyBoard(menu.items))
                    break;

                case 'Список товарів':
                    let massive = db.getState('items')
                    massive.items.forEach((cur, i)=>{
                        let text = `Назва: ${massive.items[i].name}
Ціна: ${massive.items[i].price} грн;`;
                        bot.sendMessage(msg.chat.id, text, inlineKeyBoard("item", massive.items[i].name))
                    })
                    break;

                case 'Додати товар':
                    bot.sendMessage(msg.chat.id, "Введіть назву товару")
                    let obj = {
                        name: "",
                        price: ""
                    };
                    bot.on("text", (name)=>{
                        if (name.text != "Додати товар") {
                            obj.name = name.text;
                            bot.sendMessage(msg.chat.id, "Введіть ціну товару");
                            bot.removeListener("text")
                            bot.on("text", (price)=>{
                                obj.price = price.text;
                                db.get("items")
                                .push(obj)
                                .write();
                                bot.sendMessage(msg.chat.id, "Товар успішно додано");
                                bot.removeListener("text")
                            })
                        }
                    })
                        break;

                case 'Модератори': 
                    bot.sendMessage(msg.chat.id, "Список модерів") 
                    break;

                case 'Згенерувати ключ': 
                    bot.sendMessage(msg.chat.id, keygen())
                    break;

                case 'Вийти': 
                    bot.removeListener("text")
                    bot.sendMessage(msg.chat.id, "Успішно", replyKeyBoard(menu.start))
                    break;

                case '/admin':
                        bot.sendMessage(msg.chat.id, 'Вітаю у адмін панелі!', replyKeyBoard(menu.admin));
                    break;
            }
        }
         
        //Юзер меню
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