const { Telegraf } = require('telegraf');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
import axios from 'axios';
import pLimit from 'p-limit';
const limit = pLimit(10);
const limitImage = pLimit(3);
const DATA_DIR = path.join(__dirname, 'dataUsersV2');
const MAX_RESPONSES_PER_USER = 50;
const MAX_RESPONSES_IMAGES_PER_USER = 25;
const fetch = require('node-fetch');
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'
let botTypeGlobal = 'gpt'
const { translate } = require('bing-translate-api');
import { KeyvFile } from 'keyv-file'; 
const api = new ChatGPTUnofficialProxyAPI({
		accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJnYWhpZmV2MTkxQGxhc2VybGlwLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJnZW9pcF9jb3VudHJ5IjoiTkwifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLWttQmUzczBhNnA1V2Y4OEoxekZJWVhpdyJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiYXV0aDB8NjNlYjFhZDEwODljMjA2ODgyODU3OGJlIiwiYXVkIjpbImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEiLCJodHRwczovL29wZW5haS5vcGVuYWkuYXV0aDBhcHAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY3NzU2NzA3OSwiZXhwIjoxNjc4Nzc2Njc5LCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgbW9kZWwucmVhZCBtb2RlbC5yZXF1ZXN0IG9yZ2FuaXphdGlvbi5yZWFkIG9mZmxpbmVfYWNjZXNzIn0.RI9UiO9MQq7Gn--neB8IoZytvrZ_80fu4WV2FOZZ6wnKAz_9iaPQbBOa8XfGy-R5Hncc9xg6f_w4Q6ttUga-yzJPwjQ0UB-zKBU7DYfuujTV1GFTPIliOu0GMjDQbeUdX3rk6yBjV4EVIdQ6R1HGA8e0yOWNtqaBAyHYVUoWunl1FAqvKolakvxQb6Y0ts0RisSDAlyCDoo1HZ55RcXIetJPRGEFf-Suibok4MwiZ-BXRzAi1zSujV4vpeMLGC3j54r0htaiLI67fPvgrFw-rNJ9-dFkQOedr12tu4bsIqeDlEw90fTlzmvkbgTvO3rXJk_yKjBGGwnBcAJ4lzmA9w',
	})
let parallelUsageBot = 0
// Set up Telegram bot and OpenAI API credentials
const bot = new Telegraf('6183634034:AAHAFAaajZyw9B2HHfEytEzBMB4XmLECNb4', {handlerTimeout: 9_000_000});
// Загружаем модель для русского языка
const ai = async (prompt, msgLast, userid,  timeout = 1200000) => {
	try{
		let { BingAIClient } = await import('@waylaidwanderer/chatgpt-api');  
		const options = { 
		     host: '', 
		     userToken: '1vMrOp5yzFshv5ZOuhRgxqnAn2cjNxsVC-EtAj-iIWbpHJNFixSXpwVbYOPQGH1TVVVjyxHNBZpmL0W3VV9KZEQXbOGN1JtUiRzCBZ9JNCgBUoKb0xE11qmGfoX5Y6ZhXolqkKVnyynJRMl8m4DgI6bpRVF-wTzcs51QNnqWsqjJSFn5PRikRmpoArk3WxlccrxWy_RLXCjdwONk6iLlp9k99dLDz5mukL16C4OpvnDD-GfB5N6fKSVbqu6BhdMmp', 
		     cookies: '', 
		     proxy: '', 
		     debug: false, 
		}; 
		const cacheOptions = { 
		     store: new KeyvFile({ filename: `./dataUsersV2/${userid}_cacheBing.json` }), 
		};
		const sydneyAIClient = new BingAIClient({ 
    		...options, 
     		cache: cacheOptions, 
		}); 
		const promise = msgLast ? await sydneyAIClient.sendMessage(prompt, { 
     		jailbreakConversationId: msgLast.jailbreakConversationId, 
     		parentMessageId: msgLast.messageId,
		}) : await sydneyAIClient.sendMessage(prompt, {jailbreakConversationId: true});
		const res = await Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))]);
		res.response = res.response
		return res;
	}catch(err){
		console.log(err)
	}
}
const aiGpt = async (prompt, context) => {
	const data = JSON.stringify({
		"model": "gpt-3.5-turbo",
		"messages": context,
		"stop": "<|im_end|>",
	});

	const config = {
		method: 'post',
		url: 'https://api.pawan.krd/v1/chat/completions',
		headers: { 
			'Authorization': 'Bearer pk-EcRSwnIRpmxnzEoweUvPYRpydXZCGEEahgilKKnMeYqqGReF', 
			'Content-Type': 'application/json'
		},
		data : data
	};
	const response = await axios(config);
	if(response.error) {console. log(response.error)}
	console.log(response.data) 
	return response.data.choices[0];
}

const max_size = 4096
async function sendLongMessage (res, ctx) {
  var messageString = res.text
  var amount_sliced = messageString.length / max_size
  var start = 0
  var end = max_size
  var message
  var messagesArray = []
  for (let i = 0; i < amount_sliced; i++) {
    message = messageString.slice (start, end)
    messagesArray.push (message)
    start = start + max_size
    end = end + max_size
  }
  for (let j = 0; j < messagesArray.length; j++) {
    await ctx.reply (messagesArray[j])
  }
}

// Проверяем наличие каталога dataUsers и создаем его, если он отсутствует
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Объект для хранения контекста диалога и id последнего сообщения каждого пользователя
const userContext = {};

// Функция для запоминания контекста диалога и id последнего сообщения пользователя
async function saveUserContext(userId, context, lastMessageId, dialog, responseCount, responseCountImage, botType) {
    const userDataFile = path.join(DATA_DIR, `${userId}.json`);
    const userData = { context, lastMessageId, dialog, responseCount, responseCountImage, botType };
    await fs.promises.writeFile(userDataFile, JSON.stringify(userData));
}
// Функция для добавления запросов пользователю
async function getResponseAdmin(userId, resp, respImg) {
    try {
        const userDataFile = path.join(DATA_DIR, `${userId}.json`);
		const userData = await fs.promises.readFile(userDataFile);
        const parsedData = JSON.parse(userData);
        // очищаем свойства lastMessageId и context
        parsedData.responseCount -= resp
        parsedData.responseCountImage -= respImg
        // перезаписываем файл
        await fs.promises.writeFile(userDataFile, JSON.stringify(parsedData));
    } catch (err) {
        console.error(err);
    }
}
// Создаем функцию для обновления значения свойства botType в файле пользователя
async function updateBotType(userId) {
  // Формируем имя файла пользователя и считываем его содержимое из файла
	const userDataFile = path.join(DATA_DIR, `${userId}.json`);
	const userData = await fs.promises.readFile(userDataFile);
	const parsedData = JSON.parse(userData);
  if (parsedData.botType === 'bing') {
    parsedData.botType = 'gpt'
  } else {
    parsedData.botType = 'bing'
  }
  await fs.promises.writeFile(userDataFile, JSON.stringify(parsedData));

  // Возвращаем название нового бота, на который пользователь переключился
  return parsedData.botType;
}
// Функция для получения контекста диалога и id последнего сообщения пользователя
async function getUserContext(userId) {
    const userDataFile = path.join(DATA_DIR, `${userId}.json`);
    try {
        const userData = await fs.promises.readFile(userDataFile);
        return JSON.parse(userData);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Если файл не найден, создаем новый файл и возвращаем объект с пустыми полями
            await fs.promises.mkdir(DATA_DIR, { recursive: true });
            const userData = { context: null, lastMessageId: null, dialog: [],  responseCount: 0, responseCountImage: 0, botType: 'bing' };
            await fs.promises.writeFile(userDataFile, JSON.stringify(userData));
            return userData;
        }
        // Если возникла другая ошибка, возвращаем null
        console.error(err);
        return null;
    }
}
// Функция для сброса контекста диалога и id последнего сообщения пользователя
async function resetUserContext(userId) {
    const userDataFile = path.join(DATA_DIR, `${userId}.json`);
    try {
        const userData = await fs.promises.readFile(userDataFile);
        const parsedData = JSON.parse(userData);
        // очищаем свойства lastMessageId и context
        if(parsedData.botType == "bing") {
			parsedData.lastMessageId = null;
		}else{
			parsedData.context = null;
			parsedData.dialog = [];
		}
        
        // перезаписываем файл
        await fs.promises.writeFile(userDataFile, JSON.stringify(parsedData));
    } catch (err) {
        console.error(err);
    }
}

async function generateTextNew(prompt, userId) {
	const MAX_RETRIES = 5; // максимальное количество повторных вызовов функции
	let retryCount = 0; // количество повторных вызовов функции
	while (retryCount < MAX_RETRIES) { // запускаем цикл до тех пор, пока количество повторных вызовов меньше максимального
		try {
			const { context, lastMessageId, dialog, responseCount, responseCountImage, botType } = await getUserContext(userId) || {};
			if (responseCount >= MAX_RESPONSES_PER_USER) {
				//await ctx.reply(userId, 'Вы использовали все доступные ответы. Купите подписку, чтобы получить больше ответов.') ;
				return {error: true, text: 'Вы использовали все доступные ответы. Купите подписку, чтобы получить больше ответов.'}
			}
			switch(botType){
				case 'bing':
					if (lastMessageId != null) {
						const res = await ai(prompt, lastMessageId, userId);
						if(!res.response || res.response == prompt || res.response == '[Error: The moderation filter triggered. Try again with different wording.]') continue;
						await saveUserContext(userId, null, res, dialog,  responseCount + 1, responseCountImage, botType);
						return {error: false, text: res.response}
					} else {
						const res = await ai(prompt, null, userId)
						if(!res.response || res.response == prompt || res.response == '[Error: The moderation filter triggered. Try again with different wording.]') continue;
						await saveUserContext(userId, null, res, dialog,  responseCount + 1, responseCountImage, botType);
						return {error: false, text: res.response}
					}
					break;
				case 'gpt':
					if (dialog.length) {
						dialog.push({"role": "user", "content": prompt})
						const res = await aiGpt(prompt, dialog);
						dialog.push({role: res.message.role, content: res.message.content})
						await saveUserContext(userId, context, lastMessageId, dialog,  responseCount + 1, responseCountImage, botType);
						dialog.push({role: res.message.role, content: res.message.content})
						return {error: false, text: res.message.content};
					} else {
						//dialog.push({"role": "system", "content": "Тебя зовут Никита Алексеевич, тебе 25 лет."})
						dialog.push({"role": "user", "content": prompt})
						const res = await aiGpt(prompt, dialog)
						dialog.push({role: res.message.role, content: res.message.content})
						await saveUserContext(userId, context, lastMessageId, dialog,  responseCount + 1, responseCountImage, botType);
						return {error: false, text: res.message.content};
					}
					break;
				default:return {error: true, text: 'Вы использовали все доступные ответы. Купите подписку, чтобы получить больше ответов.'}
			}
		} catch (err) {
			retryCount++;
			console. log(err) 
			console.log(`Ошибка выполнения generateTextNew, попытка #${retryCount}`);
		}
	}
	console.log('Функция generateTextNew не смогла получить ответ');
	return {error: true, text: 'Произошла ошибка, попробуйте ещё раз. Если сообщение об ошибке сохраняется, попробуйте сбросить диалог.'}
}
async function singleQuest(prompt) {
	const MAX_RETRIES = 5; // максимальное количество повторных вызовов функции
	let retryCount = 0; // количество повторных вызовов функции
	while (retryCount < MAX_RETRIES) { // запускаем цикл до тех пор, пока количество повторных вызовов меньше максимального
		try {
			const res = await ai(prompt, null, 0)
			return res.response;
		} catch (err) {
			retryCount++;
			console.log(`Ошибка выполнения singleQuest, попытка #${retryCount}`);
		}
	}
	console.log('Функция singleQuest не смогла получить ответ');
	return null; // возвращаем null, если количество повторных вызовов превысило максимальное
}
/*
async function sendImageMessage(prompt) {
  const response = await fetch("https://dalle-clone-1l12.onrender.com/api/v1/dalle", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    "accept": "*//*",
    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://dalle-clone-0.web.app/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  body: JSON.stringify({ prompt: prompt })
})
  return await response.json();
}
*/
async function sendImageMessage(q) {
	const MAX_RETRIES = 5; // максимальное количество повторных вызовов функции
	let retryCount = 0; // количество повторных вызовов функции
	const browser = await puppeteer.launch({
		//headless
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--single-process',
			'--disable-gpu',
			'--no-zygote'
		]
	});
	while (retryCount < MAX_RETRIES) { // запускаем цикл до тех пор, пока количество повторных вызовов меньше максимального
		try {
			const res = await translate(q, null, 'en')
			const prompt = res.translation
			
			const page = await browser.newPage();
			await page.goto('https://stablediffusionai.org/');

			  // Заполнение формы
			await page.type('#prompt', prompt);
			  //await page.type('#negative', 'dog');
			  //await page.select('#size', '512');
			await page.click('#sendData');

  // Ожидание генерации изображений
			await page.waitForSelector('.container_images__generated .container__input__item__img > img', { visible: true, timeout: 300000 });

  // Сохранение изображений
			const images = await page.$$eval('.container_images__generated .container__input__item__img > img', imgs => imgs.map(img => img.src));

			await browser.close();
  //console.log(images[0]) 
	//fs.writeFile('image.png', images[0], {encoding: 'base64'}, function(err) {
	//	console.log('File created');
	//});
			return images;
		} catch (err) {
			retryCount++;
			console. log(err) 
			console.log(`Ошибка выполнения generateImage, попытка #${retryCount}`);
		}
	}
	await browser.close();
		return []
}
async function generateImage(prompt, userId) {
  const { context, lastMessageId, dialog, responseCount, responseCountImage, botType } = await getUserContext(userId) || {};
			
  if (responseCountImage >= MAX_RESPONSES_IMAGES_PER_USER) {
    return {error: true, text: 'Вы использовали все доступные генерации. Купите подписку, чтобы получить больше ответов.'}
  }

  //const promptQ = await singleQuest(`Переведи с русского языка на английский язык ${prompt}`)
//console. log(promptQ) 
  const sendImageMessageResult = await sendImageMessage(prompt)
    if (sendImageMessageResult) await saveUserContext(userId, context, lastMessageId, dialog,  responseCount, responseCountImage + 1, botType)
  
//console. log(sendImageMessageResult) 
  return sendImageMessageResult;
}

// Обработчик команды для сброса контекста диалога текущего пользователя
bot.command('start', async (ctx) => {
  (async (ctx) => {
    const text = 'Наш проект - это уникальная платформа для общения с искусственным интеллектом. Вы можете поговорить с разными моделями ИИ, такими как chatgpt и bing ai, которые уже интегрированы в нашего бота. Вы также можете сгенерировать удивительные картинки с помощью ИИ, используя простые команды. Наш проект - это идеальный способ познакомиться с новыми технологиями и развлечься.'; // текст, который вы хотите отправить
    const path = 'startBot.png'; // путь к файлу изображения
    await ctx.replyWithMediaGroup([
      {
        type: 'photo',
        media: {source: path} // отправляем изображение из директории
      },
      {
        type: 'text',
        media: text
      }
    ]).catch(err => {}) // отправляем медиа-группу
  })(ctx)
})
// Создаем команду для переключения значения botType
bot.command('switch', async (ctx) => {
	(async (ctx) => {
		// Обновляем значение botType в файле пользователя и отправляем сообщение об успешном обновлении
		const newBotType = await updateBotType(ctx.from.id);
		await ctx.reply(`✅ Значение botType успешно переключено.\nТеперь вы используете бота ${newBotType == 'bing' ? 'с доступом в интернет' : 'без доступа в интернет'}(${newBotType})`);
	}) (ctx) 
});
bot.command('help', async (ctx) => {
	(async (ctx) => {
		await ctx.reply('Список доступных команд:\n/help - помощь\n/reset - сброс контекста диалога\n/pay - добавить количество использования\n/image - Описание работы команды на генерацию картинок')
	})(ctx)
})

bot.command('reset', async (ctx) => {
	(async (ctx) => {
		const userId = ctx.from.id;
		resetUserContext(userId);
		await ctx.reply('✅ Вы успешно сбросили контекст');
	})(ctx)
})
bot.command('image', async (ctx) => {
	(async (ctx) => {
		const userId = ctx.from.id;
		await ctx.reply('Пример ввода команды:\ngetImagePrompt: описание картинки, которую хотите получить');
	})(ctx)
})
bot.command('profile', async (ctx) => {
	(async (ctx) => {
		const userId = ctx.from.id;
		const { responseCount, responseCountImage } = await getUserContext(userId) || {};
		const profileMessage = `🤖 Ваш id в системе: ${userId}\n🔹 Диалог будет продолжен в пределах: ${Math.abs(responseCount - MAX_RESPONSES_PER_USER)} сообщений\n🔹 Запросов на генерацию картинок осталось: ${Math.abs(responseCountImage - MAX_RESPONSES_IMAGES_PER_USER)}\n\nКаждую среду до 12:00 по мск происходит начисление бесплатных попыток.`;
		await ctx.reply(profileMessage)
	})(ctx)
})

bot.command('pay', async (ctx) => {
	(async (ctx) => {
		const userId = ctx.message.from.id;
		try {
			const wallet = '4100118132902809';
			const orderNumber = userId;
			const successURL = 'http://5.178.3.154/paySuccess';

			const paymentLinks = [
				{ label: `${userId}_pay100`, amount: 100, text: '50 текстовых генераций' },
				{ label: `${userId}_pay250`, amount: 250, text: '150 текстовых генераций' },
				{ label: `${userId}_pay500`, amount: 500, text: '300 текстовых генераций' },
				{ label: `${userId}_pay100Images`, amount: 100, text: '25 генераций картинок' },
				{ label: `${userId}_pay250Images`, amount: 250, text: '75 генераций картинок' },
				{ label: `${userId}_pay500Images`, amount: 500, text: '150 генераций картинок' }
			];

		const buttons = paymentLinks.map(payment => {
			const paymentLink = `https://yoomoney.ru/quickpay/confirm.xml?receiver=${encodeURIComponent(wallet)}&formcomment=${encodeURIComponent('Оплата заказа')}&short-dest=${encodeURIComponent(`Заказ №${orderNumber}`)}&label=${encodeURIComponent(`order_${orderNumber}`)}&quickpay-form=button&targets=${encodeURIComponent(`Оплата заказа №${orderNumber}`)}&sum=${encodeURIComponent(payment.amount)}&comment=${encodeURIComponent('Заказ сформирован')}&paymentType=PC&need-fio=no&need-email=no&need-phone=no&need-address=no&successURL=${encodeURIComponent(successURL)}&label=${encodeURIComponent(payment.label)}`;
			return [{ text: `${payment.amount} рублей = ${payment.text}`, url: paymentLink }];
		});

		await ctx.replyWithMarkdown('Выберите вариант оплаты:', {
			reply_markup: {
				inline_keyboard: buttons
			}
		});
		} catch (err) {
			await ctx.replyWithHTML('Ошибка генерации ссылки на оплату');
		}
	})(ctx)
});

async function getUsers() {
  const files = await fs.promises.readdir('dataUsersV2');
  return files.filter(file => fs.statSync(`dataUsersV2/${file}`).isFile()).map(file => file.split('.json')[0]);
}

// Обработчик входящих сообщений
bot.on('text', async (ctx) => {
	(async (ctx) => {
	try{
		const userId = ctx.message.from.id;
		const userMessage = ctx.message.text;
		const { context, lastMessageId, dialog, responseCount, responseCountImage, botType } = await getUserContext(userId) || {};
		const commandAdminMsg = /sendAllMsg:\s(.*)/i;
		const commandGetResponse = /getResponse\s+(\d+)\s+(\d+)\s+(\d+)/i;
		const commandSwitchBot = /installBot:\s(.*)/i;
		const regex = /getImagePrompt:\s(.*)/i;
		let match, lastMsg;
		if (userMessage.startsWith('/')) {
			return;
		}
		if (userId == 1417981866) {
			match = userMessage.match(commandAdminMsg);
			if (match) {
				try {
					const users = await getUsers();
					await Promise.all(users.map(async (user) => {
						try {
							await bot.telegram.sendMessage(user, userMessage.replace('sendAllMsg:', "")).catch(err => {}) ;
						} catch (err) {}
					}));
					return;
				} catch (err) {
					console.log(err);
				}
			}
			match = userMessage.match(commandSwitchBot);
			if (match) {
				try {
					botTypeGlobal = match[1]
					await ctx.reply(`Бот был изменен на "${match[1]}"`);
					return;
				} catch (err) {
					console.log(err);
				}
			}
			match = userMessage.match(commandGetResponse);
			if (match) {
				lastMsg = await ctx.reply('⏳ Обрабатываю вашу команду...');
				try {
					const userId = parseInt(match[1]);
					const arg1 = parseInt(match[2]);
					const arg2 = parseInt(match[3]);
					const response = await getResponseAdmin(userId, arg1, arg2);
					await ctx.reply('Команда была выполнена');
				} catch (err) {
					await ctx.reply('При выполнении команды произошла ошибка.');
				}
				await ctx.telegram.deleteMessage(lastMsg.chat.id, lastMsg.message_id);
				return;
			}
		}
		match = userMessage.match(regex);
		if (match) {
			parallelUsageBot++;
			lastMsg = await ctx.reply(`⏳ Обрабатываю ваш запрос...\nПараллельно используют бота: ${parallelUsageBot}`);
			try {
				const response = await limitImage(() => generateImage(match[1], userId)) ;
				const imageBase64Array = response; 
				for (let i = 0; i < imageBase64Array.length; i++) {
					const imageBinary = Buffer.from(imageBase64Array[i].replace(/^data:image\/\w+;base64,/, ''), 'base64'); 
					await bot.telegram.sendPhoto(userId, { source: imageBinary });
				}
			} catch (err) {
				console.log(err);
				await ctx.reply('При генерации картинки произошла ошибка.');
			}
			await ctx.telegram.deleteMessage(lastMsg.chat.id, lastMsg.message_id);
			parallelUsageBot--;
			return;
		}
			parallelUsageBot++;
			lastMsg = await ctx.reply(`⏳ Обрабатываю ваш запрос...\nПараллельно используют бота: ${parallelUsageBot}`);
			try {
			const response = await limit(() => generateTextNew(userMessage, userId)) ;
			response.text += `\n\nВы используете бота ${botType == 'bing' ? 'с доступом в интернет' : 'без доступа в интернет'}(${botType})`
			//console.log(response.text) 
			await sendLongMessage(response, ctx) 
			//await ctx.reply(`${response.text}\n\nВы используете бота ${botType == 'bing' ? 'с доступом в интернет' : 'без доступа в интернет'}(${botType})`);
		} catch (err) {
			console.log(err);
			await ctx.reply('Произошла ошибка, попробуйте ещё раз. Если сообщение об ошибке сохраняется, попробуйте сбросить диалог.');
		}
		await ctx.telegram.deleteMessage(lastMsg.chat.id, lastMsg.message_id);
		parallelUsageBot--;
		return;
	}catch(err){
		console.log(err)
		return
	}
	}) (ctx) 
});
bot.on("voice", (ctx) => {
  //const message = ctx.message;
  //sendVoiceMessage(ctx, message);
});

bot.launch();
