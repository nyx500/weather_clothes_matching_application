from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import requests
from bs4 import BeautifulSoup
import json

# Create your views here.

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

def result(request, city):
    if city != 'no_city':
        print(f'City: {city}');
        html_content = get_html_content(city)
        soup = BeautifulSoup(html_content, 'html.parser')
        weather_data = dict()
        weather_data['region'] = soup.find('div', attrs={'id': 'wob_loc'}).text
        weather_data['time'] = soup.find('div', attrs={'id': 'wob_dts'}).text
        weather_data['weather'] = soup.find('div', attrs={'id': 'wob_dcp'}).text
        weather_data['celsius'] = soup.find('span', attrs={'id': 'wob_tm'}).text
        weather_data['fahr'] = soup.find('span', attrs={'id': 'wob_ttm'}).text
        weather_data['precipitation'] = soup.find('span', attrs={'id': 'wob_pp'}).text
        weather_data['humidity'] = soup.find('span', attrs={'id': 'wob_hm'}).text
        weather_data['metric_wind'] = soup.find('span', attrs={'id': 'wob_ws'}).text
        weather_data['imperial_wind'] = soup.find('span', attrs={'id': 'wob_tws'}).text
        return JsonResponse(weather_data)
    else:
        print(f'None city: {city}');
        return render(request, 'core/index.html')

def index(request):
    return render(request, 'core/index.html')