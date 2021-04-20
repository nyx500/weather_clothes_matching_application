from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
import requests
from bs4 import BeautifulSoup
import json
from .functions import *
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def result(request, city):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)
        city = data.get("body", "")
        if city != 'no_city':
            print(f'City: {city}');
            html_content = get_html_content(city)
            print(html_content)
            return render(request, 'core/index.html')
        else:
            print(f'None city: {city}');
            return render(request, 'core/index.html')

# This route allows the user to press the refresh button when the url only includes the city name
def refresh_button(request, city):
    return redirect('result', city=city)

def index(request):
    return render(request, 'core/index.html')