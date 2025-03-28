document.addEventListener("DOMContentLoaded", ()=> {
    const searchButton = document.getElementById("search-btn")
    const cityInput = document.getElementById("search-bar")
    const listOfRecentSearches = document.getElementById("recentSearches")

    cityInput.addEventListener("keypress", (events) => {
        if (events.key === "Enter"){
            handleGetCityWeather()
        }
    })
    function handleGetCityWeather() {
        const city = cityInput.value.trim();
        if (city) {
            getCityWeather(city);
        }
    }


    searchButton.addEventListener("click", () => {
        const city = cityInput.value.trim()
        if (city){
            getCityWeather(city)
        }
    })


    function getCityWeather(city){
        getCityCoordinates(city)
        .then(coords => {
            if (coords === null || coords === undefined) return;
            const {lat, lon } = coords;

            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(res => res.json())
            .then( data => {
                displayCityWeather (city, data.current_weather)
                saveRecentSearch(city)
            })

        })
        .catch(error => console.error("Error fetching weather:", error))
    }

    function getCityCoordinates(city){
        return fetch (`https://nominatim.openstreetmap.org/search?q=${city}&format=json`)
        .then (res => res.json())
        .then( data => {
            if (data.length === 0){
                alert("City not Found!")
                return null
            }
            return {lat: data[0].lat, lon: data[0].lon }
        })
    }

    function weatherDescription(code) {
        const weatherConditions = {
            0: "Clear Sky",
            1: "Mainly Clear",
            2: "Partly Cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing Rime Fog",
            51: "Light Drizzle",
            53: "Moderate Drizzle",
            55: "Heavy Drizzle",
            61: "Light Rain",
            63: "Moderate Rain",
            65: "Heavy Rain",
            71: "Light Snow",
            73: "Moderate Snow",
            75: "Heavy Snow",
            95: "Thunderstorm",
            96: "Thunderstorm with Hail"
        };
        return weatherConditions[code] || "Unknown Weather";
    }


    function displayCityWeather(city, weather){
        document.getElementById("city").textContent = city
        document.getElementById("temp").textContent = `Temperature: ${weather.temperature}°C`
        document.getElementById("windSpeed").textContent = `Wind Speed: ${weather.windspeed} km/h`

        const weatherCondition = weatherDescription(weather.weathercode)
        document.getElementById("weatherCondition").textContent = `Condition: ${weatherCondition}`

        const iconSrc = getWeatherIcon(weather.weathercode);
        document.getElementById("weatherIcon").src = iconSrc;
        document.getElementById("weatherIcon").alt = weatherCondition;

    }

    function saveRecentSearch(city){
        let searchHistory = JSON.parse(localStorage.getItem("recentSearches")) || []
        console.log(searchHistory);
        
        if( !searchHistory.includes(city)){
            searchHistory.unshift(city)
            if(searchHistory.length > 5)
                searchHistory.pop()
            localStorage.setItem("recentSearches", JSON.stringify(searchHistory))
            updateRecentSearches()
        }
    }

    function updateRecentSearches(){
        let searchHistory = JSON.parse(localStorage.getItem("recentSearches")) || []
        listOfRecentSearches.innerHTML = "";
        searchHistory.forEach(city => {
            const li = document.createElement("li")
            li.textContent = city
            li.addEventListener("click", () => getCityWeather(city))

            li.addEventListener("mouseover", () => {
                li.style.backgroundColor = "grey"
                li.style.cursor = "pointer"
            })

            li.addEventListener("mouseout", () => {
                li.style.backgroundColor = "transparent"
            })

            listOfRecentSearches.appendChild(li)
        })   
    }
    updateRecentSearches();
    
    function getWeatherIcon(code) {
        const iconMap = {
            0: "clear.png",
            1: "mostly-clear.png",
            2: "partly-cloudy.png",
            3: "overcast.png",
            45: "foggy.png",
            48: "foggy.png",
            51: "drizzle.png",
            53: "drizzle.png",
            55: "drizzle.png",
            61: "rain.png",
            63: "rain.png",
            65: "heavy-rain.png",
            71: "snow.png",
            73: "snow.png",
            75: "heavy-snow.png",
            95: "thunderstorm.png",
            96: "thunderstorm-hail.png"
        };
        return `icons/${iconMap[code] || "unknown.png"}`;
    }


})

