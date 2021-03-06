process.env["NTBA_FIX_319"] = 1;
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
//db.defaults({items: [], cities: [], regions: []})
//.write()

//error handling
bot.on('polling_error', (error) => {
	//console.log('Polling error!' + error.code)
 //bot.startPolling();
  console.log(error+' '+modercode.generate({parts:1}));
});

//Очікування уоманди /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт id"+msg.chat.id, replyKeyBoard(menu.start))
})

//Очікування уоманди /start
bot.onText(/\/test/, (msg) => {
    let base = db.get("cities")
    .value()
    let ret = []
    base.forEach((cur, i)=>{
        let par = Object.keys(base[i])
        ret.push(par[0])
    })
})

bot.on("callback_query", query=>{
    let parsed = JSON.parse(query.data)
    //console.log(query)

    if (parsed.isDelete && parsed.isCity) {
        bot.sendMessage(query.from.id, `Ви впевнені, що хочете видалити "${parsed.name}"?`)
        bot.on("text", text=>{
            if (text.text.toLowerCase() == "так") {
                db.get("cities")
                    .remove({name: parsed.name})
                    .value()
                    db.write();
                bot.removeListener("text")
                bot.sendMessage(query.from.id, `Місто "${parsed.name}" успішно видалено!`)
            } else {
                bot.removeListener("text")
                bot.sendMessage(query.from.id, `Місто "${parsed.name}" НЕ видалено!`)
            }
        })
    }
    if (parsed.isEdit && parsed.isItem) {
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
                    .value();
                    db.write();
                    bot.sendMessage(price.chat.id, "Товар успішно змінено");
                    bot.removeListener("text")
                })
            }
        })
    }

    if (parsed.isDelete && parsed.isItem) {
        bot.sendMessage(query.from.id, `Ви впевнені, що хочете видалити "${parsed.name}"?`)
        bot.on("text", text=>{
            if (text.text.toLowerCase() == "так") {
                db.get("items")
                    .remove({name: parsed.name})
                    .value()
                    db.write();
                bot.removeListener("text")
                bot.sendMessage(query.from.id, `Товар "${parsed.name}" успішно видалено!`)
            } else {
                bot.removeListener("text")
                bot.sendMessage(query.from.id, `Товар "${parsed.name}" НЕ видалено!`)
            }
        })
    }

    if (parsed.confirm) {
        bot.sendMessage(parsed.name, 'Дякуємо, Оплату підтверджено (тут видається замовлення)',replyKeyBoard(menu.start))
    }
    if (parsed.deny) {
        bot.sendMessage(parsed.name, 'Оплату відхилено, замовлення скасовано. Спробуйте ще раз.',replyKeyBoard(menu.start))
    }
})

//Масив міст
function citiesMassive() {
    let base = db.get("cities").value()
    let ret = []
    base.forEach((cur, i)=>{
        ret.push(cur.name)
    })
    return ret;
}

//Набір кнопок при повідомленнях
function inlineKeyBoard(param, name) {
    let keys;
    let keyboard;
    if (param == "item") {
        keys = {
            inline_keyboard: [
                [{text: "Редагувати", callback_data: JSON.stringify({name: name, isEdit: true, isItem: true})}, {text: 'Видалити', callback_data: JSON.stringify({name: name, isDelete: true, isItem: true})}]
            ]
        }
        keyboard = {
            reply_markup: JSON.stringify(keys)
        }
    }
    if (param == "city") {
        keys = {
            inline_keyboard: [
                [{text: 'Видалити', callback_data: JSON.stringify({name: name, isDelete: true, isCity: true})}]
            ]
        }
        keyboard = {
            reply_markup: JSON.stringify(keys)
        }
    }
    if (param == "regions") {

    }
    if (param=="acceptPayment") {
        console.log('name '+name)
        keys = {
            inline_keyboard: [
                [
                {text: "Підтвердити", callback_data: JSON.stringify({name:name.customer, confirm: true})}, 
                {text: 'Відхилити', callback_data: JSON.stringify({name:name.customer, deny: true})}]
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
var currentCity = "";
function grandMenu() {
    
    bot.on("message", (msg)=>{ 
        let moders = db.get("moderators")
        .value()
        //Адмін меню
        if (msg.chat.id == config.admin) {
            citiesMassive().forEach((cur,i)=>{
                if (cur == msg.text) {
                    currentCity = cur;
                    let regionkeys2 = [];
                    let base = db.get("cities").find({name: cur}).value()
                    base.regions.forEach((current, index)=>{
                        let temp2 = [{"text": current.name}]
                        regionkeys2.push(temp)
                    })
                    regionkeys2.push([{"text": "Додати район"}])
                    regionkeys2.push([{"text": "/admin"}])
                    bot.sendMessage(msg.chat.id, `Райони міста "${cur}"`, {reply_markup: {
                        "keyboard": regionkeys2, 
                        "resize_keyboard": true
                    }})
                }
            })
            switch (msg.text) {
                case "Додати район": 
                    console.log(db.get("cities").find({name: currentCity}).value().regions)
                    bot.sendMessage(msg.chat.id, "Введіть назву нового району")
                    bot.on("text", reg=>{
                        let regName = reg.text;
                        let obj = {
                            name: regName
                        }
                        if (reg.text != "Додати район") {
                            let regs = db.get("cities").find({name: currentCity}).value().regions;
                            regs.push(regName);
                            db.get("cities")
                            .find({name: currentCity})
                            .assign({name: currentCity, regions: regs}) 
                            .value();

                            db.get("cities").find({name: currentCity}).value().regions
                            .push(obj)
                            .write();
                            bot.sendMessage(msg.chat.id, "Район успішно додано");
                            bot.removeListener("text")
                        }
                    })
                    break;
                case 'Товар':
                    bot.sendMessage(msg.chat.id, "Товари", replyKeyBoard(menu.items))
                    break;

                case 'Точки':
                    bot.sendMessage(msg.chat.id, "Точки", replyKeyBoard(menu.points))
                    break;

                case 'Міста':
                    bot.sendMessage(msg.chat.id, "Міста:", replyKeyBoard(menu.cities))
                    let base = db.get("cities")
                    .value()
                    base.forEach((cur, i)=>{
                        bot.sendMessage(msg.chat.id, cur.name, inlineKeyBoard("city", cur.name))
                        //console.log(cur.name)
                    })
                    break;

                case 'Райони':
                    let regionkeys = [];
                    citiesMassive().forEach((cur,i)=>{
                        let temp = [{"text": cur}]
                        regionkeys.push(temp)
                    })
                    regionkeys.push([{"text": "/admin"}])
                    bot.sendMessage(msg.chat.id, "Меню районів", {reply_markup: {
                        "keyboard": regionkeys, 
                        "resize_keyboard": true
                    }})
                    break;
                
                case 'Додати місто':
                    bot.sendMessage(msg.chat.id, "Введіть назву міста.")
                    bot.on("text", city=>{
                        let cityName = city.text;
                        let obj = {
                            name: cityName,
                            regions: []
                        }
                        if (city.text != "Додати місто") {
                            db.get("cities")
                            .push(obj)
                            .write();
                            bot.sendMessage(msg.chat.id, "Місто успішно додано");
                            bot.removeListener("text")
                        }
                    })
                    break;
                    

                case 'Список товарів':
                    let massive = db.getState('items')
                    massive.items.forEach((cur, i)=>{
                        let text = `Назва: ${massive.items[i].name}
Ціна: ${massive.items[i].price} UAH;`;
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
                    //bot.sendMessage(msg.chat.id, keygen())
                    bot.sendMessage(msg.chat.id, "Доступно у PRO-версії")

                    break;

                case 'Налаштування':
                    bot.sendMessage(msg.chat.id, "Оберіть пункт меню", replyKeyBoard(menu.settings));
                    bot.on("text", (name)=>{
                    	if(name.text=="Переглянути реквізити"){
                    		let pay = db.get('pay.epay').value();
                    		bot.sendMessage(msg.chat.id, "Поточні реквізити: "+pay);
                    	}
                    	else if(name.text=="Оновити реквізити"){
                    		bot.removeListener("text");
                    		bot.send
                    		bot.on("text", (data)=>{
                    			let pay=data.text;
                    			console.log(pay)
                    			db.set('pay.epay', pay)
                    			  .value()

                    			db.write()

			                    let payy = db.get('pay.epay').value();
                    			bot.sendMessage(msg.chat.id, 'Нові реквізити: '+payy)
                    			bot.removeListener("text")
                    			bot.sendMessage(msg.chat.id, "Успішно", replyKeyBoard(menu.admin))
                    		});
                    	}
                    });
                    break;

                case 'Вийти': 
                    bot.removeListener("text")
                    bot.sendMessage(msg.chat.id, "Успішно", replyKeyBoard(menu.start))
                    break;

                case '/admin':
                        bot.sendMessage(msg.chat.id, 'Вітаю у адмін панелі!', replyKeyBoard(menu.admin));
                    break;
                case 'До головної':
                    bot.removeListener("text");
                    bot.sendMessage(msg.chat.id, 'Адмін панель', replyKeyBoard(menu.admin));
                    break;
            }
        }

        //Модер меню
         
        if (moders.some((cur, i)=>{
            return cur == msg.chat.id
        })) {
            switch(msg.text) {
                case 'Додати товар в район':
                    let add = citiesMassive()
                    let regionkeys2 = [];
                    add.forEach((current, index)=>{
                        console.log(current)
                        let temp2 = [{"text": current}]
                        regionkeys2.push(temp2)
                    })
                    regionkeys2.push([{"text": "/moder"}])
                    console.log(regionkeys2)
                    bot.sendMessage(msg.chat.id, `Міста`, {reply_markup: {
                        "keyboard": regionkeys2, 
                        "resize_keyboard": true
                    }})
                    break;
                case '/moder':
                    bot.sendMessage(msg.chat.id, "Меню модератора", replyKeyBoard(menu.moder))
                    break;
            }
        }

        //Юзер меню
        switch (msg.text) {

            case 'Купити':
                bot.sendMessage(msg.chat.id, "Обери товар", replyKeyBoard( getItemList() ) );
                bot.removeListener('text');
                bot.on("text", (name)=>{
                    if (name.text !=='/start') {
                        let data = name.text.split(" - ");
                        let price = data[1].slice(0, data[1].length-3);
                        let base = db.get('items').value();
                        var itemExist = 0;
                        base.forEach((cur, i)=>{
                            if (cur.name==data[0] && cur.price==price) {
                                itemExist = 1;
                                let pay = db.get('pay.epay').value();
                                bot.sendMessage(msg.chat.id, "Замовлення прийнято. Реквізити до оплати: "+pay+", сума до сплати "+cur.price+" Очікую фото чека.");
                                bot.removeListener('text');
                                //TODO стакання корзин
                                bot.on('photo', (content)=>{
                                    bot.sendMessage(msg.chat.id, "Оплата очікує підтвердження");
                                    bot.forwardMessage(config.admin, content.chat.id, content.message_id);
                                    switch (content.chat.username){
                                    	case undefined:
                                    	bot.sendMessage(config.admin, "Замовлення на товар "+cur.name+' : '+cur.price+'UAH від '+'('+content.chat.first_name+')', inlineKeyBoard('acceptPayment', 
                                            {
                                                name:cur.name,
                                                sum:cur.price,
                                                customer:content.chat.id,
                                                order_id:content.message_id
                                            }

                                        ));
                                    	break;
                                    	default:
                                    	bot.sendMessage(
                                            config.admin, 
                                            "Замовлення на товар "+cur.name+' : '+cur.price+'UAH від @'+content.chat.username+' ('+content.chat.first_name+')', 
                                            inlineKeyBoard('acceptPayment', 
                                            {
                                                name:cur.name,
                                                sum:cur.price,
                                                customer:content.chat.id,
                                                order_id:content.message_id
                                            }

                                        ));

                                    }
                                    
                                    //bot.sendPhoto(config.admin, content);
                                    bot.removeListener('photo');
                                })
                            }
                        });
                        if (itemExist!==1) {
                            
                        }
                        
                    }
                });
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

//Парсер списку товарів для покупки
function getItemList (){
    let base = db.get("items").value()
    let ret = 
    {
        "keyboard": [
        ], 
        "resize_keyboard": true
    }
    base.forEach((cur, i)=>{
        ret.keyboard.push([{"text": cur.name + ' - ' + cur.price + 'UAH'}])

    })
    return ret;    
}