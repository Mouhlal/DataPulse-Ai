from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, DatasetListCreateView, DatasetDetailView, run_kmeans_api, run_regression_api, auto_clean_api, run_classification_api, download_dataset_api

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    path('datasets/', DatasetListCreateView.as_view(), name='dataset-list'),
    path('datasets/<int:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<int:pk>/download/', download_dataset_api, name='dataset-download'),
    path('datasets/clean/', auto_clean_api, name='datasets-clean'),
    
    path('models/kmeans/', run_kmeans_api, name='models-kmeans'),
    path('models/regression/', run_regression_api, name='models-regression'),
    path('models/classification/', run_classification_api, name='models-classification'),
]
