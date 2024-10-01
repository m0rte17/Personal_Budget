const express = require('express');
const cors = require('cors'); // Подключаем CORS
const app = express();
const port = 3000; 

// Используем CORS для всех маршрутов
app.use(cors());

// Массив для хранения всех конвертов
let envelopes = [];
let nextId = 1; // Начальный ID для конвертов

// Middleware для обработки JSON-тел запросов
app.use(express.json());

// POST-эндпоинт для создания нового конверта
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;

    // Проверка на наличие обязательных данных
    if (!title || !budget) {
        return res.status(400).send('Title и budget обязательны.');
    }

    // Создание нового конверта
    const newEnvelope = {
        id: nextId++,
        title: title,
        budget: budget
    };

    // Добавление конверта в массив
    envelopes.push(newEnvelope);

    // Ответ на успешное создание
    res.status(201).send(`Конверт '${newEnvelope.title}' с бюджетом ${newEnvelope.budget} успешно создан.`);
});

// GET-эндпоинт для получения всех конвертов
app.get('/envelopes', (req, res) => {
    // Проверка, есть ли конверты
    if (envelopes.length === 0) {
        return res.status(404).send('Нет созданных конвертов.');
    }

    // Возвращаем все конверты
    res.status(200).json(envelopes);
});

// GET-эндпоинт для получения конверта по ID 
app.get('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id); // Парсим ID из параметра URL
    const envelope = envelopes.find(env => env.id === envelopeId);

    // Если конверт не найден, возвращаем 404
    if (!envelope) {
        return res.status(404).send(`Конверт с ID ${envelopeId} не найден.`);
    }

    // Возвращаем найденный конверт
    res.status(200).json(envelope);
});

// PUT-эндпоинт для обновления конверта
app.put('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const { budget, title } = req.body;

    const envelope = envelopes.find(env => env.id === envelopeId);

    if (!envelope) {
        return res.status(404).send(`Конверт с ID ${envelopeId} не найден.`);
    }

    // Валидация данных
    if (budget !== undefined) {
        if (typeof budget !== 'number' || budget < 0) {
            return res.status(400).send('Бюджет должен быть положительным числом.');
        }
        envelope.budget = budget; // Обновление бюджета
    }

    if (title) {
        envelope.title = title; // Обновление названия конверта
    }

    res.status(200).send(`Конверт с ID ${envelopeId} обновлён: ${JSON.stringify(envelope)}`);
});

// POST-эндпоинт для вычитания суммы из бюджета конверта
app.post('/envelopes/:id/withdraw', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const { amount } = req.body;

    const envelope = envelopes.find(env => env.id === envelopeId);

    if (!envelope) {
        return res.status(404).send(`Конверт с ID ${envelopeId} не найден.`);
    }

    // Валидация данных
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send('Сумма для вычитания должна быть положительным числом.');
    }

    // Проверка, достаточно ли бюджета для вычитания
    if (envelope.budget < amount) {
        return res.status(400).send('Недостаточно средств на конверте.');
    }

    envelope.budget -= amount; // Вычитание суммы из бюджета

    res.status(200).send(`Сумма ${amount} успешно вычтена из конверта '${envelope.title}'. Текущий бюджет: ${envelope.budget}.`);
});

// DELETE-эндпоинт для удаления конверта по ID
app.delete('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const originalLength = envelopes.length;

    // Фильтруем массив, чтобы удалить конверт с указанным ID
    envelopes = envelopes.filter(env => env.id !== envelopeId);

    // Если длина массива изменилась, значит конверт был найден и удалён
    if (envelopes.length < originalLength) {
        res.status(200).send(`Конверт с ID ${envelopeId} успешно удалён.`);
    } else {
        res.status(404).send(`Конверт с ID ${envelopeId} не найден.`);
    }
});

// POST-эндпоинт для перевода бюджета между конвертами
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const fromId = parseInt(req.params.from); // ID конверта, из которого переводим
    const toId = parseInt(req.params.to);     // ID конверта, в который переводим
    const { amount } = req.body;               // Сумма перевода из тела запроса

    // Находим оба конверта
    const fromEnvelope = envelopes.find(env => env.id === fromId);
    const toEnvelope = envelopes.find(env => env.id === toId);

    // Проверяем, найдены ли оба конверта
    if (!fromEnvelope) {
        return res.status(404).send(`Конверт с ID ${fromId} не найден.`);
    }
    if (!toEnvelope) {
        return res.status(404).send(`Конверт с ID ${toId} не найден.`);
    }

    // Валидация суммы
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send('Сумма для перевода должна быть положительным числом.');
    }
    if (fromEnvelope.budget < amount) {
        return res.status(400).send('Недостаточно средств на конверте для перевода.');
    }

    // Переводим средства
    fromEnvelope.budget -= amount; // Вычитаем сумму из первого конверта
    toEnvelope.budget += amount;    // Добавляем сумму ко второму конверту

    res.status(200).send(`Сумма ${amount} успешно переведена из конверта '${fromEnvelope.title}' в конверт '${toEnvelope.title}'.`);
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});