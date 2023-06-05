from django.urls import path, include
from . import views

urlpatterns = [
    path('api-token-auth/', views.login, name='api_token_auth'),
    path('test/', views.TestView.as_view(), name='test'),
    path('api/question-data/', views.QuestionDataCreateAPIView.as_view(), name='create_question'),
    path('api/question-version/', views.GetQuestionVersion.as_view(), name='create_question'),
    path('api/question-data/<int:pk>/', views.QuestionDataDeleteAPIView.as_view(), name='question-data-detail'),
]
