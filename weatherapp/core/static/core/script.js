document.addEventListener('DOMContentLoaded', function() {

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
            let city = `${document.querySelector('#city').value}`;
            fetch(`city/${city}`)
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    document.querySelector('#find-the-weather').style.display = 'none';
                    document.querySelector('#fake-form').style.display = 'none';
                    document.querySelector('#main').innerHTML = response;
                    history.pushState({ city }, ``, `city/${city}`);
                })
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

window.addEventListener('popstate', () => {
    fetch(`city/no_city`);
    if (document.querySelector('#find-the-weather')) {
        document.querySelector('#find-the-weather').style.display = 'block';
    }
    if (document.querySelector('#fake-form')) {
        document.querySelector('#fake-form').style.display = 'block';
    }
    document.querySelector('#main').innerHTML = '';
    location.reload();
})