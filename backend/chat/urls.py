from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login),
    path('chats/', views.chats),
    path('chats/<str:chat_id>/', views.chat_detail),
    path('chats/<str:chat_id>/send/', views.chat_send),
    path('chats/<str:chat_id>/feedback/', views.chat_feedback),
]
