document.addEventListener('DOMContentLoaded', function() {
    document.onkeydown = (e) => {
        if (e.key == 'Enter') {
            window.city = `${document.querySelector('#city').value}`;
            get_data(window.city);
        }
    }
    if (document.querySelector('#city-button')) {
        document.querySelector('#city-button').onclick = () => {
            window.city = `${document.querySelector('#city').value}`;
            get_data(window.city);
        }
    }
})

function get_data(city) {
    let cityObj = {
        body: `${city}`
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
                document.querySelector('#main').innerHTML = `The weather in ${response['region']} now is ${response['weather'].toLowerCase()}. The temperature is ${response['celsius']} degrees Celsius and ${response['fahr']} degrees Fahrenheit. There is ${response['humidity']} humidity. The wind speed is ${response['metric_wind']} and ${response['imperial_wind']}.`
                history.pushState({ city: city }, ``, `/city/${city}/`)
            }
        })
}