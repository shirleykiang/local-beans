let map;
let service;
let geocoder;
let cityname;
let statename;


//changes css styling in response to form submission
function changeStyling() {
  $('html').css({'background-image': 'none', 'background-color': '#fbfbfb'});
  $('h2').prop('hidden',false);
}

//grabs weather data from API based on address user inputted
function getDataFromWeather(zipCode, callback) {
	const query = {
		zip: zipCode,
		APPID: 'e9a2333fea7d3114a9c478f3d5bef35e'
	}

	const WEATHER_ENDPOINT_URL = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us`
	$.getJSON(WEATHER_ENDPOINT_URL, query, callback)
}


//displays data grabbed from weather API
function displayWeatherSearchData(data) {
	let fahr_temp = Math.round((data.main.temp - 273.15) * 9/5 + 32);
	if (fahr_temp < 40) {
		
		$('.weather-container').html(`${fahr_temp}&#176; F`);

    $('.results-header').html(`Stay warm with some hot chocolate.`);

	} else if (fahr_temp >= 40 && fahr_temp < 60) {
		
		$('.weather-container').html(`${fahr_temp}&#176; F`);

    $('.results-header').html(`Perfect weather for some hot chocolate.`)

	} else if (fahr_temp >= 60) {

		$('.weather-container').html(`${fahr_temp}&#176; F`);
	
    $('.results-header').html(`It's a beautiful day to go cafe hopping.`)

	}
}

//generates the geocode for address entered by user
function getLatLng(address) {
	geocoder = new google.maps.Geocoder();

	let zipcode;
	let cityname;
	let statename;

	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			let latLng = results[0].geometry.location;
      		getDataFromMap(latLng);

      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === 'postal_code') {
      				zipcode = results[0].address_components[i].short_name;
      			}
      		}

      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === 'locality') {
      				cityname = results[0].address_components[i].short_name;
      			}
      		}

      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === 'administrative_area_level_1') {
      				statename = results[0].address_components[i].short_name;
      			}
      		}
      	
      		if (zipcode && cityname && statename) {
      			$('.citystate-container').html(`${cityname}, ${statename}`);
      			getDataFromWeather(zipcode, displayWeatherSearchData);
      		} else {
      			$('.citystate-container').html('Your search returned no results. Please try again.')
      		}

		} else {
			console.log('Geocode was not successful for the following reason: ' + status);
			$('.results-header').html('Your search returned no results. Please try again.')
		}
	})
}


//this function will be responsible for generating map data 
function getDataFromMap(latLang) {
	let center = latLang; 
	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 13
		});

	current_marker = new google.maps.Marker({
		map: map,
		position: center,
		icon: 'http://maps.google.com/mapfiles/kml/paddle/blu-stars.png'
	})

	let current_infowindow = new google.maps.InfoWindow({
		content: `Your location`
	});

	google.maps.event.addListener(current_marker, 'click', function() {
			current_infowindow.open(map, this);
			map.setZoom(18);
			map.panTo(current_marker.position)
		});

	let request = {
		location: center,
		radius: 7600,
		type: ['cafe']
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
}


//responsible for moving the map center to selected cafe result 
function handleItemMapView() {
	$('.coffee-listings').on('click', '.listing', function() {
		let this_lat = $(this).data('lat');
		let this_lng = $(this).data('lng');
		map.setZoom(18);
		let latlng = new google.maps.LatLng(this_lat, this_lng);
		map.panTo(latlng);

	});
}

// callback func for google maps api nearby search
function callback(results, status) {
	let htmlListings = '';
	if(status == google.maps.places.PlacesServiceStatus.OK) {
		for (let i=0; i < results.length; i++) {
			let place = results[i];
			createMarker(place);
			htmlListings += `<li><div class="listing" data-lat="${place.geometry.location.lat()}" 
			data-lng="${place.geometry.location.lng()}"><span class="place-name">
			${place.name}</span> <br> <span class="place-address">${place.vicinity}</span></div></li>`;
		}
	};

	$('.coffee-listings').html(htmlListings);

	handleItemMapView();
}

// creates marker for each result generated from google place search
function createMarker(place){
	let placeLoc = place.geometry.location;
	let marker = new google.maps.Marker({
		map: map,
		position: placeLoc 
	});

	let infowindow = new google.maps.InfoWindow( {
		content: `<div class="marker">${place.name} <br> ${place.vicinity}</div>`
	});

	google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, this);
			map.setZoom(16);
			map.panTo(placeLoc)
		});
	};

//generates new input box on results page 
function renderNewForm() {
	$('.home-page').empty();
	$('.new-input-box').html(`
		<form class="js-form results-page" aria-live="assertive">
			<div class="form-style">
			<input type="text" class='js-address results' id="address" placeholder="Search">
			<input type="submit" class="hidden-submit">
			</div>
		</form>
		`)
	watchSubmit();
}

function watchSubmit() {
	$('.js-form').on('submit', function() {
		event.preventDefault();
		const queryTarget = $(event.currentTarget).find('#address');
    	const query = queryTarget.val();
    	getLatLng(query);
    	$('.citystate-container').html('');
    	$('.weather-container').html('');
  		renderNewForm();
  		changeStyling();
  		});
}

$(watchSubmit);