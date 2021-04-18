from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import requests
from bs4 import BeautifulSoup
import json
from .functions import *

def result(request, city):
    if city != 'no_city':
        print(f'City: {city}');
        html_content = get_html_content(city)
        weather_data = get_weather_data(html_content)
        return JsonResponse(weather_data)
    else:
        print(f'None city: {city}');
        return render(request, 'core/index.html')

# This route allows the user to press the refresh button when the url only includes the city name
def refresh_button(request, city):
    if city != 'no_city':
        print(f'City: {city}');
        html_content = get_html_content(city)
        weather_data = get_weather_data(html_content)
        return JsonResponse(weather_data)
    else:
        print(f'None city: {city}');
        return render(request, 'core/index.html')

def index(request):
    return render(request, 'core/index.html')