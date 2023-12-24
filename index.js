const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://tg-webapp-react.netlify.app';

let bot;
const app = express();

app.use(express.json());
app.use(cors());
  
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

bot.onText(/\/echo (.+)/, (msg, match) => {
	try {
		const chatId = msg.chat.id;
		const resp = match[1];

		bot.sendMessage(chatId, resp);
	} catch (e) {
		console.log(e);
	}
});

bot.on('message', async (msg) => {
	try {
		const text = msg.text;
		const chatId = msg.chat.id;

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
	} catch (e) {
		console.log(e);
	}
});


// Server
const corsOptions = {
	origin: 'https://tg-webapp-react.netlify.app',
	methods: 'POST',
};

app.post('/web-data', cors(corsOptions), async (req, res) => {
	const { queryId, products, totalPrice } = req.body;

	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешна покупка!',
			input_message_content: {
				message_text: `
					Поздравляю с покупкой, вы приобрели товар на сумму $${totalPrice}\n
					${products.map(item => item.title).join(', ')}
				`
			}
		});
		return res.status(200).json({});
	} catch (e) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Не удалось приобрести товар :(',
			input_message_content: { 
				message_text: 'Не удалось приобрести товар :(' 
			}
		});
		return res.status(500).json({});
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));