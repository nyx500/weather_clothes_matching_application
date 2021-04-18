document.addEventListener('DOMContentLoaded', function() {

    window.city = 'no_city';
    history.pushState({ city: window.city }, ``, ``);

    document.onkeydown = (e) => {
        if (e.key === 'F5' || ((e.key === 'r' || e.key === 'R') && e.ctrlKey)) {
            refresh(e);
        }
    }

    if (document.querySelector('#find-the-weather')) {
        document.querySelector('#find-the-weather').style.display = 'block';
    }
    if (document.querySelector('#fake-form')) {
        document.querySelector('#fake-form').style.display = 'block';
    }

    document.querySelector('#city-button').onclick = () => {
        if (document.querySelector('#message')) {
            document.querySelector('#message').remove();
        }
        if (document.querySelector('#city').value !== "") {
            window.city = `${document.querySelector('#city').value}`;
            history.pushState({ city: window.city }, ``, `${window.city}`);
            console.log(`Push State: ${history.state.city}`);
            getWeatherData(window.city);
            if (document.querySelector('#find-the-weather')) {
                document.querySelector('#find-the-weather').style.display = 'none';
            }
            if (document.querySelector('#fake-form')) {
                document.querySelector('#fake-form').style.display = 'none';
            }
        } else {
            message = document.createElement('h2');
            message.id = "message";
            message.innerHTML = 'You must enter a city!';
            message.style.color = 'red';
            message.style.marginTop = '5px';
            document.querySelector('#main').append(message);
        }
    }
})

function getWeatherData(city) {
    if (city === 'no_city') {
        fetch(`city/${city}`);
        document.querySelector('#fake-form').style.display = 'block';
        document.querySelector('#find-the-weather').style.display = 'block';
        if (document.querySelector('#data')) {
            document.querySelector('#data').remove();
        }
    } else {
        fetch(`city/${city}`)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                document.querySelector('#fake-form').style.display = 'none';
                document.querySelector('#find-the-weather').style.display = 'none';
                const data = document.createElement('div');
                data.id = "data";
                data.innerHTML = `The weather in ${response["region"]} at ${response["time"]} is <b>${response["weather"].toLowerCase()}</b>.`;
                document.querySelector('#main').append(data);
                data.style.display = 'block';
            })
    }
}

// Allows the user to refresh the page successfully without being taken to the pushState URL which doesn't actually exist
function refresh(e) {
    if (document.querySelector('#data')) {
        document.querySelector('#data').remove();
    }
    e.preventDefault();
    console.log('refresh');
    getWeatherData(window.city);
}

window.addEventListener('popstate', e => {
    getWeatherData(e.state.city);
    console.log(`State: ${e.state.city}`);
})