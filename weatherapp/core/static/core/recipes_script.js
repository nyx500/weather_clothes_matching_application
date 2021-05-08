document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#apply').onclick = weatherFilter;

    document.onkeydown = (e) => {
        if (e.key == 'Enter') {
            weatherFilter();
        }
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

function weatherFilter() {
    let weatherChoices = [];
    const weatherCheckboxes = document.getElementById('weather-filter').getElementsByTagName('input');
    for (let i = 0; i < weatherCheckboxes.length; i++) {
        if (weatherCheckboxes[i].checked === true) {
            weatherChoices.push(weatherCheckboxes[i].parentElement.textContent.slice(2));
        }
    }
    if (document.querySelector('.recipe-card')) {
        const recipes = document.querySelectorAll('.recipe-card');
        recipes.forEach(recipe => {
            recipe.style.display = 'none';
        })
        recipes.forEach(recipe => {
            let recipeWeatherTypes = recipe.getElementsByTagName('ul')[0].children;
            var displayRecipe = false;
            for (let i = 0; i < recipeWeatherTypes.length; i++) {
                for (let j = 0; j < weatherChoices.length; j++) {
                    if (recipeWeatherTypes[i].innerHTML === weatherChoices[j]) {
                        displayRecipe = true;
                    }
                }
            }
            if (displayRecipe === false) {
                recipe.style.display = 'none';
            } else {
                recipe.style.display = 'block';
            }
        })
    }
}