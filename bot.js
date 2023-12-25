const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://tg-webapp-react.netlify.app';

let bot;
  
const initPolling = () => {
	bot = new TelegramBot(token, { polling: true });
	
	console.log('Bot started in the dev mode with polling.');
}

const initWebhook = () => {
	bot = new TelegramBot(token);

    const webhookUrl = process.env.HEROKU_URL + bot.token;
    console.log('Webhook URL:', webhookUrl);
    bot.setWebHook(webhookUrl);

    console.log('Bot started in the prod mode with webhook.');
};

if (process.env.NODE_ENV === 'production') {
	initWebhook();
} else {
	initPolling();
}

bot.on('message', function onMessage(msg) {
	bot.sendMessage(msg.chat.id, 'Я тестовый бот. Чтобы ознакомиться с моим функционалом, введите /start');
});

bot.on('message', async (msg) => {
	if (text === '/start') {
		await bot.sendMessage(chatId, 'Заполни форму', {
			reply_markup: {
				keyboard: [
					[{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }]
				]
			}
		});
		await bot.sendMessage(chatId, 'Заходи сюда', {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
				]
			}
		});
	}
	if (msg.web_app_data?.data) {
		try {
			const data = JSON.parse(msg.web_app_data?.data);

			await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
			await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
			await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
		} catch (e) {
			console.log(e);
		}
	}
});

module.exports = bot;