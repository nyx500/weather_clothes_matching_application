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
    let choices = [];
    const checkboxes = document.getElementById('weather-filter').getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            choices.push(checkboxes[i].parentElement.textContent.slice(2));
        }
    }
    if (document.querySelector('.recipe-card')) {
        const recipes = document.querySelectorAll('.recipe-card');
        recipes.forEach(recipe => {
            recipe.style.display = 'none';
        })
        recipes.forEach(recipe => {
            let weathers = recipe.getElementsByTagName('ul')[0].children;
            var displayRecipe = false;
            for (let i = 0; i < weathers.length; i++) {
                for (let j = 0; j < choices.length; j++) {
                    if (weathers[i].innerHTML === choices[j]) {
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