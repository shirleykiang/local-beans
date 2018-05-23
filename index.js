let map;
let service;
let geocoder;
let cityname;
let statename;

function renderNewForm() {
	//this function will be responsible for generating new input box on results page 
	$('.input-box').html(`
		<form class="js-form results-page">
			<input type="text" class="js-query address" id="address" placeholder="Enter an address">
			<input type="submit">
		</form>
		`)

	watchSubmit();
}

function getDataFromWeather(zipCode, callback) {
	// this function will be responsible for generating weather data
	const query = {
		zip: zipCode,
		APPID: 'e9a2333fea7d3114a9c478f3d5bef35e'
	}

	const WEATHER_ENDPOINT_URL = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us`
	$.getJSON(WEATHER_ENDPOINT_URL, query, callback)
}


function displayWeatherSearchData(data) {
	//this function will be responsible for displaying weather data
	let fahr_temp = Math.round((data.main.temp - 273.15) * 9/5 + 32);
	if (fahr_temp < 40) {
		
		$('.weather-container').html(`
		The weather today is ${fahr_temp} F. Best stay inside.
		`);


	} else if (fahr_temp >= 40 && fahr_temp < 60) {
		
		$('.weather-container').html(`
		The weather today is a bit chilly at ${fahr_temp} F. Perfect for some nice hot chocolate.
		`);

	} else if (fahr_temp >= 60) {

		$('.weather-container').html(`
		The weather today is ${fahr_temp} F. Perfect for working at a cafe.
		`);
	
	}
}

function getLatLng(address) {
	geocoder = new google.maps.Geocoder();

	let zipcode;
	let cityname;
	let statename;

	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			console.log(`this is the geocode object:`);
			console.log(results[0]);
			let latLng = results[0].geometry.location;
      		getDataFromMap(latLng);

      		//find zipcode
      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === "postal_code") {
      				zipcode = results[0].address_components[i].short_name;
      				console.log(`This is the zipcode: ${zipcode}`);
      			}
      		}

      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === "locality") {
      				cityname = results[0].address_components[i].short_name;
      				console.log(`This is the city: ${cityname}`);
      			}
      		}

      		for (let i=0; i<results[0].address_components.length; i++) {
      			if (results[0].address_components[i].types[0] === "administrative_area_level_1") {
      				statename = results[0].address_components[i].short_name;
      				console.log(`This is the state: ${statename}`);
      			}
      		}
      	
      		if (zipcode && cityname && statename) {
      			$('.citystate-container').html(`Current Location: ${cityname}, ${statename}`);
      			getDataFromWeather(zipcode, displayWeatherSearchData);
      		} else {
      			$('.citystate-container').html('Your search returned no results. Please try again.')
      		}

		} else {
			console.log('Geocode was not successful for the following reason: ' + status);
			// some msg displayed prompting user to re-enter address
		}
	})
}


function getDataFromMap(latLang) {
	//this function will be responsible for generating map data 

	console.log('function getDataFromMap ran');
	let center = latLang; // google HQ 
  	console.log(latLang);
	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 13
		//zoomControl: true,
		//zoomControlOptions: {
			//position: google.maps.ControlPosition.LEFT_CENTER}
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
			map.setZoom(16);
			map.panTo(current_marker.position)
		});

	let request = {
		location: center,
		radius: 7600, // in meters, equiv to about 5 mi radius
		type: ['cafe']
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
}


//responsible for moving the map center to selected cafe result 
// function handleItemMapView() {
// 	//console.log('handleItemMapView ran');
// 	$('.coffee-listings').on('click', '.listing', function() {
// 		console.log('clicking on a listing right now');
// 		let position = $(this).data('lnglat');
// 		let final_position = position.substr(1).slice(0, -1);
// 		console.log(map);
// 		map.setZoom(15);
		// let latlng = new google.maps.LatLng(final_position);
		// console.log(latlng);
		//map.panTo(latlng);
// 	});
// }

function callback(results,status) {
	console.log('function callback ran');
	let htmlListings = '';
	if(status == google.maps.places.PlacesServiceStatus.OK) {
		for (let i=0; i < results.length; i++) {
			let place = results[i];
			createMarker(place);
			htmlListings += `<li><div class='listing' data-lnglat='${place.geometry.location}'>;
			${place.name} @ ${place.vicinity}</div></li>`;
		}
	};

	$('.coffee-listings').html(htmlListings);

	//handleItemMapView();
}


function createMarker(place){
	console.log('function createMarker ran');
	let placeLoc = place.geometry.location;
	let marker = new google.maps.Marker({
		map: map,
		position: placeLoc 
	});

	let infowindow = new google.maps.InfoWindow( {
		content: `<div class="marker">${place.name} <br> ${place.vicinity}</div>`
	});

	google.maps.event.addListener(marker, 'click', function() {
			console.log(map);
			console.log(placeLoc);
			infowindow.open(map, this);
			map.setZoom(16);
			map.panTo(placeLoc)
		});
	};


function watchSubmit() {

	$('.js-form').on("submit", function() {
		event.preventDefault();
		const queryTarget = $(event.currentTarget).find('#address');
    	const query = queryTarget.val();
		console.log(`user has submitted ${query}.`);
    	getLatLng(query);
    	$('.citystate-container').html('');
    	$('.weather-container').html('');
  		renderNewForm();
  		});
}

$(watchSubmit);