/* =========================================
   AMBIENTDESK — WEATHER MODULE
   File: js/weather.js
   API: Open-Meteo
========================================= */

export function initWeather() {

    const elements = {

        icon: document.getElementById("weather-icon"),

        temperature: document.getElementById("temperature"),

        description: document.getElementById(
            "weather-description"
        ),

        location: document.getElementById(
            "weather-location"
        ),

        wind: document.getElementById("wind-speed"),

        humidity: document.getElementById("humidity"),

        refresh: document.getElementById(
            "refresh-weather"
        )

    };


    /* =====================================
       DEFAULT LOCATION
    ===================================== */

    const defaultLocation = {

        latitude: 27.7172,

        longitude: 85.3240,

        name: "Kathmandu"

    };


    let currentLocation = { ...defaultLocation };

    let loading = false;


    /* =====================================
       WEATHER CODE DESCRIPTIONS
    ===================================== */

    const weatherCodes = {

        0: {
            description: "Clear sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Foggy",
            icon: "🌫️"
        },

        48: {
            description: "Depositing rime fog",
            icon: "🌫️"
        },

        51: {
            description: "Light drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Moderate drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Dense drizzle",
            icon: "🌧️"
        },

        56: {
            description: "Freezing drizzle",
            icon: "🌧️"
        },

        57: {
            description: "Heavy freezing drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Slight rain",
            icon: "🌧️"
        },

        63: {
            description: "Moderate rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy rain",
            icon: "🌧️"
        },

        66: {
            description: "Freezing rain",
            icon: "🌧️"
        },

        67: {
            description: "Heavy freezing rain",
            icon: "🌧️"
        },

        71: {
            description: "Slight snowfall",
            icon: "🌨️"
        },

        73: {
            description: "Moderate snowfall",
            icon: "❄️"
        },

        75: {
            description: "Heavy snowfall",
            icon: "❄️"
        },

        77: {
            description: "Snow grains",
            icon: "🌨️"
        },

        80: {
            description: "Rain showers",
            icon: "🌦️"
        },

        81: {
            description: "Moderate rain showers",
            icon: "🌧️"
        },

        82: {
            description: "Violent rain showers",
            icon: "⛈️"
        },

        85: {
            description: "Snow showers",
            icon: "🌨️"
        },

        86: {
            description: "Heavy snow showers",
            icon: "❄️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with hail",
            icon: "⛈️"
        },

        99: {
            description: "Heavy thunderstorm",
            icon: "⛈️"
        }

    };


    /* =====================================
       SHOW LOADING STATE
    ===================================== */

    function showLoading() {

        if (elements.description) {

            elements.description.textContent =
                "Getting weather...";

        }

        if (elements.refresh) {

            elements.refresh.disabled = true;

            elements.refresh.classList.add("loading");

        }

    }


    /* =====================================
       HIDE LOADING STATE
    ===================================== */

    function hideLoading() {

        if (elements.refresh) {

            elements.refresh.disabled = false;

            elements.refresh.classList.remove("loading");

        }

        loading = false;

    }


    /* =====================================
       DISPLAY ERROR
    ===================================== */

    function showError(message) {

        if (elements.description) {

            elements.description.textContent = message;

        }

        if (elements.icon) {

            elements.icon.textContent = "🌥️";

        }

    }


    /* =====================================
       GET WEATHER DESCRIPTION
    ===================================== */

    function getWeatherInfo(code) {

        return weatherCodes[code] || {

            description: "Unknown conditions",

            icon: "🌡️"

        };

    }


    /* =====================================
       UPDATE WEATHER UI
    ===================================== */

    function updateWeather(data) {

        const current = data.current;

        const weather = getWeatherInfo(
            current.weather_code
        );


        /* Temperature */

        if (elements.temperature) {

            elements.temperature.textContent =
                `${Math.round(current.temperature_2m)}°`;

        }


        /* Weather icon */

        if (elements.icon) {

            elements.icon.textContent = weather.icon;

        }


        /* Description */

        if (elements.description) {

            elements.description.textContent =
                weather.description;

        }


        /* Location */

        if (elements.location) {

            elements.location.textContent =
                currentLocation.name;

        }


        /* Wind speed */

        if (elements.wind) {

            elements.wind.textContent =
                `${Math.round(current.wind_speed_10m)} km/h`;

        }


        /* Humidity */

        if (elements.humidity) {

            elements.humidity.textContent =
                `${current.relative_humidity_2m}%`;

        }

    }


    /* =====================================
       FETCH WEATHER
    ===================================== */

    async function fetchWeather() {

        if (loading) return;

        loading = true;

        showLoading();

        const latitude = currentLocation.latitude;

        const longitude = currentLocation.longitude;


        const url = new URL(
            "https://api.open-meteo.com/v1/forecast"
        );

        url.search = new URLSearchParams({

            latitude,

            longitude,

            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "wind_speed_10m"
            ].join(","),

            timezone: "auto"

        });


        try {

            const response = await fetch(url);

            if (!response.ok) {

                throw new Error(
                    "Weather service is unavailable."
                );

            }

            const data = await response.json();

            if (!data.current) {

                throw new Error(
                    "Weather information is unavailable."
                );

            }

            updateWeather(data);

        } catch (error) {

            console.error(
                "Weather error:",
                error
            );

            showError(
                "Unable to load weather. Try again."
            );

        } finally {

            hideLoading();

        }

    }


    /* =====================================
       GET USER LOCATION
    ===================================== */

    function useCurrentLocation() {

        if (!navigator.geolocation) {

            showError(
                "Location is not supported by this browser."
            );

            return;

        }

        if (loading) return;

        loading = true;

        showLoading();

        navigator.geolocation.getCurrentPosition(

            position => {

                currentLocation = {

                    latitude: position.coords.latitude,

                    longitude: position.coords.longitude,

                    name: "Your location"

                };

                loading = false;

                fetchWeather();

            },

            error => {

                console.warn(
                    "Location permission unavailable:",
                    error
                );

                hideLoading();

                if (error.code === error.PERMISSION_DENIED) {

                    showError(
                        "Location permission denied. Using Kathmandu."
                    );

                } else {

                    showError(
                        "Couldn't access location. Using Kathmandu."
                    );

                }

                currentLocation = { ...defaultLocation };

                fetchWeather();

            },

            {

                enableHighAccuracy: false,

                timeout: 10000,

                maximumAge: 600000

            }

        );

    }


    /* =====================================
       REFRESH BUTTON
    ===================================== */

    if (elements.refresh) {

        elements.refresh.addEventListener(
            "click",
            () => {

                useCurrentLocation();

            }
        );

    }


    /* =====================================
       INITIALIZE WEATHER
    ===================================== */

    fetchWeather();


    /* =====================================
       AUTOMATIC REFRESH
    ===================================== */

    const refreshInterval = setInterval(
        fetchWeather,
        15 * 60 * 1000
    );


    /* =====================================
       PUBLIC API
    ===================================== */

    return {

        refresh: fetchWeather,

        useCurrentLocation,

        destroy() {

            clearInterval(refreshInterval);

        }

    };

}
