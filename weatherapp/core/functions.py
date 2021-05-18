import requests
from bs4 import BeautifulSoup
import mimetypes
from .models import *

# To verify that the image URL is an image
VALID_IMAGE_MIMETYPES = [
    "image"
]

# To verify that the image on the image url has a valid extension
VALID_IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
]

# Checks if image URL has a valid extension type
# Attribution: https://timmyomahony.com/blog/upload-and-validate-image-from-url-in-django and http://stackoverflow.com/a/10543969/396300
def valid_url_extension(url, extension_list=VALID_IMAGE_EXTENSIONS):
    return any([url.endswith(e) for e in extension_list])

# Checks if image has a valid format or mimetype
def valid_url_mimetype(url, mimetype_list=VALID_IMAGE_MIMETYPES):
    # The guess_type function returns the type of object (should be an image) and the encoding, then these are stored in two separate variables
    mimetype, encoding = mimetypes.guess_type(url)
    # Checks if the value (the only one is image) in the list of valid formats is the same as the returned mimetype and prints True if this is the case
    if mimetype:
        return any([mimetype.startswith(m) for m in mimetype_list])
    else:
        return False

# Generates a rating for the temperature of a place from the data returned from Google
def encode_weather_based_on_temp(condition, temp):
    if temp <= - 10:
        pass
    elif temp > -10 and temp <= 0:
        condition += 1
    elif temp > 0 and temp <= 5:
        condition += 2
    elif temp > 5 and temp <= 10:
        condition += 3
    elif temp > 10 and temp <= 15:
        condition += 4
    elif temp > 15 and temp <= 20:
        condition += 5
    elif temp > 20 and temp <= 25:
        condition += 6
    elif temp > 25 and temp <= 30:
        condition += 7
    elif temp > 30 and temp <= 35:
        condition += 8
    elif temp > 35 and temp <= 40:
        condition += 9
    else:
        condition += 10
    return(condition)

# Generates a feels-like weather rating taking into account variables as well as the temperature
def change_feels_like_weather(humidity, wind, weather, hot_or_cold, weather_data):
    if wind <= 20:
        weather_data['is_it_windy'] = "calm and still."
        weather += 3
    elif wind > 20 and wind <= 30:
        weather_data['is_it_windy'] = "quite windy."
        weather += 2
    elif wind > 30 and wind < 45:
        weather_data['is_it_windy'] = "very windy."
        weather += 1
    else:
        weather_data['is_it_windy'] = "extremely windy."
    
    if hot_or_cold == 'cold':
        if humidity > 50 and humidity < 70:
           weather += 2
        elif humidity >= 70 and humidity < 90:
            weather += 1
        elif humidity >= 90:
            pass

    if hot_or_cold == 'hot':
        if humidity > 50 and humidity < 70:
            pass
        elif humidity >= 70 and humidity < 90:
            weather += 1
        elif humidity >= 90:
            weather += 2
    return(weather)
    
# Gets HTML content from Google based on a the user's input and a weather query, then stores it as text that has to be parsed in another function
def get_html_content(city, time):
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
    LANGUAGE = "en-gb;q=0.8, en;q=0.7"
    # Makes a session object
    session = requests.Session()
    session.headers['User-Agent'] = USER_AGENT
    session.headers['Accept-Language'] = LANGUAGE
    session.headers['Content-Language'] = LANGUAGE
    # Replaces all the spaces in the string to a '+'
    city = city.replace(' ', '+')
    if time == 'now':
        html_content = session.get(f"https://www.google.co.uk/search?q=weather+in+{city}").text
    elif time == 'later':
        html_content = session.get(f"https://www.google.co.uk/search?q=weather+in+{city}+in+two+hours").text
    else:
        html_content = session.get(f"https://www.google.co.uk/search?q=weather+in+{city}+tomorrow").text
    return html_content

# Finds recipes with a certain kind of weather
def find_recipes(weather_type, recipes, recipe_list):
    for r in recipes:
        for w in r.weather.all().values_list():
            if r not in recipe_list:
                if weather_type in w[1]:
                    recipe_list.append(r)
    return recipe_list

# Makes a BeautifulSoup object out of the Google html text and creates a dictionary with all the weather data for that place stored in it
def get_weather_data(html_content, units):
    recipes = Recipe.objects.all().order_by('-time')
    recipe_list = []
    soup = BeautifulSoup(html_content, 'html.parser')
    weather_data = dict()
    if soup.find('div', attrs={'id': 'wob_loc'}) == None:
        return "No such city"
    else:
        weather_data['region'] = soup.find('div', attrs={'id': 'wob_loc'}).text
        weather_data['time'] = soup.find('div', attrs={'id': 'wob_dts'}).text
        weather_data['weather'] = soup.find('div', attrs={'id': 'wob_dcp'}).text.lower()
        weather_data['temp'] = int(soup.find('span', attrs={'id': 'wob_tm'}).text)
        weather_data['precipitation'] = int(soup.find('span', attrs={'id': 'wob_pp'}).text.replace('%', ''))
        weather_data['humidity'] = int(soup.find('span', attrs={'id': 'wob_hm'}).text.replace('%', ''))
        weather_data['wind'] = int(soup.find('span', attrs={'id': 'wob_ws'}).text.replace(' km/h', ''))

        weather_value = 0 

        if weather_data['wind'] > 20:
            weather_type = 'Windy'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)

        if weather_data['humidity'] > 70:
            weather_type = 'Humid'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)
        else:
            if weather_data['precipitation'] < 15:
                weather_type = 'Dry'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)
            else:
                weather_type = 'Wet'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)

        if 'sunny' in weather_data['weather'] or 'clear' in weather_data['weather']:
            weather_value = 5
            weather_type = 'Sunny'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)

        weather4 = ['overcast', 'cloud', 'haze']
        for condition in weather4:
            if condition in weather_data['weather']:
                weather_value = 4
                weather_type = 'Cloudy'
                print(f"Cloudy: {recipe_list})")
                recipe_list = find_recipes(weather_type, recipes, recipe_list)
                weather_type = 'Grey'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)
                print(f"Grey: {recipe_list})")

        if 'rain' in weather_data['weather'] or 'shower' in weather_data['weather']:
            weather_value = 3
            weather_type = 'Wet'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)

        if 'storm' in weather_data['weather']:
            weather_value = 2
            weather_type = 'Stormy'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)
        
        weather1 = ['snow', 'freezing', 'mist', 'sleet', 'icy', 'fog', 'flurries', 'hail']
        for condition in weather1:
            if condition in weather_data['weather']:
                weather_value = 1
                weather_type = 'Snowing'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)
                weather_type = 'Frosty'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)

        # An error is returned if the weather type is unknown
        if weather_value == 0:
            weather = 'Error'
            print(weather)
        else:
            weather_value = encode_weather_based_on_temp(weather_value, weather_data['temp'])
            # Gets a different assessment of the general weather by changing whether an increase in humidity makes the weather feel warmer or colder by looking at if the basic temperature is warm or cold
            if weather_value <= 10: 
                weather = change_feels_like_weather(weather_data['humidity'], weather_data['wind'], weather_value, 'cold', weather_data)
            else:
                weather = change_feels_like_weather(weather_data['humidity'], weather_data['wind'], weather_value, 'hot', weather_data)

        visibility = 1
        obscured_visibility = ['mist', 'fog', 'dust', 'smoke']
        for condition in obscured_visibility:
            if condition in weather_data['weather']:
                visibility = 0
                weather_type = 'Foggy'
                recipe_list = find_recipes(weather_type, recipes, recipe_list)

        weather_data['visibility'] = visibility

        weather_data['overall_assessment'] = weather

        if weather_data['overall_assessment'] <= 13:
            weather_type = 'Cold'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)
        elif weather_data['overall_assessment'] > 13 and weather_data['overall_assessment'] <= 16:
            weather_type = 'Warm'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)
        else:
            weather_type = 'Scorching'
            recipe_list = find_recipes(weather_type, recipes, recipe_list)

        if units == "fahrenheit":
            weather_data['units'] = 'fahrenheit'
            weather_data['temp'] = int(soup.find('span', attrs={'id': 'wob_ttm'}).text)
            weather_data['wind'] = str(soup.find('span', attrs={'id': 'wob_tws'}).text)
        else:
            weather_data['units'] = 'celsius'
            weather_data['wind'] = str(soup.find('span', attrs={'id': 'wob_ws'}).text)

        # Returns a list of recipes as JSON serializable dictionaries
        ids = []
        for r in recipe_list:
            ids.append(r.id)
        recipes_as_dictionaries = []
        for i in ids:
            for r in recipes.values():
                if i == r['id']:
                    recipes_as_dictionaries.append(r)
        for d in recipes_as_dictionaries:
            d['username'] = User.objects.get(id=d['user_id']).username
        
        
        # Append a dictionary of recipes that means the weather data will be easily returned as a JSON object
        weather_data["recipes"] = recipes_as_dictionaries

        return weather_data
