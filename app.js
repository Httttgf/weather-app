/* =============================================
   WEATHER APP - JAVASCRIPT WITH MONETIZATION
   ============================================= */

class WeatherApp {
    constructor() {
        this.apiKey = localStorage.getItem('openweather_api_key') || '';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.iconUrl = 'https://openweathermap.org/img/wn';
        this.isPremium = localStorage.getItem('weather_app_premium') === 'true';
        
        // DOM Elements
        this.elements = {
            app: document.getElementById('app'),
            apiModal: document.getElementById('apiModal'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKey: document.getElementById('saveApiKey'),
            settingsBtn: document.getElementById('settingsBtn'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            weatherContent: document.getElementById('weatherContent'),
            cityName: document.getElementById('cityName'),
            date: document.getElementById('date'),
            weatherIcon: document.getElementById('weatherIcon'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            humidity: document.getElementById('humidity'),
            wind: document.getElementById('wind'),
            feelsLike: document.getElementById('feelsLike'),
            visibility: document.getElementById('visibility'),
            forecastContainer: document.getElementById('forecastContainer'),
            animatedBg: document.getElementById('animatedBg'),
            particles: document.getElementById('particles'),
            // Premium elements
            premiumBanner: document.getElementById('premiumBanner'),
            premiumModal: document.getElementById('premiumModal'),
            alertsModal: document.getElementById('alertsModal'),
            extendedForecast: document.getElementById('extendedForecast'),
            extendedForecastLocked: document.getElementById('extendedForecastLocked'),
            extendedForecastContainer: document.getElementById('extendedForecastContainer'),
            adsenseContainer: document.getElementById('adsenseContainer')
        };
        
        this.currentCity = localStorage.getItem('weather_last_city') || 'Paris';
        this.weatherData = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkPremiumStatus();
        
        if (!this.apiKey) {
            this.showApiModal();
        } else {
            this.fetchWeather(this.currentCity);
        }
    }
    
    bindEvents() {
        // API Key events
        this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
        this.elements.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        this.elements.settingsBtn.addEventListener('click', () => this.showApiModal());
        
        // Search events
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Retry button
        this.elements.retryBtn.addEventListener('click', () => this.fetchWeather(this.currentCity));
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.premiumModal) {
                closePremiumModal();
            }
            if (e.target === this.elements.alertsModal) {
                closeAlertsModal();
            }
        });
    }
    
    checkPremiumStatus() {
        if (this.isPremium) {
            document.body.classList.add('is-premium');
        } else {
            document.body.classList.remove('is-premium');
        }
    }
    
    showApiModal() {
        this.elements.apiModal.classList.add('active');
        this.elements.apiKeyInput.value = this.apiKey;
        this.elements.apiKeyInput.focus();
    }
    
    hideApiModal() {
        this.elements.apiModal.classList.remove('active');
    }
    
    saveApiKey() {
        const key = this.elements.apiKeyInput.value.trim();
        if (key) {
            this.apiKey = key;
            localStorage.setItem('openweather_api_key', key);
            this.hideApiModal();
            this.fetchWeather(this.currentCity);
        }
    }
    
    handleSearch() {
        const city = this.elements.searchInput.value.trim();
        if (city) {
            this.fetchWeather(city);
        }
    }
    
    showLoading() {
        this.elements.loading.classList.add('active');
        this.elements.error.classList.remove('active');
        this.elements.weatherContent.classList.remove('active');
    }
    
    hideLoading() {
        this.elements.loading.classList.remove('active');
    }
    
    showError(message) {
        this.elements.error.classList.add('active');
        this.elements.errorMessage.textContent = message;
        this.elements.loading.classList.remove('active');
        this.elements.weatherContent.classList.remove('active');
    }
    
    showWeather() {
        this.elements.weatherContent.classList.add('active');
        this.elements.loading.classList.remove('active');
        this.elements.error.classList.remove('active');
    }
    
    async fetchWeather(city) {
        this.showLoading();
        
        try {
            // Fetch current weather
            const currentResponse = await fetch(
                `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${this.apiKey}`
            );
            
            if (!currentResponse.ok) {
                if (currentResponse.status === 401) {
                    throw new Error('Cle API invalide. Veuillez verifier vos parametres.');
                } else if (currentResponse.status === 404) {
                    throw new Error('Ville non trouvee. Verifiez l\'orthographe.');
                }
                throw new Error('Erreur lors de la recuperation des donnees.');
            }
            
            const currentData = await currentResponse.json();
            
            // Fetch forecast
            const forecastResponse = await fetch(
                `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=fr&appid=${this.apiKey}`
            );
            
            if (!forecastResponse.ok) {
                throw new Error('Erreur lors de la recuperation des previsions.');
            }
            
            const forecastData = await forecastResponse.json();
            
            this.weatherData = { current: currentData, forecast: forecastData };
            this.currentCity = city;
            localStorage.setItem('weather_last_city', city);
            
            this.updateUI();
            this.updateBackground(currentData.weather[0].main, currentData.sys);
            this.showWeather();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    updateUI() {
        const { current, forecast } = this.weatherData;
        
        // Update current weather
        this.elements.cityName.textContent = `${current.name}, ${current.sys.country}`;
        this.elements.date.textContent = this.formatDate(new Date());
        this.elements.weatherIcon.src = `${this.iconUrl}/${current.weather[0].icon}@4x.png`;
        this.elements.weatherIcon.alt = current.weather[0].description;
        this.elements.temperature.textContent = Math.round(current.main.temp);
        this.elements.description.textContent = current.weather[0].description;
        this.elements.humidity.textContent = `${current.main.humidity}%`;
        this.elements.wind.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
        this.elements.feelsLike.textContent = `${Math.round(current.main.feels_like)}C`;
        this.elements.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        
        // Update 5-day forecast
        this.updateForecast(forecast);
        
        // Update extended forecast for premium users
        if (this.isPremium) {
            this.updateExtendedForecast(forecast);
        }
    }
    
    updateForecast(forecastData) {
        const dailyForecasts = this.groupForecastByDay(forecastData.list);
        
        this.elements.forecastContainer.innerHTML = dailyForecasts.slice(0, 5).map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${this.formatDayShort(new Date(day.dt * 1000))}</div>
                <img class="forecast-icon" src="${this.iconUrl}/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                <div class="forecast-temp">
                    ${Math.round(day.main.temp_max)}C
                    <span class="forecast-temp-min">${Math.round(day.main.temp_min)}C</span>
                </div>
            </div>
        `).join('');
    }
    
    updateExtendedForecast(forecastData) {
        // Simulate 14-day forecast (API only provides 5 days, this would need a different API for real 14-day data)
        const dailyForecasts = this.groupForecastByDay(forecastData.list);
        
        // For demo purposes, we repeat and slightly modify the existing data
        const extendedData = [];
        for (let i = 0; i < 14; i++) {
            const sourceDay = dailyForecasts[i % dailyForecasts.length];
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + i + 6); // Start after 5-day forecast
            extendedData.push({
                ...sourceDay,
                dt: newDate.getTime() / 1000,
                main: {
                    ...sourceDay.main,
                    temp_max: sourceDay.main.temp_max + (Math.random() * 4 - 2),
                    temp_min: sourceDay.main.temp_min + (Math.random() * 4 - 2)
                }
            });
        }
        
        this.elements.extendedForecastContainer.innerHTML = extendedData.slice(0, 9).map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${this.formatDayShort(new Date(day.dt * 1000))}</div>
                <img class="forecast-icon" src="${this.iconUrl}/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                <div class="forecast-temp">
                    ${Math.round(day.main.temp_max)}C
                    <span class="forecast-temp-min">${Math.round(day.main.temp_min)}C</span>
                </div>
            </div>
        `).join('');
    }
    
    groupForecastByDay(list) {
        const days = {};
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!days[date]) {
                days[date] = item;
            } else {
                days[date].main.temp_max = Math.max(days[date].main.temp_max, item.main.temp_max);
                days[date].main.temp_min = Math.min(days[date].main.temp_min, item.main.temp_min);
            }
        });
        return Object.values(days);
    }
    
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }
    
    formatDayShort(date) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    }
    
    updateBackground(weatherMain, sys) {
        const now = Date.now() / 1000;
        const isNight = now < sys.sunrise || now > sys.sunset;
        
        let gradient = '--sunny';
        let particleType = 'sun';
        
        if (isNight) {
            gradient = '--night';
            particleType = 'stars';
        } else {
            switch (weatherMain.toLowerCase()) {
                case 'clear':
                    gradient = '--sunny';
                    particleType = 'sun';
                    break;
                case 'clouds':
                    gradient = '--cloudy';
                    particleType = 'clouds';
                    break;
                case 'rain':
                case 'drizzle':
                    gradient = '--rainy';
                    particleType = 'rain';
                    break;
                case 'thunderstorm':
                    gradient = '--stormy';
                    particleType = 'lightning';
                    break;
                case 'snow':
                    gradient = '--snowy';
                    particleType = 'snow';
                    break;
                default:
                    gradient = '--sunny';
            }
        }
        
        document.body.style.background = `var(${gradient})`;
        this.createParticles(particleType);
    }
    
    createParticles(type) {
        this.elements.particles.innerHTML = '';
        
        const particleCount = type === 'rain' ? 100 : type === 'snow' ? 50 : 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${type}`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationDuration = `${3 + Math.random() * 4}s`;
            
            if (type === 'stars') {
                particle.style.top = `${Math.random() * 100}%`;
            }
            
            this.elements.particles.appendChild(particle);
        }
    }
}

// Premium Modal Functions
function openPremiumModal() {
    document.getElementById('premiumModal').classList.add('active');
}

function closePremiumModal() {
    document.getElementById('premiumModal').classList.remove('active');
}

function upgradeToPremium() {
    // Placeholder for Stripe integration
    alert('Integration Stripe requise.\n\nPour activer les paiements:\n1. Creez un compte Stripe\n2. Configurez Stripe Checkout\n3. Implementez la logique de paiement\n\nVoir les instructions dans le modal.');
}

// Alerts Modal Functions
function openAlertsModal() {
    const isPremium = localStorage.getItem('weather_app_premium') === 'true';
    if (!isPremium) {
        openPremiumModal();
        return;
    }
    document.getElementById('alertsModal').classList.add('active');
}

function closeAlertsModal() {
    document.getElementById('alertsModal').classList.remove('active');
}

function saveAlerts() {
    const alerts = {
        rain: document.getElementById('alertRain').checked,
        temp: document.getElementById('alertTemp').checked,
        tempMin: document.getElementById('alertTempMin').value,
        tempMax: document.getElementById('alertTempMax').value,
        wind: document.getElementById('alertWind').checked,
        snow: document.getElementById('alertSnow').checked
    };
    
    localStorage.setItem('weather_alerts', JSON.stringify(alerts));
    alert('Alertes sauvegardees!\n\nNote: L\'envoi de notifications necessite une implementation backend avec des services comme Firebase Cloud Messaging ou Web Push API.');
    closeAlertsModal();
}

// Dev function to simulate premium (for testing)
function simulatePremium(enable = true) {
    localStorage.setItem('weather_app_premium', enable.toString());
    location.reload();
}

// Particle animations
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    .particle {
        position: absolute;
        pointer-events: none;
    }
    
    .particle-rain {
        width: 2px;
        height: 20px;
        background: linear-gradient(transparent, rgba(255, 255, 255, 0.6));
        animation: rain-fall linear infinite;
    }
    
    .particle-snow {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        opacity: 0.8;
        animation: snow-fall linear infinite;
    }
    
    .particle-sun {
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: float ease-in-out infinite;
    }
    
    .particle-stars {
        width: 3px;
        height: 3px;
        background: white;
        border-radius: 50%;
        animation: twinkle ease-in-out infinite;
    }
    
    .particle-clouds {
        width: 60px;
        height: 30px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        animation: cloud-drift linear infinite;
    }
    
    @keyframes rain-fall {
        0% { transform: translateY(-100vh); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
    }
    
    @keyframes snow-fall {
        0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
        50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
    }
    
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    
    @keyframes cloud-drift {
        0% { transform: translateX(-100px); }
        100% { transform: translateX(100vw); }
    }
`;
document.head.appendChild(particleStyles);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});