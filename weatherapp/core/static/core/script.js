document.addEventListener('DOMContentLoaded', function() {

    // Gets user's city and puts it into the form as a default value
    get_default();

    // Loads weather data when user presses enter
    if (document.querySelector('#weather-form')) {
        document.onkeydown = (e) => {
            if (e.key == 'Enter') {
                get_form_input();
            }
        }
    }

    // Loads weather data when user presses the submit button
    if (document.querySelector('#submit-button')) {
        document.querySelector('#submit-button').onclick = () => {
            if (document.querySelector('footer')) {
                document.querySelector('footer').style.display = 'none';
            }
            get_form_input();
        }
    }

    // Displays the weather data once user has submitted the form using the items stored in local storage
    if (document.querySelector('#data-response')) {
        get_data(window.localStorage.getItem('city'), window.localStorage.getItem('time'), window.localStorage.getItem('units'));
    }

    document.querySelector('#all-recipes').onclick = () => {
        console.log('CLICKED');
        history.pushState(null, ``, '/recipes', '/recipes');
    }
})

// Enables forward and back buttons to display different bits of loaded JavaScript elements
window.onpopstate = () => {
    window.location.reload();
}


// Takes in user input depending on the time option they chose and returns it as a string to be processed in the function that sends the weather API request to the back-end in Django
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

// Takes in user input about metric or imperial units and returns information as a string
function which_temperature() {
    if (document.querySelector('#celsius').checked === true) {
        var units = "celsius";
    } else {
        var units = "fahrenheit";
    }
    return units;
}

// Creates a div and fills it with the weather data based on the API response
function display_weather_information(response) {

    var information = document.createElement('div');
    information.id = 'information';

    document.querySelector('#main').append(information);

    // Capitalises the first letter of the temperature units
    var units = response['units'].charAt(0).toUpperCase() + response['units'].slice(1);

    // Removes the previous heading if there is one
    if (document.querySelector('#heading')) {
        document.querySelector('#heading').remove();
    }

    // Creates a new heading
    var heading = document.createElement('h1');
    heading.innerHTML = `Weather Results for <em>${response['region']}</em>`;
    heading.id = 'heading';
    document.querySelector('#main').insertBefore(heading, document.querySelector('#main').firstChild);

    // Creates a paragraph displaying the facts about the weather in that city
    document.querySelector('#information').innerHTML = `The weather in ${response['region']} ${response['tense']} <em><b>${response['weather'].toLowerCase()}</b></em>. The temperature ${response['tense']} ${response['temp']} degrees ${units}. There ${response['tense']} ${response['humidity']}% humidity. The wind speed ${ response['tense']} ${ response['wind']}. It ${response["tense"]} ${response['is_it_windy']} `;

    // Gives the user suggestions for what to wear if it is raining
    if (response['precipitation'] > 10) {
        var rain = document.createElement('span');
        rain.innerHTML = "<b>It might rain a bit: wear a hat or a hoodie!</b>";
        information.appendChild(rain);
    } else if (response["precipitation"] > 40) {
        var rain = document.createElement('span');
        rain.innerHTML = "<b>Large chance of rain! Take a hat or raincoat and an umbrella!</b>";
        information.appendChild(rain);
    }

    // Displays clothing suggestions based on overall weather rating
    let assessment = document.createElement('h5');
    assessment.id = 'assessment';
    if (response['overall_assessment'] <= 5) {
        assessment.innerHTML = `The weather ${response['tense']} cold. Bundle up with a scarf, woolly hat and gloves!`;
    } else if (response['overall_assessment'] > 5 && response['overall_assessment'] <= 11) {
        assessment.innerHTML = `The weather ${response['tense']} quite cool. Even if the sun comes out, make sure to wear a light jacket or coat!`;
    } else if (response['overall_assessment'] > 11 && response['overall_assessment'] <= 16) {
        assessment.innerHTML = `The weather ${response['tense']} pleasant and warm. Wear some light layers that you can easily take off!`;
    } else {
        assessment.innerHTML = `The weather ${response['tense']} very hot. Make sure that you keep well-hydrated! You don't need a jacket!`;
    }

    document.querySelector('#information').append(assessment);
}

// Sends a request to the server to get the weather data for a location
function get_data(city, time, units) {
    let cityObj = {
        city: city,
        time: time,
        units: units
    };
    fetch('http://127.0.0.1:8000/get_data', {
            method: 'POST',
            body: JSON.stringify(cityObj)
        })
        .then(response => response.json())
        .then(response => {
            // Displays error message if location doesn't exist
            if (response["Error"]) {
                let error_message = document.createElement('h5');
                error_message.id = "error";
                error_message.className = "submit-error";
                error_message.innerHTML = `The input: <em>'${city}'</em> is invalid. Please insert a valid location.`;
                document.querySelector('#main').append(error_message);
            } else {
                // Sets new state in history if there is not one for this page already.Attribution: https://stackoverflow.com/questions/30429172/html5-history-api-cannot-go-backwards-more-than-once
                if (!history.state || history.state.city != city) {
                    history.pushState({ city: city }, ``, `/city/${city}/`);
                }

                display_weather_information(response);

                // Removes previous recipes which may be displayed
                if (document.querySelector('#recipe-container')) {
                    document.querySelector('#recipe-container').remove();
                }
                var firstThreeRecipes = get_three(response);

                // Creates a new container for the selected top three recipes
                var recipe_container = document.createElement('div');
                recipe_container.id = "recipe-container";
                document.querySelector('#main').append(recipe_container);

                // Displays top three recipes
                firstThreeRecipes.forEach(function(recipe, index) {
                    create_recipe_card(recipe, index);
                });
            }
        })
}

// Gets the user's input and checks if it is valid. Sets local storage variables for user's choices
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
        submit_error.className = "submit-error";
        submit_error.innerHTML = "You have to submit a valid location."
        document.querySelector('#main').append(submit_error);
    } else {
        window.localStorage.setItem('city', window.city);
        window.time = if_checked();
        window.localStorage.setItem('time', window.time);
        window.units = which_temperature();
        window.localStorage.setItem('units', window.units);
        get_data(window.city, window.time, window.units);
    }
}

// Gets the longitude and latitude of the user's location and calls get_city to get the name of the city they are in
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

// Tutorial from GeeksForGeeks on how to get city name from longitude and latitude using Location IQ API information: https://www.geeksforgeeks.org/how-to-get-city-name-by-using-geolocation/
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

// Creates an array of the first most recent recipes
function get_three(response) {
    // Creates array of top three IDs
    var justIds = [];
    response["recipes"].forEach(recipe => {
            justIds.push(recipe["id"]);
        })
        // Sorts the IDs into descending order
    justIds.sort((a, b) => b - a);
    // Gets the top three IDs from the ID array
    justIds = justIds.slice(0, 3);
    var firstThreeRecipes = [];
    // Creates an array for the first three recipes from the ID list and returns the top three recipes
    justIds.forEach(id => {
        response["recipes"].forEach(recipe => {
            if (id === recipe["id"]) {
                firstThreeRecipes.push(recipe);
            }
        })
    })
    return firstThreeRecipes;
}

// Creates and displays a card with the information about the recipe
function create_recipe_card(recipe, index) {
    var card_wrap = document.createElement('div');
    card_wrap.className = "card-wrap";
    card_wrap.id = `wrap-index${index}`;
    card_wrap.style.order = `${index}`;
    var top_recipe = document.createElement('div');
    top_recipe.id = `recipe-index${index}`;
    top_recipe.className = "card recipe-card flex-fill";
    document.querySelector('#recipe-container').append(card_wrap);
    card_wrap.append(top_recipe);
    var title = document.createElement('h5');
    title.className = "title card-title";
    title.innerHTML = `${recipe['title']}`;
    var recipe_body = document.createElement('div');
    recipe_body.id = `recipe-body${index}`;
    recipe_body.className = "card-body";
    document.querySelector(`#recipe-index${index}`).append(title);
    document.querySelector(`#recipe-index${index}`).append(recipe_body);
    var recipe_url = document.createElement("a");
    recipe_url.id = `recipe-url${index}`;
    recipe_url.className = "recipe-url";
    recipe_url.href = `${recipe['recipe']};`
    var recipe_img = document.createElement('img');
    recipe_img.src = recipe["image"];
    recipe_img.className = "card-img-top";
    var desc = document.createElement("p");
    desc.innerHTML = recipe["description"];
    var types = document.createElement("div");
    types.id = `recipe-types${index}`;
    types.innerHTML = `<h6><b>Cuisine:</b> ${recipe["food_type"]}</h6><h6><b>Specialised diet:</b> ${recipe["diets"]}</h6><h6><b>Meal type:</b> ${recipe["meals"]}</h6>`;
    var footer = document.createElement("div");
    footer.id = `footer${index}`;
    footer.className = 'card-footer';
    var user = document.createElement('h6');
    user.innerHTML = `Posted by: <b>${recipe['username']}</b>`;
    var attribution = document.createElement('a');
    attribution.href = recipe['recipe'];
    attribution.id = `attribution${index}`;
    attribution.className = 'attribution';
    var attribution_text = document.createElement('p');
    attribution_text.innerHTML = recipe['recipe'];
    if (document.querySelector('#weather-form')) {
        document.querySelector('#weather-form').style.display = 'none';
    }
    document.querySelector(`#recipe-index${index}`).append(footer);
    document.querySelector(`#footer${index}`).append(user);
    document.querySelector(`#footer${index}`).append(attribution);
    document.querySelector(`#attribution${index}`).append(attribution_text);
    document.querySelector(`#recipe-body${index}`).append(recipe_url);
    document.querySelector(`#recipe-url${index}`).append(recipe_img);
    document.querySelector(`#recipe-body${index}`).append(desc);
    document.querySelector(`#recipe-body${index}`).append(types);
}