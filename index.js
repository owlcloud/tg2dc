// Импортируем необходимые библиотеки
const { Telegraf } = require('telegraf') // Для работы с телеграмм API
const { Client } = require('discord.js') // Для работы с дискорд API
const fetch = require('node-fetch') // Для отправки HTTP-запросов
const WebSocket = require('ws') // Для работы с WebSocket-соединениями

// Создаем экземпляры ботов с токенами
const tgBot = new Telegraf(process.env.TG_BOT_TOKEN) // Телеграмм бот
const dcBot = new Client() // Дискорд бот

// Получаем ID телеграмм чата и дискорд канала
const TG_CHAT_ID = process.env.TG_CHAT_ID // ID телеграмм чата, где работает телеграмм бот
const DC_CHANNEL_ID = process.env.DC_CHANNEL_ID // ID дискорд канала, где работает дискорд бот и bluewillow

// Создаем переменные для хранения WebSocket-соединений с дискорд API
let dcGateway // Соединение для получения событий от дискорд API
let dcSessionId // ID сессии для восстановления соединения при обрыве
let dcSequence // Последовательный номер последнего полученного события от дискорд API

// Функция для отправки сообщений в телеграмм чат через HTTP-запросы к телеграмм API
// Принимает параметры: text - текст сообщения, photo - URL фотографии (необязательный)
async function sendToTelegram(text, photo) {
  // Формируем URL для отправки сообщения в телеграмм API
  // Используем метод sendMessage или sendPhoto в зависимости от наличия фотографии
  let url = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/`
  url += photo ? 'sendPhoto' : 'sendMessage'
  url += `?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(text)}`
  if (photo) url += `&photo=${encodeURIComponent(photo)}`

  // Отправляем HTTP-запрос к телеграмм API и ждем ответа
  try {
    const response = await fetch(url)
    const data = await response.json()
    // Проверяем, что ответ успешный и содержит результат
    if (data.ok && data.result) {
      console.log(`Sent message to telegram: ${text}`)
      if (photo) console.log(`Sent photo to telegram: ${photo}`)
    } else {
      // Если ответ неуспешный или не содержит результат, выводим ошибку
      console.error(`Failed to send message to telegram: ${data.description}`)
    }
  } catch (error) {
    // Если произошла ошибка при отправке запроса, выводим ошибку
    console.error(`Failed to send message to telegram: ${error.message}`)
  }
}

// Функция для отправки сообщений в дискорд канал через HTTP-запросы к дискорд API
// Принимает параметры: text - текст сообщения, attachment - объект с данными о вложении (необязательный)
async function sendToDiscord(text, attachment) {
  // Формируем URL для отправки сообщения в дискорд API
  // Используем метод createMessage
