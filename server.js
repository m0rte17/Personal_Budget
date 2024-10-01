const express = require('express');
const app = express();
const port = 3000; 

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

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});