window.addEventListener('load', () => {
	let long = -118.243683;
	let lat = 34.052235;
	let locationTimeZone = document.querySelector('.location-timezone');
	let temperatureDegree = document.querySelector('.temperature-degree');
	let temperatureDescription = document.querySelector('.temperature-description');
	let weatherIcon = document.querySelector('.icon');
	let zipcodeInput = document.querySelector('.input-text');
	let searchBtn = document.querySelector('.search-btn');

	let api;
	let dataFromAPI;
	let temperatureUnit = ' \u00B0F';

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			long = position.coords.longitude;
			lat = position.coords.latitude;
			render(long, lat, null);
		})
	}

	render(long, lat, null)

	searchBtn.addEventListener('click', () => getZipcodeLocation());
	document.querySelector('.temperature').addEventListener('click', () => updateTemperatureUnit(dataFromAPI));
	zipcodeInput.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			searchBtn.click();
		}
	})

	function render(long, lat, city) {
		api =
			`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=imperial&exclude=minutely,hourly,daily&appid=ecf3bcaacd721741ea58571e6fdda2ea`;
		fetch(api)
			.then(response => {
				return response.json();
			})
			.then(data => {
				// rendering currently information
				dataFromAPI = data;
				renderCurrentWeather(data, city);
			})
	}

	function renderCurrentWeather(data, city) {
		const {
			temp,
			weather,
		} = data.current;

		temperatureDegree.textContent = tempUnitConverter(temp) + temperatureUnit;
		temperatureDescription.textContent = weather[0].main;
		if (city === null) {
			locationTimeZone.textContent = data.timezone.split("/")[1].replace("_", " ");
		} else {
			locationTimeZone.textContent = city;
		}
		setIcons(weather[0].icon, weatherIcon);
	}

	function getZipcodeLocation() {
		const zipcode = zipcodeInput.value;
		api = `https://zipcode-geolocation-api.herokuapp.com/api/zipcode/${zipcode}`
		const response = fetch(api)
		
		// In case my database done, the public API will be used
		if (response.ok) {
			const data = response.json();
			const {
				long,
				lat,
				city,
				state
			} = data[0];
			render(long, lat, `${city}, ${state}`);
		} else {
			api =
				`https://app.zipcodebase.com/api/v1/search?apikey=26436530-6642-11eb-b787-4d04f7ef9ea4&codes=${zipcode}&country=US`;
			fetch(api)
				.then(response => {
					return response.json();
				})
				.then(data => {
					const {
						longitude,
						latitude,
						city,
						state_code
					} = data.results[zipcode][0];
					render(longitude, latitude, `${city}, ${state_code}`);
				})
		}
	}

	function updateTemperatureUnit(data) {
		// change the temperature display unit
		temperatureUnit === " \u00B0F" ? temperatureUnit = " \u00B0C" : temperatureUnit = " \u00B0F";
		temperatureDegree.textContent = tempUnitConverter(data.current.temp) + temperatureUnit;
	}

	function tempUnitConverter(temp) {
		if (temperatureUnit === ' \u00B0F') {
			return Math.floor(temp)
		}
		return Math.floor((temp - 32) * 5 / 9);
	}


	let iconIDAdapter = {
		"01d": "CLEAR_DAY",
		"01n": "CLEAR_NIGHT",
		"02d": "PARTLY_CLOUDY_DAY",
		"02n": "PARTLY_CLOUDY_NIGHT",
		"03d": "CLOUDY",
		"03n": "CLOUDY",
		"04d": "CLOUDY",
		"04n": "CLOUDY",
		"09d": "RAIN",
		"09n": "RAIN",
		"10d": "SLEET",
		"10n": "SLEET",
		"11d": "RAIN",
		"11n": "RAIN",
		"13d": "SNOW",
		"13n": "SNOW",
		"50d": "FOG",
		"50n": "FOG"
	};

	function setIcons(icon, iconID) {
		const skycons = new Skycons({
			color: "white"
		});
		const currentIcon = iconIDAdapter[icon];
		skycons.play();
		return skycons.set(iconID, Skycons[currentIcon]);
	}

});
