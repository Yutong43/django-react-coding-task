# from django.shortcuts import render

# Create your views here.

from rest_framework import generics  # Generic views for the item API.

from .models import Item
from .serializers import ItemSerializer


class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.all().order_by('id')
    serializer_class = ItemSerializer


class ItemDetailView(generics.RetrieveUpdateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    http_method_names = ['get', 'patch', 'head', 'options']