from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer, DatasetSerializer
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import FileResponse
import mimetypes
from rest_framework.decorators import api_view, permission_classes
from .ml_models import generate_summary, run_kmeans_clustering, run_linear_regression, auto_clean_dataset, run_logistic_regression
from .models import Dataset

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class DatasetListCreateView(generics.ListCreateAPIView):
    serializer_class = DatasetSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        if user:
            return Dataset.objects.filter(user=user).order_by('-uploaded_at')
        return Dataset.objects.none()

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        file_name = file_obj.name if file_obj else 'unknown.csv'
        size_mb = round(file_obj.size / (1024 * 1024), 2) if file_obj else 0
        
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            user, _ = User.objects.get_or_create(username='demo_user', defaults={'email': 'demo@example.com'})
            
        dataset = serializer.save(user=user, file_name=file_name, size_mb=size_mb)
        
        try:
            summary = generate_summary(dataset.file.path)
            dataset.summary = summary
            dataset.save()
        except Exception as e:
            dataset.summary = {"error": str(e)}
            dataset.save()

class DatasetDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DatasetSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        if user:
            return Dataset.objects.filter(user=user)
        return Dataset.objects.none()

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def run_kmeans_api(request):
    dataset_id = request.data.get('dataset_id')
    n_clusters = int(request.data.get('n_clusters', 3))
    dataset = get_object_or_404(Dataset, id=dataset_id)
    
    result = run_kmeans_clustering(dataset.file.path, n_clusters=n_clusters)
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response(result)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def run_regression_api(request):
    dataset_id = request.data.get('dataset_id')
    target_col = request.data.get('target_col')
    if not target_col:
        return Response({"error": "target_col is required to perform Linear Regression."}, status=status.HTTP_400_BAD_REQUEST)
        
    dataset = get_object_or_404(Dataset, id=dataset_id)
    result = run_linear_regression(dataset.file.path, target_col)
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response(result)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auto_clean_api(request):
    dataset_id = request.data.get('dataset_id')
    dataset = get_object_or_404(Dataset, id=dataset_id)
    
    result = auto_clean_dataset(dataset.file.path)
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
    dataset.summary = result
    dataset.save()
    
    return Response({"status": "success", "summary": result})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def download_dataset_api(request, pk):
    dataset = get_object_or_404(Dataset, pk=pk)
    file_path = dataset.file.path
    content_type, _ = mimetypes.guess_type(file_path)
    response = FileResponse(open(file_path, 'rb'), content_type=content_type or 'application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="{dataset.file_name}"'
    return response

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def run_classification_api(request):
    dataset_id = request.data.get('dataset_id')
    target_col = request.data.get('target_col')
    if not target_col:
        return Response({"error": "target_col is required to perform Classification."}, status=status.HTTP_400_BAD_REQUEST)
        
    dataset = get_object_or_404(Dataset, id=dataset_id)
    result = run_logistic_regression(dataset.file.path, target_col)
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    return Response(result)
