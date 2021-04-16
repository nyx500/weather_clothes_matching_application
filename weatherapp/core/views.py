from django.http import HttpResponse
from django.shortcuts import render
import requests
from bs4 import BeautifulSoup

# Create your views here.

def get_html_content(city):
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
    LANGUAGE = "en-gb;q=0.8, en;q=0.7"
    # Makes a session object
    session = requests.Session()
    session.headers['User-Agent'] = USER_AGENT
    session.headers['Accept-Language'] = LANGUAGE
    session.headers['Content-Language'] = LANGUAGE
    # Replaces all the spaces in the string to a '+'
    city = city.replace(' ', '+')
    html_content = session.get(f"https://www.google.co.uk/search?q=weather+in+{city}").text
    return html_content

def index(request):
    if request.method == "POST":
        if "city" in request.POST:
            city = request.POST.get("city")
            html_content = get_html_content(city)
            soup = BeautifulSoup(html_content, 'html.parser')
            region = soup.find('div', attrs={'id': 'wob_loc'}).text
            time = soup.find('div', attrs={'id': 'wob_dts'}).text
            weather = soup.find('div', attrs={'id': 'wob_dcp'}).text
            print(region)
            print(time)
            pass
        return render(request, 'core/index.html')
    else:
        return render(request, 'core/index.html')