from django.db import models


class Item(models.Model):
    class Group(models.TextChoices):
        PRIMARY = 'Primary', 'Primary'
        SECONDARY = 'Secondary', 'Secondary'

    name = models.CharField(max_length=100)
    group = models.CharField(max_length=9, choices=Group.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Names can repeat across groups, but not within the same group
        constraints = [
            models.UniqueConstraint(
                fields=['group', 'name'],
                name='unique_item_name_per_group',
            ),
        ]

    def __str__(self):
        return f'{self.name} ({self.group})'