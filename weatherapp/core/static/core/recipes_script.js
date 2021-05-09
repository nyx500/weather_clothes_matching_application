document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('.recipe-card')) {
        window.recipes = document.querySelectorAll('.recipe-card');
    }
    const filters = ["cuisine", "meal", "diet"];

    document.querySelector('#choose-weather').onclick = () => {
        window.recipes.forEach(recipe => {
            recipe['weather'] = false;
        });
        let selectedChoices = findIfFilters("weather");
        if (selectedChoices.length === 0) {
            document.querySelector('#no-filter-chosen').style.display = 'block';
        } else {
            filter("weather", selectedChoices);
            document.querySelector('#recipes-title').style.display = 'block';
            document.querySelector('#flex-container').style.display = 'flex';
            document.querySelector('#select-filters').style.display = 'block';
            document.querySelector('#weather-filter-container').style.display = 'none';
            window.recipes.forEach(recipe => {
                if (recipe['weather']) {
                    recipe.style.display = 'block';
                } else {
                    recipe.style.display = 'none';
                }
            });
        }
    }

    document.querySelector('#choose-weather-all').onclick = () => {
        window.recipes.forEach(recipe => {
            recipe['weather'] = true;
        });
        document.querySelector('#recipes-title').style.display = 'block';
        document.querySelector('#flex-container').style.display = 'flex';
        document.querySelector('#select-filters').style.display = 'block';
        document.querySelector('#weather-filter-container').style.display = 'none';
        window.recipes.forEach(recipe => {
            if (recipe['weather']) {
                recipe.style.display = 'block';
            } else {
                recipe.style.display = 'none';
            }
        });
    }

    document.querySelector('#apply').onclick = () => {
        document.querySelector('#no-matches').style.display = 'none';
        window.recipes.forEach(recipe => {
            for (let i = 0; i < filters.length; i++) {
                recipe[`${filters[i]}`] = false;
            }
        });
        for (let i = 0; i < filters.length; i++) {
            let selectedChoices = findIfFilters(filters[i]);
            filter(filters[i], selectedChoices);
        }
        var noRecipes = true;
        window.recipes.forEach(recipe => {
            if (recipe['weather'] && recipe['cuisine'] && recipe['meal'] && recipe['diet']) {
                recipe.style.display = 'block';
                noRecipes = false;
            } else {
                recipe.style.display = 'none';
            }
        });
        if (noRecipes === true) {
            document.querySelector('#no-matches').style.display = 'block';
        }
    }

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