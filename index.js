let map;
let service;
let infowindow;
let geocoder;


function renderNewForm() {
	//this function will be responsible for generating new input box on results page 
	$('.input-box').html(`
		<form class="js-form results-page">
			<input type="text" class="js-query address" id="address" placeholder="Enter an address">
			<button type="submit">Submit</button>
		</form>
		`)
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
	$('.weather-container').html(`
		The weather today is ${fahr_temp} F.
		`)
}

function getLatLng(address) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			let latLng = results[0].geometry.location;
      		getDataFromMap(latLng);
      		let zipcode = results[0].address_components[7].long_name;
      		console.log(zipcode);
      		getDataFromWeather(zipcode, displayWeatherSearchData);
			console.log(`getLatLng ran and the coordinates are: ${latLng}`);

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
		zoom: 11
		//zoomControl: true,
		//zoomControlOptions: {
			//position: google.maps.ControlPosition.LEFT_CENTER}
		});

	let request = {
		location: center,
		radius: 8047, // about 5 mi radius
		type: ['cafe']
	};

	infowindow = new google.maps.InfoWindow();

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


// each place is a cafe result
function createMarker(place){
	console.log('function createMarker ran');
	let placeLoc = place.geometry.location; // does not return object
	let marker = new google.maps.Marker({
		map: map,
		position: placeLoc 
	});

	let infowindow = new google.maps.InfoWindow( {
		content: `<div class="marker">${place.name} <br> ${place.vicinity}</div>`
		// https://developers.google.com/maps/documentation/javascript/infowindows
	});

	google.maps.event.addListener(marker, 'click', function() {
			//infowindow.setContent(place.name);
			console.log(map);
			console.log(placeLoc);
			infowindow.open(map, this);
			map.setZoom(15);
			map.panTo(placeLoc)
		});
	};


function watchSubmit() {
	// this function will be responsible for generating playlist and showtimes
	// on screen when user submits input into search box

	$('.js-form').on("submit", function() {
		event.preventDefault();
		const queryTarget = $(event.currentTarget).find('#address');
    	const query = queryTarget.val();
		console.log(`user has submitted ${query}.`);
    	getLatLng(query);
  		renderNewForm();
  		});
}

$(watchSubmit);