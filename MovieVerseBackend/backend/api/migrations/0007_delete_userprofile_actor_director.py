from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_movie_backdrop_url_alter_movie_homepage_and_more'),
    ]

    operations = [
        migrations.DeleteModel(name='UserProfile'),
        migrations.DeleteModel(name='Actor'),
        migrations.DeleteModel(name='Director'),
    ]
