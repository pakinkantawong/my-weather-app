const apiKey = 'ae7215f94d8ab1de27ceb7f73988f225';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const weatherCurrentContainer = document.querySelector('#weather-current');
const weatherForecastContainer = document.querySelector('#weather-forecast');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        localStorage.setItem('lastCity', cityName);
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    if (weatherCurrentContainer) weatherCurrentContainer.innerHTML = `<p style="opacity:0.7;">กำลังโหลดข้อมูล...</p>`;
    if (weatherForecastContainer) weatherForecastContainer.innerHTML = '';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
        getForecast(city);
    } catch (error) {
        if (weatherCurrentContainer) weatherCurrentContainer.innerHTML = `<p class="error" style="animation: shake 0.5s; color:#FFD166; font-weight:bold;">${error.message}</p>`;
    }
}

// ดึงข้อมูลพยากรณ์อากาศ 5 วันและแสดงผล
async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) return;
        const data = await response.json();
        renderForecast(data);
    } catch (error) {
        // ไม่ต้องแสดง error forecast
    }
}

function displayWeather(data) {
    const { name, main, weather, sys } = data;
    const { temp, humidity } = main;
    const { description, icon, main: weatherMain } = weather[0];

    // เปลี่ยนพื้นหลังตาม weather main
    document.body.classList.remove('day', 'night', 'hot', 'cold', 'rainy', 'cloudy', 'snowy', 'thunder', 'clear');
    let hour = new Date((data.dt + data.timezone) * 1000).getUTCHours();
    let bgClass = '';
    if (weatherMain.toLowerCase().includes('rain')) {
        bgClass = 'rainy';
    } else if (weatherMain.toLowerCase().includes('cloud')) {
        bgClass = 'cloudy';
    } else if (weatherMain.toLowerCase().includes('snow')) {
        bgClass = 'snowy';
    } else if (weatherMain.toLowerCase().includes('thunder')) {
        bgClass = 'thunder';
    } else if (weatherMain.toLowerCase().includes('clear')) {
        if (hour >= 6 && hour < 18) {
            bgClass = 'day';
        } else {
            bgClass = 'night';
        }
    } else if (temp >= 30) {
        bgClass = 'hot';
    } else if (temp <= 18) {
        bgClass = 'cold';
    } else {
        bgClass = hour >= 6 && hour < 18 ? 'day' : 'night';
    }
    document.body.classList.add(bgClass);

    // Animation: fadeIn, bounceIn, card shadow
    let emoji = '';
    switch(bgClass) {
        case 'day': emoji = '☀️'; break;
        case 'night': emoji = '🌙'; break;
        case 'hot': emoji = '🔥'; break;
        case 'cold': emoji = '❄️'; break;
        case 'rainy': emoji = '🌧️'; break;
        case 'cloudy': emoji = '☁️'; break;
        case 'snowy': emoji = '🌨️'; break;
        case 'thunder': emoji = '⛈️'; break;
        default: emoji = '';
    }
    const weatherHtml = `
        <div class="weather-card animated fadeIn">
            <h2 class="weather-city">${emoji} ${name}</h2>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="weather-icon animated bounceIn">
            <p class="temp">${temp.toFixed(1)}°C</p>
            <p class="desc">${description}</p>
            <p class="humidity">ความชื้น: ${humidity}%</p>
        </div>
    `;
    if (weatherCurrentContainer) {
        weatherCurrentContainer.innerHTML = weatherHtml;
        weatherCurrentContainer.style.animation = 'fadeIn 0.8s';
    }
}

function renderForecast(data) {
    // เลือกข้อมูลช่วงเที่ยง (12:00) ของแต่ละวัน
    const daily = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        const hour = item.dt_txt.split(' ')[1].slice(0,2);
        if (hour === '12') daily[date] = item;
    });
    const days = Object.keys(daily).slice(0, 5);
    let html = `<div class="forecast-title" style="margin-top:1.5rem;font-weight:bold;color:#FFD166;">พยากรณ์ 5 วันถัดไป</div><div class="forecast-grid">`;
    days.forEach(date => {
        const item = daily[date];
        const d = new Date(item.dt * 1000);
        const dayName = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
        html += `
            <div class="forecast-card">
                <div class="forecast-date">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" class="weather-icon" style="width:48px;height:48px;">
                <div class="forecast-temp">${item.main.temp.toFixed(1)}°C</div>
                <div class="forecast-desc">${item.weather[0].description}</div>
            </div>
        `;
    });
    html += '</div>';
    if (weatherForecastContainer) weatherForecastContainer.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
    }
});