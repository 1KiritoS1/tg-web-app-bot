const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bot = require('./bot');
const app = express();

app.use(express.json());
app.use(cors());

app.post(`/${process.env.BOT_TOKEN}`, async (req, res) => {
	const { queryId, products, totalPrice } = req.body;

	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешна покупка!',
			input_message_content: {
				message_text: `Поздравляю с покупкой, вы приобрели товар на сумму $${totalPrice}
				"${products.map(item => item.title).join(', ')}"`
			}
		});
		bot.processUpdate(req.body);
		res.status(200).json({ message: 'Ok' });
	} catch (e) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Не удалось приобрести товар :(',
			input_message_content: { 
				message_text: 'Не удалось приобрести товар :(' 
			}
		});
		res.status(500).json({ message: 'Error' });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));