import { S } from '../core/state.js';
import { WEATHERS, CONFIG } from '../data/config.js';
import { NotificationManager } from '../managers/notification-manager.js';

export function processWeather() {
    if (Date.now() - S.weatherChangedAt >= CONFIG.WEATHER_INTERVAL) {
        S.weather = Math.floor(Math.random() * WEATHERS.length);
        S.weatherChangedAt = Date.now();
        NotificationManager.toast(`${WEATHERS[S.weather].icon} Cuaca: ${WEATHERS[S.weather].name}`, 'info');

        document.body.className = document.body.className.replace(/weather-\w+/g, '');
        if (WEATHERS[S.weather].name === 'Hujan') document.body.classList.add('weather-rain');
        if (WEATHERS[S.weather].name === 'Badai') document.body.classList.add('weather-storm');
    }
}
