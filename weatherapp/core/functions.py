import requests
from bs4 import BeautifulSoup

def encode_weather_based_on_temp(condition, temp):
    # Coldest possible weather condition would be snow (1) + less than -10 degrees C .: 1
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
        # Hottest possible weather condition would be clear (5) + more than 40 degrees C .: 15
        condition += 10
    return(condition)


# Returns a rating of the weather on a scale between 1 and 20
def change_feels_like_weather(humidity, wind, weather, hot_or_cold):
    
    if hot_or_cold == 'cold':
        if humidity > 50 and humidity < 70:
           weather += 2
        elif humidity >= 70 and humidity < 90:
            weather += 1
        # Lowest weather would be 1
        elif humidity >= 90:
            pass

    if hot_or_cold == 'hot':
        if humidity > 50 and humidity < 70:
            pass
        elif humidity >= 70 and humidity < 90:
            weather += 1
        # Highest weather would be 17
        elif humidity >= 90:
            weather += 2

    # Highest weather would be 20
    if wind > 20 and wind <= 30:
        weather += 3
    elif wind > 30 and wind <= 40:
        weather += 2
    elif wind > 40 and wind <= 60:
        weather += 1
    # Lowest weather would be 1
    elif wind > 60:
        pass

    return(weather)
    

def get_html_content(city):
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
    LANGUAGE = "en-gb;q=0.8, en;q=0.7"
    # Makes a session object
    session = requests.Session()
    session.headers['User-Agent'] = USER_AGENT
    session.headers['Accept-Language'] = LANGUAGE
    session.headers['Content-Language'] = LANGUAGE
    # Replaces all the spaces in the string to a '+'
    city = city.replace(' ', '+')
    html_content = session.get(f"https://www.google.co.uk/search?q=weather+in+{city}").text
    return html_content


def get_weather_data(html_content):
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

        if 'sunny' in weather_data['weather'] or 'clear' in weather_data['weather']:
            weather_value = 5

        weather4 = ['overcast', 'cloud', 'haze']
        for condition in weather4:
            if condition in weather_data['weather']:
                weather_value = 4

        if 'rain' in weather_data['weather'] or 'shower' in weather_data['weather']:
            weather_value = 3

        if 'storm' in weather_data['weather']:
            weather_value = 2
        
        weather1 = ['snow', 'freezing', 'mist', 'sleet', 'icy', 'fog', 'flurries', 'hail']
        for condition in weather1:
            if condition in weather_data['weather']:
                weather_value = 1

        if weather_value == 0:

            weather = 'Error'
        else:

            weather_value = encode_weather_based_on_temp(weather_value, weather_data['temp'])

            if weather_value <= 10: 
                weather = change_feels_like_weather(weather_data['humidity'], weather_data['humidity'], weather_value, 'cold')
            else:
                weather = change_feels_like_weather(weather_data['humidity'], weather_data['humidity'], weather_value, 'hot')

        visibility = 1
        obscured_visibility = ['mist', 'fog', 'dust', 'smoke']
        for condition in obscured_visibility:
            if condition in weather_data['weather']:
                visibility = 0

        weather_data['visibility'] = visibility

        weather_data['overall_assessment'] = weather

        return(weather_data)
