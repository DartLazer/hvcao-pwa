from django.urls import path, include
from . import views

urlpatterns = [
    path('api-token-auth/', views.login, name='api_token_auth'),
    path('api/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('test/', views.TestView.as_view(), name='test'),
    path('api/question-data/<int:pk>/', views.QuestionDataCreateAPIView.as_view(), name='question-data-detail'),
    path('api/question-data/', views.QuestionDataCreateAPIView.as_view(), name='create_question'),
    path('api/question-version/', views.GetQuestionVersion.as_view(), name='create_question'),


]
