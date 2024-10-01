async function fetchEnvelopes() {
    const response = await fetch('http://localhost:3000/envelopes');
    if (!response.ok) {
        console.error('Ошибка при получении конвертов:', response.statusText);
        return;
    }
    const envelopes = await response.json();
    const envelopesList = document.getElementById('envelopes-list');

    envelopes.forEach(envelope => {
        const div = document.createElement('div');
        div.textContent = `Конверт: ${envelope.title}, Бюджет: ${envelope.budget}`;
        envelopesList.appendChild(div);
    });
}

fetchEnvelopes();
