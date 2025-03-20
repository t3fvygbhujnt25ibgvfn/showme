const tg = window.Telegram.WebApp;

// Функция для шифрования ID (например, умножение на 3)
function encryptUserId(userId) {
    return userId * 3;
}

// Получаем ID пользователя
const userId = tg.initDataUnsafe.user?.id;

// Создаем реферальную ссылку
function createRefLink() {
    if (userId) {
        const encryptedUserId = encryptUserId(userId);
        const refLink = `https://t.me/xuliobot234546789009876564bot?startapp=ref${encryptedUserId}`;
        document.getElementById('ref-link').innerText = refLink;
    } else {
        alert('Ошибка: ID пользователя не найден.');
    }
}