document.addEventListener('DOMContentLoaded', function() {

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

function get_data(city, time) {
    console.log(`Time: ${time}`);
    let cityObj = {
        city: city,
        time: time
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
                document.querySelector('#main').innerHTML = `The weather in ${response['region']} ${response['tense']} <em><b>${response['weather'].toLowerCase()}</b></em>. The temperature ${response['tense']} ${response['temp']} degrees Celsius. There ${response['tense']} ${response['humidity']}% humidity. The wind speed ${ response['tense']} ${ response['wind']} km/h. <b>It ${response["tense"]} ${response['is_it_windy']}</b>`
                let assessment = document.createElement('h5');
                assessment.id = 'assessment';
                history.pushState({ city: city }, ``, `/city/${city}/`)
                if (response['overall_assessment'] <= 5) {
                    assessment.innerHTML = `The weather ${response['tense']} cold. Bundle up with a scarf and gloves!`;
                } else if (response['overall_assessment'] > 5 && response['overall_assessment'] <= 10) {
                    assessment.innerHTML = `The weather ${response['tense']} quite cool. Even if it looks sunny, make sure to wear a light jacket or coat!`;
                } else if (response['overall_assessment'] > 10 && response['overall_assessment'] <= 15) {
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
        get_data(window.city, window.time);
    }
}