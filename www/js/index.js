document.addEventListener("deviceready", function () {
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
        if (status.hasPermission) {
            getLocation();
        } else {
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
                if (status.hasPermission) {
                    getLocation();
                } else {
                    alert("Location permission denied. Please enable it in settings.");
                }
            }, () => {
                alert("Error requesting location permission.");
            });
        }
    }, () => {
        alert("Error checking location permission.");
    });
});

function getLocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            getCityName(latitude, longitude);
        },
        function () {
            alert("Unable to get location. Please enable location services.");
        }
    );
}

function getCityName(latitude, longitude) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var data = JSON.parse(xhr.responseText);
                var city = data.address && (data.address.city || data.address.town || data.address.village || data.address.country);
            } catch (e) {
                city = "Unknown Location";
            }
        }
        fetchWeatherData(latitude, longitude, city);

    };
    xhr.onerror = () => {
        fetchWeatherData(latitude, longitude, "Unknown Location");
    };
    xhr.send();
}

function fetchWeatherData(latitude, longitude, cityName) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode,precipitation_hours&timezone=auto`);
    xhr.onload = function () {

        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var weatherData = JSON.parse(xhr.responseText);
                updateWeatherUI(weatherData, cityName);
            } catch (e) {
                alert("Invalid JSON response.");
            }
        } else {
            alert("Weather request failed with status " + xhr.status);
        }
    };
    xhr.onerror = function () {
        alert("Network error during weather request.");
    };
    xhr.send();
}

function updateWeatherUI(data, city) {
    const { current_weather, daily, hourly } = data;
    updateElement(".temperature", `${Math.round(current_weather.temperature)}°`);
    updateElement(".city", city);
    updateElement(".temp-range", `${Math.round(daily.temperature_2m_max[0])}°/${Math.round(daily.temperature_2m_min[0])}° Feels like ${Math.round(current_weather.temperature)}°`);
    updateElement(".update-time", new Date(current_weather.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    updateElement(".weather-icon", `./img/${current_weather.weathercode}.png`, "src");

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
        rows[1] += `<td><img src="./img/${hourly.weathercode[i]}.png" width="50px" /></td>`;
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
        if (attr === "text") {
            element.textContent = content;
        }
        else {
            element.setAttribute(attr, content);
        }
    }
}

function toggleVisibility(selector, show) {
    const element = document.querySelector(selector);
    if (element) element.style.display = show ? "block" : "none";
}

function formatTime(time) {
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
