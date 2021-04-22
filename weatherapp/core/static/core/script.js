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

window.onpopstate = function() {
    location.reload();
}

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
                document.querySelector('#main').innerHTML = `The weather in ${response['region']} now is <em><b>${response['weather'].toLowerCase()}</b></em>. The temperature is ${response['temp']} degrees Celsius. There is ${response['humidity']}% humidity. The wind speed is ${response['wind']} km/h.`
                let assessment = document.createElement('h5');
                assessment.id = 'assessment';
                history.pushState({ city: city }, ``, `/city/${city}/`)
                if (response['overall_assessment'] <= 5) {
                    assessment.innerHTML = `The weather is cold.`;
                } else if (response['overall_assessment'] > 5 && response['overall_assessment'] <= 10) {
                    assessment.innerHTML = `The weather is quite cool.`;
                } else if (response['overall_assessment'] > 10 && response['overall_assessment'] <= 15) {
                    assessment.innerHTML = `The weather is pleasant and warm.`;
                } else {
                    assessment.innerHTML = `The weather is very hot.`;
                }
                document.querySelector('#main').append(assessment);
            }
        })
}