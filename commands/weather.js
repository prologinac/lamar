const axios = require('axios');

module.exports = async (sock, chatId, message, args) => {
    const city = args.join(' ');
    if (!city) return await sock.sendMessage(chatId, { text: 'Please provide a city name.' });

    try {
        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; 
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const weather = response.data;
        const weatherText = `🌤️ *Weather in ${weather.name}*\n\n🌡️ *Temp:* ${weather.main.temp}°C\n📝 *Status:* ${weather.weather[0].description}\n💧 *Humidity:* ${weather.main.humidity}%`;
        await sock.sendMessage(chatId, { text: weatherText }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Could not find weather for that city.' }, { quoted: message });
    }
};
