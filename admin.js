function admin() {
    bot.onText(new RegExp('\/admin'), msg=>{
        if (msg.chat.id == config.admin) {
            bot.sendMessage(msg.chat.id, 'Ти адмін!', replyKeyBoard("admin"))
        } else {
            bot.sendMessage(msg.chat.id, 'Ти НЕ адмін!!!')
        }
    })
}

module.exports.adminMenu = admin;