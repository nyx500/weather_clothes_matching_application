from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
import requests
from bs4 import BeautifulSoup
import json
from .functions import *
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_data(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)
        city = data.get("body", "")
        if city != 'no_city':
            print(f'City: {city}');
            html_content = get_html_content(city)
            weather_data = get_weather_data(html_content)
            print(f'Weather data: {weather_data}')
            if weather_data == 'No such city':
                return JsonResponse({"Error": "This location input is invalid"})
            else:
                return JsonResponse(weather_data)
        else:
            print(f'None city: {city}');
            return render(request, 'core/index.html')

def get_city(request, city):
    html_content = get_html_content(city)
    weather_data = get_weather_data(html_content)
    print(f'REFRESH DATA: {weather_data}')
    if weather_data == 'No such city':
        return JsonResponse({"Error": "This location input is invalid"})
    else:
        return render(request, 'core/index.html', {
            'data': weather_data
        })


def index(request):
    return render(request, 'core/index.html')