# 🌦️ WeatherApp  

**WeatherApp** is a simple and efficient weather forecasting mobile application built using **JavaScript, HTML, and CSS**, with **Open-Meteo API** for weather data. The app is designed to run on **Android devices** using **Apache Cordova**.  

## 📌 Features  
- ✅ Get real-time weather updates based on your current location.  
- ✅ View daily and hourly weather forecasts.  
- ✅ Displays temperature, precipitation, sunrise, sunset, and weather conditions.  
- ✅ Lightweight and optimized for mobile performance.  
- ✅ Fully responsive UI with weather icons and background updates.  

## 🔧 Technologies Used  
- **Cordova**: To render the app on Android devices.  
- **JavaScript (Vanilla JS)**: For handling API requests and updating the UI.  
- **HTML & CSS**: For structuring and styling the app.  
- **Open-Meteo API**: To fetch real-time weather data.  
- **Geolocation API**: To detect the user's current location.  

## 🚀 Installation & Setup  

### Clone the repository:  
```sh
git clone https://github.com/yourusername/WeatherApp.git
cd WeatherApp
```

### Install Cordova globally (if not installed):  
```sh
npm install -g cordova
```

### Add Android platform:  
```sh
cordova platform add android
```

### Build and run the app on an emulator or a connected Android device:  
```sh
cordova run android
```

## 🌍 API Integration  

This app fetches weather data using the **Open-Meteo API**:  

- **Endpoint**:  
  ```
  https://api.open-meteo.com/v1/forecast
  ```
- **Parameters**:  
  ```
  latitude, longitude, current_weather, hourly, daily, timezone
  ```
- **Example Request**:  
  ```sh
  https://api.open-meteo.com/v1/forecast?latitude=35&longitude=-5&current_weather=true&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto
  ```
- **Reverse Geocoding API** (for city names):  
  ```sh
  https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json
  ```

## 💡 Future Improvements  
- 🔹 Add a search feature for different locations.  
- 🔹 Implement offline support using local storage.  
- 🔹 Improve UI/UX with animations and more styling.  

## 📜 License  
This project is **open-source** and available under the **MIT License**.  

