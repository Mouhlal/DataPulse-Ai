from django.db import models
from django.contrib.auth.models import User

class Dataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='datasets/')
    file_name = models.CharField(max_length=255)
    size_mb = models.FloatField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Store simple stats from the CSV analysis here, e.g. rows, columns
    summary = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.file_name}"
