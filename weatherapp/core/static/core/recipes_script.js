document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('.recipe-card')) {
        window.recipes = document.querySelectorAll('.recipe-card');
    }

    const filters = ["cuisine", "meal", "diet"];

    document.querySelector('#choose-weather').onclick = () => {
        window.recipes.forEach(recipe => {
            recipe['weather_select'] = false;
        });
        let selectedChoices = findIfFilters("weather");
        if (selectedChoices.length > 0) {
            filter("weather", selectedChoices);
        }
        document.querySelector('#flex-container').style.display = 'flex';
        document.querySelector('#select-filters').style.display = 'block';
        document.querySelector('#weather-filter-container').style.display = 'none';
        window.recipes.forEach(recipe => {
            if (recipe['weather_select']) {
                console.log(true);
                recipe.style.display = 'block';
            } else {
                console.log(false);
                recipe.style.display = 'none';
            }
        });
    }

    document.querySelector('#apply').onclick = () => {
        window.recipes.forEach(recipe => {
            recipe['filter_select'] = true;
        });
        for (let i = 0; i < filters.length; i++) {
            let selectedChoices = findIfFilters(filters[i]);
            if (selectedChoices.length > 0) {
                filter(filter[i], selectedChoices);
            }
        }
        window.recipes.forEach(recipe => {
            if (recipe['weather_select'] && recipe['filter_select']) {
                recipe.style.display = 'block';
            } else {
                recipe.style.display = 'none';
            }
        });
    }

    document.querySelector('#select-filters').onclick = () => {
        if (document.querySelector('#select-filters').innerHTML === 'Select Filters') {
            document.querySelector('.field').style.display = 'flex';
            document.querySelector('#select-filters').innerHTML = 'Hide Filters';
        } else {
            document.querySelector('.field').style.display = 'none';
            document.querySelector('#select-filters').innerHTML = 'Select Filters';
        }
    }
})

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

function filter(filter_type, choices) {
    window.recipes.forEach(recipe => {
        if (filter_type === 'weather') {
            let recipeProperties = recipe.getElementsByTagName('ul')[0].children;
            for (let i = 0; i < recipeProperties.length; i++) {
                for (let j = 0; j < choices.length; j++) {
                    if (recipeProperties[i].innerHTML === choices[j]) {
                        recipe['weather_select'] = true;
                    }
                }
            }
        } else {
            for (let i = 0; i < choices.length; i++) {
                var typeTag = recipe.getElementsByClassName(`${choices[i]}`);
                if (typeTag.length === 0) {
                    recipe['filter_select'] = false;
                }
            }
        }
    })
}