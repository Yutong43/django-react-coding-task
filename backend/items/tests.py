# rom django.test import TestCase

# Create your tests here.

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Item

class ItemAPITests(APITestCase):
    def setUp(self):
        # Each test starts with one existing item in a fresh test database.
        self.item = Item.objects.create(
            name='Water',
            group=Item.Group.PRIMARY,
        )
        self.list_url = reverse('item-list-create')

    def test_list_items(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Water')

    def test_create_item(self):
        response = self.client.post(
            self.list_url,
            {'name': 'Wood', 'group': Item.Group.SECONDARY},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Make sure the item was actually saved, not just returned by the API.
        self.assertTrue(
            Item.objects.filter(
                name='Wood',
                group=Item.Group.SECONDARY,
            ).exists()
        )

    def test_rejects_duplicate_name_in_same_group(self):
        response = self.client.post(
            self.list_url,
            {'name': 'Water', 'group': Item.Group.PRIMARY},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn('non_field_errors', response.data)
        self.assertEqual(Item.objects.count(), 1)

    def test_allows_same_name_in_different_group(self):
        response = self.client.post(
            self.list_url,
            {'name': 'Water', 'group': Item.Group.SECONDARY},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(response.data['group'], Item.Group.SECONDARY)
        self.assertEqual(Item.objects.count(), 2)

    def test_retrieve_item(self):
        detail_url = reverse('item-detail', args=[self.item.pk])

        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.item.pk)
        self.assertEqual(response.data['name'], 'Water')
        self.assertEqual(response.data['group'], Item.Group.PRIMARY)

    def test_patch_item(self):
        detail_url = reverse('item-detail', args=[self.item.pk])

        response = self.client.patch(
            detail_url,
            {'name': 'Updated Water'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Water')

        self.item.refresh_from_db()
        self.assertEqual(self.item.name, 'Updated Water')

        # PATCH should leave fields that were not sent unchanged.
        self.assertEqual(self.item.group, Item.Group.PRIMARY)

    def test_rejects_duplicate_name_when_patching_same_group(self):
        # setUp already created Water in Primary.
        second_item = Item.objects.create(
            name='Wood',
            group=Item.Group.PRIMARY,
        )
        detail_url = reverse('item-detail', args=[second_item.pk])

        response = self.client.patch(
            detail_url,
            {'name': 'Water'},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn('non_field_errors', response.data)

        second_item.refresh_from_db()
        self.assertEqual(second_item.name, 'Wood')

    def test_missing_item_returns_404(self):
        detail_url = reverse('item-detail', args=[9999])

        response = self.client.get(detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertIn('detail', response.data)