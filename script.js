const API_KEY = "8ea9ececb9112f3e3ea47d61e5dce7db"; // Replace with your valid API key

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const locationName = document.getElementById("location-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");
const forecastCards = document.getElementById("forecast-cards");
const errorMessage = document.getElementById("error-message");

// Fetch current weather data
async function getWeatherData(location) {
  errorMessage.textContent = ""; // Clear errors
  try {
    let apiUrl;
    if (typeof location === "string") {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please try again.");
      } else {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
    }

    const data = await response.json();
    displayCurrentWeather(data);
    getForecastData(data.coord.lat, data.coord.lon);
  } catch (error) {
    errorMessage.textContent = error.message;
    clearWeatherData();
  }
}

// Fetch 5-day forecast
async function getForecastData(lat, lon) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching forecast data: ${response.statusText}`);
    }
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    errorMessage.textContent = error.message;
    forecastCards.innerHTML = "";
  }
}

// Display current weather
function displayCurrentWeather(data) {
  locationName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
  description.textContent = `Description: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
}

// Display 5-day forecast
function displayForecast(data) {
  forecastCards.innerHTML = "";

  const dailyForecast = {};
  data.list.forEach(item => {
    const date = new Date(item.dt_txt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    if (!dailyForecast[date]) {
      dailyForecast[date] = item; // Take first entry for each day
    }
  });

  Object.values(dailyForecast).slice(1, 6).forEach(item => {
    const date = new Date(item.dt_txt);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;
    const desc = item.weather[0].description;

    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${dayName}</h3>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
      <p>${temp}°C</p>
      <p>${desc}</p>
    `;
    forecastCards.appendChild(card);
  });
}

// Clear weather display
function clearWeatherData() {
  locationName.textContent = "";
  temperature.textContent = "";
  description.textContent = "";
  humidity.textContent = "";
  windSpeed.textContent = "";
  weatherIcon.src = "";
  weatherIcon.alt = "";
  forecastCards.innerHTML = "";
}

// Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  } else {
    errorMessage.textContent = "Please enter a city name.";
    clearWeatherData();
  }
});

// Use current location button
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    errorMessage.textContent = "Getting your location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        errorMessage.textContent = "";
        getWeatherData({ latitude, longitude });
      },
      (error) => {
        errorMessage.textContent = "Unable to retrieve your location. " + error.message;
        clearWeatherData();
      }
    );
  } else {
    errorMessage.textContent = "Geolocation is not supported by your browser.";
    clearWeatherData();
  }
});
// Dark Mode Toggle
const toggleBtn = document.getElementById('toggle-dark');

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleBtn.textContent = document.body.classList.contains('dark') ? "☀️ Light Mode" : "🌙 Dark Mode";
});

