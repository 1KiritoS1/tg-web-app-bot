const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://tg-webapp-react.netlify.app';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const init = () => {
	bot.onText(/\/echo (.+)/, (msg, match) => {
		const chatId = msg.chat.id;
		const resp = match[1];

		bot.sendMessage(chatId, resp);
	});

	bot.on('message', async msg => {
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
	});
}
init();  // Init bot

// Server
app.post('web/data', async (req, res) => {
	const { queryId, products, totalPrice } = req.body;

	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешна покупка!',
			input_message_content: {
				message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму: $'
				+ totalPrice
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

const PORT = 8000;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));