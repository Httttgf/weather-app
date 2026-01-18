/* =============================================
   WEATHER APP - JAVASCRIPT
   ============================================= */

class WeatherApp {
    constructor() {
        this.apiKey = localStorage.getItem('openweather_api_key') || '';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.iconUrl = 'https://openweathermap.org/img/wn';
        
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
            temp: document.getElementById('temp'),
            description: document.getElementById('description'),
            humidity: document.getElementById('humidity'),
            wind: document.getElementById('wind'),
            feelsLike: document.getElementById('feelsLike'),
            visibility: document.getElementById('visibility'),
            forecastCards: document.getElementById('forecastCards'),
            animatedBg: document.getElementById('animatedBg'),
            particles: document.getElementById('particles')
        };
        
        this.currentCity = localStorage.getItem('lastCity') || 'Paris';
        this.init();
    }
    
    init() {
        this.bindEvents();
        
        if (!this.apiKey) {
            this.showModal();
        } else {
            this.fetchWeather(this.currentCity);
        }
    }
    
    bindEvents() {
        // API Key Modal
        this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
        this.elements.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        
        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.showModal());
        
        // Search
        this.elements.searchBtn.addEventListener('click', () => this.search());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
        
        // Retry
        this.elements.retryBtn.addEventListener('click', () => this.fetchWeather(this.currentCity));
    }
    
    showModal() {
        this.elements.apiModal.classList.add('active');
        this.elements.apiKeyInput.value = this.apiKey;
        this.elements.apiKeyInput.focus();
    }
    
    hideModal() {
        this.elements.apiModal.classList.remove('active');
    }
    
    saveApiKey() {
        const key = this.elements.apiKeyInput.value.trim();
        if (key) {
            this.apiKey = key;
            localStorage.setItem('openweather_api_key', key);
            this.hideModal();
            this.fetchWeather(this.currentCity);
        }
    }
    
    search() {
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
    
    showError(message) {
        this.elements.loading.classList.remove('active');
        this.elements.error.classList.add('active');
        this.elements.weatherContent.classList.remove('active');
        this.elements.errorMessage.textContent = message;
    }
    
    showContent() {
        this.elements.loading.classList.remove('active');
        this.elements.error.classList.remove('active');
        this.elements.weatherContent.classList.add('active');
    }
    
    async fetchWeather(city) {
        if (!this.apiKey) {
            this.showModal();
            return;
        }
        
        this.showLoading();
        
        try {
            // Fetch current weather
            const currentResponse = await fetch(
                `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`
            );
            
            if (!currentResponse.ok) {
                if (currentResponse.status === 401) {
                    throw new Error('ClÃ© API invalide. VÃ©rifiez vos paramÃ¨tres.');
                } else if (currentResponse.status === 404) {
                    throw new Error('Ville non trouvÃ©e. VÃ©rifiez l\'orthographe.');
                }
                throw new Error('Erreur lors de la rÃ©cupÃ©ration des donnÃ©es.');
            }
            
            const currentData = await currentResponse.json();
            
            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`
            );
            
            if (!forecastResponse.ok) {
                throw new Error('Erreur lors de la rÃ©cupÃ©ration des prÃ©visions.');
            }
            
            const forecastData = await forecastResponse.json();
            
            // Update UI
            this.updateCurrentWeather(currentData);
            this.updateForecast(forecastData);
            this.updateBackground(currentData);
            
            // Save last searched city
            this.currentCity = city;
            localStorage.setItem('lastCity', city);
            
            this.showContent();
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message);
        }
    }
    
    updateCurrentWeather(data) {
        const { name, sys, main, weather, wind, visibility } = data;
        
        // Location
        this.elements.cityName.textContent = `${name}, ${sys.country}`;
        this.elements.date.textContent = this.formatDate(new Date());
        
        // Weather
        this.elements.weatherIcon.src = `${this.iconUrl}/${weather[0].icon}@4x.png`;
        this.elements.weatherIcon.alt = weather[0].description;
        this.elements.temp.textContent = Math.round(main.temp);
        this.elements.description.textContent = weather[0].description;
        
        // Details
        this.elements.humidity.textContent = `${main.humidity}%`;
        this.elements.wind.textContent = `${Math.round(wind.speed * 3.6)} km/h`;
        this.elements.feelsLike.textContent = `${Math.round(main.feels_like)}Â°C`;
        this.elements.visibility.textContent = `${Math.round(visibility / 1000)} km`;
    }
    
    updateForecast(data) {
        // Get one forecast per day (at noon)
        const dailyForecasts = this.getDailyForecasts(data.list);
        
        this.elements.forecastCards.innerHTML = dailyForecasts.map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${this.formatDayName(new Date(day.dt * 1000))}</div>
                <img class="forecast-icon" src="${this.iconUrl}/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                <div class="forecast-temp">
                    <span class="temp-high">${Math.round(day.main.temp_max)}Â°</span>
                    <span class="temp-low">${Math.round(day.main.temp_min)}Â°</span>
                </div>
            </div>
        `).join('');
    }
    
    getDailyForecasts(list) {
        const dailyData = {};
        
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyData[date]) {
                dailyData[date] = item;
            }
        });
        
        // Return next 5 days (skip today)
        return Object.values(dailyData).slice(1, 6);
    }
    
    updateBackground(data) {
        const weatherMain = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        const isNight = icon.includes('n');
        
        // Remove all weather classes
        document.body.classList.remove('sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'night');
        
        // Clear particles
        this.elements.particles.innerHTML = '';
        
        // Add appropriate class and particles
        if (isNight) {
            document.body.classList.add('night');
            this.createStars();
        } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
            document.body.classList.add('rainy');
            this.createRain();
        } else if (weatherMain.includes('snow')) {
            document.body.classList.add('snowy');
            this.createSnow();
        } else if (weatherMain.includes('thunder') || weatherMain.includes('storm')) {
            document.body.classList.add('stormy');
            this.createRain();
        } else if (weatherMain.includes('cloud') || weatherMain.includes('mist') || weatherMain.includes('fog')) {
            document.body.classList.add('cloudy');
            this.createClouds();
        } else {
            document.body.classList.add('sunny');
            this.createSunRays();
        }
    }
    
    createRain() {
        for (let i = 0; i < 100; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.animationDuration = (0.5 + Math.random() * 0.3) + 's';
            this.elements.particles.appendChild(drop);
        }
    }
    
    createSnow() {
        for (let i = 0; i < 50; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.width = (5 + Math.random() * 10) + 'px';
            flake.style.height = flake.style.width;
            flake.style.animationDelay = Math.random() * 5 + 's';
            flake.style.animationDuration = (3 + Math.random() * 4) + 's';
            this.elements.particles.appendChild(flake);
        }
    }
    
    createClouds() {
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.width = (100 + Math.random() * 200) + 'px';
            cloud.style.height = (50 + Math.random() * 100) + 'px';
            cloud.style.left = Math.random() * 100 + '%';
            cloud.style.top = Math.random() * 50 + '%';
            cloud.style.animationDelay = Math.random() * 10 + 's';
            this.elements.particles.appendChild(cloud);
        }
    }
    
    createSunRays() {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        this.elements.particles.appendChild(ray);
    }
    
    createStars() {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'snowflake';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = (1 + Math.random() * 3) + 'px';
            star.style.height = star.style.width;
            star.style.animation = 'none';
            star.style.opacity = Math.random();
            this.elements.particles.appendChild(star);
        }
    }
    
    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('fr-FR', options);
    }
    
    formatDayName(date) {
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});