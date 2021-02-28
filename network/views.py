from django.core.serializers import serialize
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json

from .models import User, Post

def index(request):
    return render(request, "network/index.html")


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def get_user_profile(request, username):
    user = User.objects.get(username=username)
    response = {
        'username' : user.username,
        'post-count' : user.posts.count(),
        'following' : user.relationships_from.count(),
        'followed-by' : user.relationships_to.count(),
    }

    return HttpResponse(json.dumps(response), content_type='application/json')

def get_posts(request):
    start = int(request.GET.get("start"))
    end = int(request.GET.get("end"))
    user = request.GET.get("user") or None
    feed = request.GET.get("feed") or None

    if feed:
        follow_relationships = request.user.relationships_from.filter(status=1)
        following = User.objects.filter(id__in=follow_relationships.values('to_user'))
        posts = Post.objects.filter(author__in=following)

    elif user:
        user_obj = User.objects.get(username=user)
        posts = Post.objects.filter(author=user_obj)[start:end]

    else:
        posts = Post.objects.all()[start:end]

    serializer = serialize("json", posts, use_natural_foreign_keys=True)
    return HttpResponse(serializer, content_type='application/json')

def submit_post(request):
    if request.method != "POST":
        return render(request, "index.html")  

    # Add new post to DB
    data = json.loads(request.body)
    post = Post(author=request.user, message=data['message'])
    post.save()

    # Respond with the new post in JSON
    response = serialize("json", [post], ensure_ascii=False, use_natural_foreign_keys=True)
    return HttpResponse(response[1:-1], content_type='application/json')