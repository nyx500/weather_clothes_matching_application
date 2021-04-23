from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_data', views.get_data, name='get_data'),
    path('city/<str:city>/', views.get_city, name='get_city'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]