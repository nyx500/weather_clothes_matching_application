from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username
        }
    def __str__(self):
        return self.username

class Weather(models.Model):
    type = models.CharField(max_length=64)
    def serialize(self):
        return {
            "id": self.id,
            "type": self.type
        }
    def __str__(self):
        return f"{self.type}"

class Recipe(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    recipe = models.URLField()
    image = models.URLField(blank=True, null=True)
    time = models.DateTimeField(auto_now_add=True)

    AFRICAN = 'African'
    AMERICAN = 'American'
    BRITISH = 'British'
    CHINESE = 'Chinese'
    EASTERN_EUROPEAN = 'Eastern European'
    FRENCH = 'French'
    GREEK = 'Greek'
    ITALIAN = 'Italian'
    INDIAN = 'Indian'
    JAPANESE = 'Japanese'
    MEXICAN = 'Mexican'
    MIDDLE_EASTERN = 'Middle Eastern'
    NORDIC = 'Nordic'
    PERSIAN = 'Persian'
    SOUTH_AMERICAN = 'South American'
    THAI = 'Thai'
    VIETNAMESE = 'Vietnamese'

    FOOD_TYPE = [
        (AFRICAN, ('African')),
        (AMERICAN, ('American')),
        (BRITISH, ('British')),
        (CHINESE, ('Chinese')),
        (EASTERN_EUROPEAN, ('Eastern European')),
        (FRENCH, ('French')),
        (GREEK, ('Greek')),
        (ITALIAN, ('Italian')),
        (INDIAN, ('Indian')),
        (JAPANESE, ('Japanese')),
        (MEXICAN, ('Mexican')),
        (MIDDLE_EASTERN, ('Middle Eastern')),
        (NORDIC, ('Nordic')),
        (PERSIAN, ('Persian')),
        (SOUTH_AMERICAN, ('South American')),
        (THAI, ('Thai')),
        (VIETNAMESE, ('Vietnamese')),
    ]

    food_type = models.CharField(max_length=64, choices=FOOD_TYPE)

    weather = models.ManyToManyField(Weather, related_name='recipes')

    NONE = 'None'
    CARNIVORE = 'Carnivore'
    DIABETIC = 'Diabetic'
    GLUTEN_FREE = 'Gluten Free'
    KETO = 'Keto'
    LIGHT = 'Light'
    VEGAN = 'Vegan'
    VEGETARIAN = 'Vegetarian'

    DIETS = [
        (NONE, ('No special diet')),
        (CARNIVORE, ('Carnivore')),
        (DIABETIC, ('Diabetic')),
        (GLUTEN_FREE, ('Gluten Free')),
        (KETO, ('Keto')),
        (LIGHT, ('Light')),
        (VEGAN, ('Vegan')),
        (VEGETARIAN, ('Vegetarian')),
    ]

    diets = models.CharField(max_length=64, choices=DIETS)

    BREAKFAST = 'Breakfast'
    LUNCH = 'Lunch'
    DINNER = 'Dinner'
    DESSERTS = 'Desserts'
    BRUNCH = 'Brunch'
    DRINKS = 'Drinks'
    SNACKS = 'Snacks'

    MEALS = [
        (BREAKFAST, ('Breakfast')),
        (LUNCH, ('Lunch')),
        (DINNER, ('Dinner')),
        (DESSERTS, ('Desserts')),
        (BRUNCH, ('Brunch')),
        (DRINKS, ('Drinks')),
        (SNACKS, ('Snacks')),
    ]

    meals = models.CharField(max_length=64, choices=MEALS)

    def serialize(self):

        types_of_weather = {}

        i = 0

        for w in self.weather.all().values():
            types_of_weather[i] = w
            i += 1

        return {
            "id": self.id,
            "user": self.user.username,
            "title": self.title,
            "description": self.description,
            "recipe": self.recipe,
            "image": self.image,
            "time": self.time.strftime("%d %b %Y, %H:%M"),
            "food_type": self.food_type,
            "diets": self.diets,
            "weather": types_of_weather
        }

    def __str__(self):
        return f"{self.id}: {self.title} posted at {self.time} by {self.user}"

