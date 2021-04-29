from django.forms import ModelForm
from .models import *
from django import forms

class RecipeForm(ModelForm):
    class Meta:
        model = Recipe
        fields = ['title', 'description', 'recipe', 'image', 'weather', 'food_type', 'diets', 'meals']
        widgets = {
            'title': forms.TextInput(attrs={'size': 90}),
            'description': forms.Textarea(attrs={'cols': 92, 'rows': 12, 'style':'width:100%; border:2px solid black;', 'placeholder': 'Max. 500 chars'}),
            'recipe': forms.TextInput(attrs={'size': 90}),
            'image': forms.TextInput(attrs={'size': 90}),
            'weather': forms.CheckboxSelectMultiple(),
            'food_type': forms.Select(attrs={'style': 'width:200px'}),
            'diets': forms.Select(attrs={'style': 'width:200px'}),
            'meals': forms.Select(attrs={'style': 'width:200px'}),
        }