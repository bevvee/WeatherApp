document.addEventListener("deviceready", async () => {
    try {
        const permissions = cordova.plugins.permissions;
        await requestLocationPermission(permissions);
        getLocation();
    } catch (error) {
        alert(error.message);
    }
});

async function requestLocationPermission(permissions) {
    return new Promise((resolve, reject) => {
        permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, (status) => {
            if (status.hasPermission) return resolve();

            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, (status) => {
                status.hasPermission ? resolve() : reject(new Error("Location permission denied. Please enable it in settings."));
            }, () => reject(new Error("Error requesting location permission.")));
        });
    });
}

function getLocation() {
    navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => fetchWeatherData(latitude, longitude),
        (error) => alert("Unable to retrieve location. Enable location services."),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

async function fetchWeatherData(latitude, longitude) {
    try {
        const [weatherData, cityName] = await Promise.all([
            fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode,precipitation_hours&timezone=auto`),
            getCityName(latitude, longitude),
        ]);

        updateWeatherUI(weatherData, cityName);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
}

async function getCityName(latitude, longitude) {
    try {
        const data = await fetchJson(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        return data.address?.city || data.address?.town || data.address?.village || "Unknown Location";
    } catch {
        return "Unknown Location";
    }
}

function updateWeatherUI(data, city) {
    const { current_weather, daily, hourly } = data;
    updateElement(".temperature", `${Math.round(current_weather.temperature)}°`);
    updateElement(".city", city);
    updateElement(".temp-range", `${Math.round(daily.temperature_2m_max[0])}°/${Math.round(daily.temperature_2m_min[0])}° Feels like ${Math.round(current_weather.temperature)}°`);
    updateElement(".update-time", new Date(current_weather.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    updateElement(".weather-icon", `./img/${getWeatherIcon(current_weather.weathercode)}.png`, "src");

    updateElement(".sunrise-time", formatTime(daily.sunrise[0]));
    updateElement(".sunset-time", formatTime(daily.sunset[0]));

    updateHourlyForecast(hourly);
    updateDailyForecast(daily);
    updateBackground(current_weather.weathercode);

    toggleVisibility(".container", true);
    toggleVisibility(".loader", false);
}

function updateHourlyForecast(hourly) {
    const currentHour = new Date().getHours();
    const table = document.querySelector(".head2 table");
    table.innerHTML = generateTableRows(hourly, currentHour);
}

function generateTableRows(hourly, startHour) {
    let rows = ["<tr>", "<tr>", "<tr>", "<tr>"];
    for (let i = startHour; i < 24; i++) {
        rows[0] += `<td>${formatTime(hourly.time[i])}</td>`;
        rows[1] += `<td><img src="./img/${getWeatherIcon(hourly.weathercode[i])}.png" width="50px" /></td>`;
        rows[2] += `<td>${Math.round(hourly.temperature_2m[i])}°</td>`;
        rows[3] += `<td><img src="./img/water.png" width="15px" /> ${hourly.precipitation_probability[i]}%</td>`;
    }
    return rows.map(row => row + "</tr>").join("");
}

function updateDailyForecast(daily) {
    const table = document.querySelector(".daily-table");
    table.innerHTML = daily.time.map((time, i) => `
      <tr>
        <td>${new Date(time).toLocaleDateString(undefined, { weekday: "long" })}</td>
        <td><img src="./img/water.png" width="15px" /> <span style="width:45px;"> ${Math.round(daily.precipitation_hours[i])} %</span></td>
        <td><img src="./img/sunrise.png" width="20px" /> ${new Date(daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td><img src="./img/sunset.png" width="20px" /> ${new Date(daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${Math.round(daily.temperature_2m_max[i])}°</td>
        <td>${Math.round(daily.temperature_2m_min[i])}°</td>
      </tr>
    `).join("")
}


function getWeatherIcon(code) {
    const icons = {
        0: "sun", 1: "partly-cloudy", 2: "cloudy", 3: "overcast",
        45: "fog", 48: "fog", 51: "drizzle", 53: "drizzle", 55: "drizzle",
        61: "rain", 63: "rain", 65: "rain", 80: "showers", 81: "showers", 82: "showers",
        95: "storm", 96: "storm", 99: "storm"
    };
    return icons[code] || "sun";
}

function updateBackground(code) {
    const colors = {
        0: "#87CEEB", 1: "#B0C4DE", 2: "#B0C4DE", 3: "#B0C4DE",
        45: "#778899", 48: "#778899", 51: "#708090", 53: "#708090", 55: "#708090",
        61: "#708090", 63: "#708090", 65: "#708090", 80: "#87CEFA", 81: "#87CEFA", 82: "#87CEFA",
        95: "#2F4F4F", 96: "#2F4F4F", 99: "#2F4F4F"
    };
    document.body.style.backgroundColor = colors[code] || "#D3D3D3";
}

function updateElement(selector, content, attr = "text") {
    const element = document.querySelector(selector);
    if (element) {
        if (attr === "text") element.textContent = content;
        else element.setAttribute(attr, content);
    }
}

function toggleVisibility(selector, show) {
    const element = document.querySelector(selector);
    if (element) element.style.display = show ? "block" : "none";
}

function formatTime(time) {
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
