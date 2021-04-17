from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('city/<str:city>', views.result, name='result'),
]