from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
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

        # Checks if email address in use
        email_addresses = []
        for user in User.objects.all():
            email_addresses.append(user.email)
        
        if email in email_addresses:
            return render(request, "core/register.html", {
                "message": "Email-address already taken."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "core/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "core/register.html")

# Processes the user's input for the location they want to look up the weather for
@csrf_exempt
def get_data(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        # Gets data from user's form
        data = json.loads(request.body)
        city = data.get("city", "")
        time = data.get("time", "")
        units = data.get("units", "")
        if city != 'no_city':
            html_content = get_html_content(city, time)
            weather_data = get_weather_data(html_content, units)
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
            return render(request, 'core/index.html')

# If tge user refreshes page on the city JS state, then this allows Python to send a hidden message to index page which is waited for on the script as a signal to fetchthe weather data from get_data and the API again
def get_city(request, city):
    return render(request, 'core/index.html', {
        'get_data': "yes"
    })

def recipes(request):
    return render(request, "core/recipes.html", {
        'recipes': Recipe.objects.all().order_by('-time'), 'form': FilterForm()
    })

# Processes user submitting a form and stores it as object in the Recipe class
@login_required
def submit(request):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            url = data["recipe"]
            if data["image"]:
                image_url = data["image"]
            # Stores the image_url as a no-image icon if the user has not linked to an image as default
            else:
                image_url = "https://img.icons8.com/color/96/000000/no-image.png"
            # Pretends to be a browser agent on Mozilla to check access to the URL via the link for the recipe and image input, to see that the URL the user has entered is not a 404/3 error
            request_headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"}
            recipe_request = urllib.request.Request(url, headers = request_headers)
            image_request = urllib.request.Request(image_url, headers=request_headers)

            # Validates the recipe URL
            try:
                recipe_response = urllib.request.urlopen(recipe_request)
                status_recipe = recipe_response.getcode()
            except:
                return render(request, "core/submit.html", {
                    'message': 'ERROR: The recipe you have entered for the URL does not work.'
                })

            # Validates Image URL
            # Checks if image url has been inputted by the user
            try:
                image_response = urllib.request.urlopen(image_request)
                status_image = urllib.request.urlopen(image_request).getcode()
                message = str(image_response.info())
                # Parses the information that comes on the image link to see if the file is really an image
                for line in message.splitlines():
                    if 'Content-Type' in line and 'image' in line:
                        try:
                            new_recipe = Recipe()
                            new_recipe.user = request.user
                            title = data["title"].title()
                            new_recipe.title = title
                            new_recipe.description = data["description"]
                            new_recipe.recipe = url
                            new_recipe.image = image_url
                            new_recipe.food_type = data["food_type"]
                            new_recipe.diets = data["diets"]
                            new_recipe.meals = data["meals"]
                            new_recipe.save()
                            for weather in data["weather"]:
                                new_recipe.weather.add(weather)
                            return render(request, "core/recipes.html", {
                                'message': 'Thank you for your submission.', 'recipes': Recipe.objects.all().order_by('-time'), 'form': FilterForm()
                            })
                        except:
                            return render(request, "core/submit.html", {
                                'message': 'ERROR: Some data you have entered is invalid.', 'form': RecipeForm()
                            })
            except:
                return render(request, "core/submit.html", {
                'message': 'Error: Invalid image URL.', 'form': RecipeForm()
            })

            if not valid_url_extension(image_url):
                return render(request, "core/submit.html", {
                    'message': 'The format of this image is unsupported by this website.', 'form': RecipeForm()
                })
        else:
            return render(request, "core/submit.html", {
                    'message': f'One or more of the fields you have entered is invalid. ERROR: {form.errors}', 'form': RecipeForm()
                })
    else:
        form = RecipeForm()
        return render(request, "core/submit.html", {
            'form': form
        })
