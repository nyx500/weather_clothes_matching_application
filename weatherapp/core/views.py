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
from .forms import *
import urllib.request

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
        global units
        units = data.get("units", "")
        if city != 'no_city':
            print(f'City: {city}')
            print(f"Time: {time}")
            print(f"Units: {units}")
            html_content = get_html_content(city, time)
            weather_data = get_weather_data(html_content, units)
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
    print(f"Refresh time: {time}")
    html_content = get_html_content(city, time)
    weather_data = get_weather_data(html_content, units)
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

@login_required
def submit(request):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            url = data["recipe"]
            image_url = data["image"]
            print(f"URL: {url}")
            # Pretends to be a browser to check access to the URL
            request_headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"}
            recipe_request = urllib.request.Request(url, headers = request_headers)
            image_request = urllib.request.Request(image_url, headers=request_headers)

            # Validating URL
            try:
                recipe_response = urllib.request.urlopen(recipe_request)
                status_recipe = recipe_response.getcode()
            except:
                return render(request, "core/index.html", {
                    'message': 'Error: Invalid URL.'
                })

            # Validating Image URL
            if len(image_url) > 0:
                try:
                    image_response = urllib.request.urlopen(image_request)
                    status_image = urllib.request.urlopen(image_request).getcode()
                    message = str(image_response.info())

                    for line in message.splitlines():
                        print(f"Line: {line}")
                        if 'Content-Type' in line and 'image' in line:
                            print("Image URL is valid")
                            try:
                                new_recipe = Recipe()
                                print(request.user)
                                new_recipe.user = request.user
                                print(data["title"])
                                new_recipe.title = data["title"]
                                print(data["description"])
                                new_recipe.description = data["description"]
                                print(url)
                                new_recipe.recipe = url
                                print(image_url)
                                new_recipe.image = image_url
                                print(data["food_type"])
                                new_recipe.food_type = data["food_type"]
                                print(data["diets"])
                                new_recipe.diets = data["diets"]
                                print(data["meals"])
                                new_recipe.meals = data["meals"]
                                new_recipe.save()
                                for weather in data["weather"]:
                                    new_recipe.weather.add(weather)
                                return render(request, "core/index.html", {
                                    'message': 'Thank you for submitting your recipe!!'
                                })
                            except:
                                print("Did not save the form data")
                                return render(request, "core/index.html", {
                                    'message': 'Error: Could not save form.'
                                })
                except:
                    return render(request, "core/index.html", {
                    'message': 'Error: Invalid image URL.'
                })

            if not valid_url_extension(image_url):
                print("Not a valid url extension")
                return render(request, "core/index.html", {
                    'message': 'Error: Invalid URL for image link.'
                })
        else:
            print("Form/image URL invalid!!!!")
            return HttpResponseRedirect(reverse("submit"))
    else:
        form = RecipeForm()
        return render(request, "core/submit.html", {
            'form': form
        })
