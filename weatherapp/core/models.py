from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Weather(models.Model):
    type = models.CharField(max_length=64)
    def __str__(self):
        return self.type

class Recipe(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    recipe = models.URLField()
    image = models.URLField(blank=True, null=True)
    time = models.DateTimeField(auto_now_add=True)

    AFRICAN = 'african'
    AMERICAN = 'american'
    BRITISH = 'british'
    CHINESE = 'chinese'
    EASTERN_EUROPEAN = 'eastern_european'
    FRENCH = 'french'
    GREEK = 'greek'
    ITALIAN = 'italian'
    INDIAN = 'indian'
    JAPANESE = 'japanese'
    MEXICAN = 'mexican'
    MIDDLE_EASTERN = 'middle_eastern'
    NORDIC = 'nordic'
    PERSIAN = 'persian'
    SOUTH_AMERICAN = 'south_american'
    THAI = 'thai'
    VIETNAMESE = 'vietnamese'

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

    NONE = 'none'
    CARNIVORE = 'carnivore'
    DIABETIC = 'diabetic'
    GLUTEN_FREE = 'gluten_free'
    KETO = 'keto'
    LIGHT = 'light'
    VEGAN = 'vegan'
    VEGETARIAN = 'vegetarian'

    DIETS = [
        (NONE, ('N/A')),
        (CARNIVORE, ('Carnivore')),
        (DIABETIC, ('Diabetic')),
        (GLUTEN_FREE, ('Gluten-Free')),
        (KETO, ('Keto')),
        (LIGHT, ('Light')),
        (VEGAN, ('Vegan')),
        (VEGETARIAN, ('Vegetarian')),
    ]

    diets = models.CharField(max_length=64, choices=DIETS)

    BREAKFAST = 'breakfast'
    LUNCH = 'lunch'
    DINNER = 'dinner'
    DESSERTS = 'desserts'
    BRUNCH = 'brunch'
    DRINKS = 'drinks'
    SNACKS = 'snacks'

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

    def __str__(self):
        return f"Recipe {self.id}: {self.title} by {self.user} at {self.time})"


