from django.urls import path
from . import views

urlpatterns = [
    path('auth/send-code/', views.send_code),
    path('auth/verify-code/', views.verify_code),
    path('chats/', views.chats),
    path('chats/<str:chat_id>/', views.chat_detail),
    path('chats/<str:chat_id>/send/', views.chat_send),
    path('chats/<str:chat_id>/feedback/', views.chat_feedback),
    path('chats/<str:chat_id>/ads/', views.chat_ads),
]
