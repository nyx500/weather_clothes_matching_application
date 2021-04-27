document.addEventListener('DOMContentLoaded', function() {

    var x = get_default();

    document.onkeydown = (e) => {
        if (e.key == 'Enter') {
            get_form_input();
        }
    }

    if (document.querySelector('#city-button')) {
        document.querySelector('#city-button').onclick = () => {
            get_form_input();
        }
    }
})

window.onpopstate = function() {
    location.reload();
}

function if_checked() {
    if (document.querySelector('#now').checked === true) {
        var time = "now";
    } else if (document.querySelector('#later').checked === true) {
        var time = "later";
    } else {
        var time = "tomorrow";
    }
    return time;
}

function which_temperature() {
    if (document.querySelector('#celsius').checked === true) {
        var units = "celsius";
    } else {
        var units = "fahrenheit";
    }
    return units;
}

function get_data(city, time, units) {
    let cityObj = {
        city: city,
        time: time,
        units: units
    };
    fetch('get_data', {
            method: 'POST',
            body: JSON.stringify(cityObj)
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            if (response["Error"]) {
                let error_message = document.createElement('h5');
                error_message.id = "error";
                error_message.innerHTML = `The location input '${city}' is invalid. Please try again.`;
                document.querySelector('#main').append(error_message);
            } else {
                var units = response['units'].charAt(0).toUpperCase() + response['units'].slice(1);
                document.querySelector('#main').innerHTML = `The weather in ${response['region']} ${response['tense']} <em><b>${response['weather'].toLowerCase()}</b></em>. The temperature ${response['tense']} ${response['temp']} degrees ${units}. There ${response['tense']} ${response['humidity']}% humidity. The wind speed ${ response['tense']} ${ response['wind']}. <b>It ${response["tense"]} ${response['is_it_windy']}</b>`
                let assessment = document.createElement('h5');
                assessment.id = 'assessment';
                history.pushState({ city: city }, ``, `/city/${city}/`)
                if (response['overall_assessment'] <= 5) {
                    assessment.innerHTML = `The weather ${response['tense']} cold. Bundle up with a scarf and gloves!`;
                } else if (response['overall_assessment'] > 5 && response['overall_assessment'] <= 13) {
                    assessment.innerHTML = `The weather ${response['tense']} quite cool. Even if it looks sunny, make sure to wear a light jacket or coat!`;
                } else if (response['overall_assessment'] > 13 && response['overall_assessment'] <= 16) {
                    assessment.innerHTML = `The weather ${response['tense']} pleasant and warm.`;
                } else {
                    assessment.innerHTML = `The weather ${response['tense']} very hot. Make sure that you keep well-hydrated.`;
                }
                document.querySelector('#main').append(assessment);
            }
        })
}

function get_form_input() {
    if (document.querySelector("#error")) {
        document.querySelector("#error").remove();
    }
    if (document.querySelector('#submit_error')) {
        document.querySelector('#submit_error').remove();
    }
    window.city = `${document.querySelector('#city').value}`;
    if (window.city === '') {
        var submit_error = document.createElement('h5');
        submit_error.id = "submit_error";
        submit_error.innerHTML = "You have to submit a valid location."
        document.querySelector('#main').append(submit_error);
    } else {
        window.time = if_checked();
        window.units = which_temperature();
        get_data(window.city, window.time, window.units);
    }
}

function get_default() {
    if (!navigator.geolocation) {
        console.log("Geolocation is not supported by your browser");
        return;
    } else {
        navigator.geolocation.getCurrentPosition((position) => {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            get_city(latitude, longitude);
        });
    }
}

// Tutorial from GeeksForGeeks: https://www.geeksforgeeks.org/how-to-get-city-name-by-using-geolocation/
function get_city(latitude, longitude) {
    var xml_request = new XMLHttpRequest();
    xml_request.open('GET', `https://us1.locationiq.com/v1/reverse.php?key=pk.f1cd7768e879c74ad6ce32a649740398&lat=${latitude}&lon=${longitude}&format=json`, true);
    xml_request.send();
    xml_request.onreadystatechange = () => {
        if (xml_request.readyState == 4 && xml_request.status == 200) {
            var city = JSON.parse(xml_request.responseText).address.city;
            if (document.querySelector('#city')) {
                document.querySelector('#city').value = `${city}`;
                document.querySelector('#city').style.color = 'grey';
                document.querySelector('#city').onfocus = () => {
                    document.querySelector('#city').style.color = 'black';
                }
            }
        }
    }
}