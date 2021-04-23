from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
import requests
from bs4 import BeautifulSoup
import json
from django.views.decorators.csrf import csrf_exempt
from .functions import *
from .models import *

def index(request):
    return render(request, 'core/index.html')

def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "core/login.html", {
                "message": "Invalid email and/or password."
                })
    else:
        return render(request, "core/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        email = request.POST["email"]
        username = request.POST["user"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "core/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "core/register.html", {
                "message": "Email address and/or username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "core/register.html")

@csrf_exempt
def get_data(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)
        print(data)
        city = data.get("city", "")
        global time
        time = data.get("time", "")
        if city != 'no_city':
            print(f'City: {city}');
            print(f"Time: {time}")
            html_content = get_html_content(city, time)
            weather_data = get_weather_data(html_content)
            print(f'Weather data: {weather_data}')
            if weather_data == 'No such city':
                return JsonResponse({"Error": "This location input is invalid"})
            else:
                weather_data["time"] = time
                if time == 'now':
                    weather_data["tense"] = 'is'
                else:
                    weather_data["tense"] = 'will be'
                return JsonResponse(weather_data)
        else:
            print(f'None city: {city}');
            return render(request, 'core/index.html')

def get_city(request, city):
    html_content = get_html_content(city, time)
    weather_data = get_weather_data(html_content)
    weather_data["time"] = time
    if time == 'now':
        weather_data["tense"] = 'is'
    else:
        weather_data["tense"] = 'will be'
    print(f'REFRESH DATA: {weather_data}')
    if weather_data == 'No such city':
        return JsonResponse({"Error": "This location input is invalid"})
    else:
        return render(request, 'core/index.html', {
            'data': weather_data
        })
