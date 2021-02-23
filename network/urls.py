from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("submit_post", views.submit_post, name="submit_post"),
    path("posts", views.get_posts, name="get_post"),
    path("user/<str:username>", views.get_user_profile, name="profile"),
]
