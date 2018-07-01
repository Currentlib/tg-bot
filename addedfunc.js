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