document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('.recipe-card')) {
        window.recipes = document.querySelectorAll('.recipe-card');
    }

    document.querySelector('#apply').onclick = () => {
        window.recipes.forEach(recipe => {
            recipe.style.display = 'none';
        });
        weatherFilter("weather");
        weatherFilter("cuisine");
    }

    document.onkeydown = (e) => {
        if (e.key == 'Enter') {
            window.recipes.forEach(recipe => {
                recipe.style.display = 'none';
            });
            weatherFilter("weather");
            weatherFilter("cuisine");
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

function weatherFilter(filter_type) {
    let choices = [];
    const checkboxes = document.getElementById(`${filter_type}-filter`).getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked === true) {
            choices.push(checkboxes[i].parentElement.textContent.slice(2));
        }
    }
    window.recipes.forEach(recipe => {
        if (filter_type === 'weather') {
            recipe['x'] = false;
            let recipeProperties = recipe.getElementsByTagName('ul')[0].children;
            for (let i = 0; i < recipeProperties.length; i++) {
                for (let j = 0; j < choices.length; j++) {
                    if (recipeProperties[i].innerHTML === choices[j]) {
                        recipe['x'] = true;
                    }
                }
            }
            if (recipe['x'] === false) {
                recipe.style.display = 'none';
            } else {
                recipe.style.display = 'block';
            }
        } else {
            console.log(`Choices: ${choices}`);
            var isChoice = recipe.getElementsByClassName(`${choices[0]}`);
            if (isChoice.length === 1) {
                console.log("X");
            }
        }
    })
}