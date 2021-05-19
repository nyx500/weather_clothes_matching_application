document.addEventListener('DOMContentLoaded', function() {

    // Gets all the recipes for filtering and sorting and stores them in a global variable accessible to all the filter functions
    if (document.querySelector('.recipe-card')) {
        window.recipes = document.querySelectorAll('.recipe-card');
    }

    // An array of all the types of filters once the recipes according to filter have loaded
    const filters = ["cuisine", "meal", "diet"];

    // Loads the correct recipes (or no recipes) depending on the state of the history API and updates the state if the current entry is null
    if (history.state === null) {
        history.replaceState({ recipes: 'unloaded' }, ``, '/recipes');
    } else if (history.state.recipes === 'loaded') {
        if (history.state.weather_types === 'all') {
            display_all(window.recipes);
        } else {
            filter("weather", history.state.weather_types);
            display_selected_recipes();
        }
    }

    // If user selects some weather filters, choose the appropriate recipes in those categories and display them
    document.querySelector('#choose-weather').onclick = () => {
        if (document.querySelector('.message')) {
            document.querySelector('.message').remove();
        }
        window.recipes.forEach(recipe => {
            recipe['weather'] = false;
        });
        let selectedChoices = findIfFilters("weather");
        if (selectedChoices.length === 0) {
            document.querySelector('#no-filter-chosen').style.display = 'block';
        } else {
            filter("weather", selectedChoices);
            display_selected_recipes();
            history.pushState({ recipes: 'loaded', weather_types: selectedChoices }, ``, '/recipes');
        }
    }

    // Displays all of the recipes if the user cllicks on the 'View All' button
    document.querySelector('#choose-weather-all').onclick = () => {
        if (document.querySelector('.message')) {
            document.querySelector('.message').remove();
        }
        display_all(window.recipes);
        history.pushState({ recipes: 'loaded', weather_types: 'all' }, ``, '/recipes');
    }

    document.querySelector('#apply').onclick = () => {
        // Hides message saying that no filters have been selected if it was showing
        document.querySelector('#no-matches').style.display = 'none';
        // Initially sets the value for each filter property of all of the recipe objects to false, before going through each filter and seeing if it applies to the current recipe
        window.recipes.forEach(recipe => {
            for (let i = 0; i < filters.length; i++) {
                recipe[`${filters[i]}`] = false;
            }
        });
        for (let i = 0; i < filters.length; i++) {
            // Stores the filters that the user has selected out of each filter category in an array called 'selectedChoices'
            let selectedChoices = findIfFilters(filters[i]);
            // The filter function goes through all the recipes and sets its property for that filter category (e.g. cuisine) to true if the recipe falls into that category
            filter(filters[i], selectedChoices);
        }

        var counter = 0;
        // Displays the recipe if all the filters selected by the user match its properties
        window.recipes.forEach(recipe => {
            if (recipe['weather'] && recipe['cuisine'] && recipe['meal'] && recipe['diet']) {
                recipe.style.display = 'block';
                // Adds each displayed recipe to the counter
                counter += 1;
            } else {
                recipe.style.display = 'none';
            }
        });

        display_settings(counter);
    }

    // Shows and hides filters if user clicks on the select-filters button
    document.querySelector('#select-filters').onclick = () => {
        if (document.querySelector('#select-filters').innerHTML === 'Select Filters') {
            document.querySelector('.filter').style.display = 'flex';
            document.querySelector('#select-filters').innerHTML = 'Hide Filters';
        } else {
            document.querySelector('.filter').style.display = 'none';
            document.querySelector('#select-filters').innerHTML = 'Select Filters';
        }
    }
})

// Returns the specific filter categories which were selected by the user on the checkboxes
function findIfFilters(filter_type) {
    let choices = [];
    const checkboxes = document.getElementById(`${filter_type}-filter`).getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            choices.push(checkboxes[i].parentElement.textContent.slice(2));
        }
    }
    return choices;
}

// Hides the weather filter container and displays all of the recipes in a grid format
function display_selected_recipes() {
    document.querySelector('#weather-filter-container').style.display = 'none';
    document.querySelector('#select-filters').style.display = 'block';
    document.querySelector('#recipes-title').style.display = 'block';
    document.querySelector('#grid-container').style.display = 'grid';
    window.recipes.forEach(recipe => {
        if (recipe['weather']) {
            recipe.style.display = 'block';
        } else {
            recipe.style.display = 'none';
        }
    });
}

// Displays all recipes for all kinds of weather if the user presses the 'View All' button
function display_all(recipes) {
    recipes.forEach(recipe => {
        recipe['weather'] = true;
    });
    display_selected_recipes();
}

// Selects the correct recipes for that kind of weather
function select_by_weather(recipes) {
    recipes.forEach(recipe => {
        recipe['weather'] = false;
    });
    let selectedChoices = findIfFilters("weather");
    if (selectedChoices.length === 0) {
        document.querySelector('#no-filter-chosen').style.display = 'block';
    } else {
        filter("weather", selectedChoices);
        display_selected_recipes();
        history.pushState({ recipes: 'loaded', weather_types: selectedChoices }, ``, '/recipes');
    }
}

// Updates all the filter properties of all the recipe objects in window.recipes depending on the filters chosen by the user, so that the recipes can be selected based on these and either hidden or displayed
function filter(filter_type, choices) {
    window.recipes.forEach(recipe => {
        if (choices.length === 0) {
            recipe[`${filter_type}`] = true;
        }
        if (filter_type === 'weather') {
            let recipeProperties = recipe.getElementsByTagName('ul')[0].children;
            for (let i = 0; i < recipeProperties.length; i++) {
                if (choices.length === 0) {
                    recipe[`${filter_type}`] = true;
                } else {
                    for (let j = 0; j < choices.length; j++) {
                        if (recipeProperties[i].innerHTML === choices[j]) {
                            recipe[`${filter_type}`] = true;
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < choices.length; i++) {
                var typeTag = recipe.getElementsByClassName(`${choices[i]}`);
                if (typeTag.length === 1) {
                    recipe[`${filter_type}`] = true;
                }
                if (filter_type === 'diet') {
                    if (choices[i] === 'Everything') {
                        recipe[`${filter_type}`] = true;
                    }
                }
            }
        }
    })
}

// Changes display of recipes results depending on how many recipes are to be shown
function display_settings(counter) {
    // Displays a message saying there are no matches if there are no selected recipes for those chosen filters
    if (counter === 0) {
        document.querySelector('#no-matches').style.display = 'block';
    }
    // If there is only one recipe to be displayed, sets the width to being wider than normal, so it looks good on the screen
    if (counter === 1) {
        window.recipes.forEach(recipe => {
            if (recipe.style.display !== 'none') {
                recipe.style.width = '60vw';
            } else {
                recipe.style.width = 'auto';
            }
        })
    }
}