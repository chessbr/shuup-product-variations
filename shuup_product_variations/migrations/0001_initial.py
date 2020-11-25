# Generated by Django 2.2.15 on 2020-11-26 13:25

from django.db import migrations, models
import django.db.models.deletion
import parler.fields
import parler.models
import shuup.core.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='VariationVariable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ordering', models.SmallIntegerField(db_index=True, default=0)),
                ('identifier', shuup.core.fields.InternalIdentifierField(blank=True, editable=False, max_length=64, null=True, unique=False)),
            ],
            options={
                'verbose_name': 'variation variable',
                'verbose_name_plural': 'variation variables',
                'ordering': ('ordering',),
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='VariationVariableValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ordering', models.SmallIntegerField(db_index=True, default=0)),
                ('identifier', shuup.core.fields.InternalIdentifierField(blank=True, editable=False, max_length=64, null=True, unique=False)),
                ('variable', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='values', to='shuup_product_variations.VariationVariable', verbose_name='variation variable')),
            ],
            options={
                'verbose_name': 'variation value',
                'verbose_name_plural': 'variation values',
                'ordering': ('ordering',),
                'unique_together': {('variable', 'identifier')},
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='VariationVariableValueTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('value', models.CharField(max_length=128, verbose_name='value')),
                ('master', parler.fields.TranslationsForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='shuup_product_variations.VariationVariableValue')),
            ],
            options={
                'verbose_name': 'variation value Translation',
                'db_table': 'shuup_product_variations_variationvariablevalue_translation',
                'db_tablespace': '',
                'managed': True,
                'default_permissions': (),
                'unique_together': {('language_code', 'master')},
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='VariationVariableTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('name', models.CharField(max_length=128, verbose_name='name')),
                ('master', parler.fields.TranslationsForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='shuup_product_variations.VariationVariable')),
            ],
            options={
                'verbose_name': 'variation variable Translation',
                'db_table': 'shuup_product_variations_variationvariable_translation',
                'db_tablespace': '',
                'managed': True,
                'default_permissions': (),
                'unique_together': {('language_code', 'master')},
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
    ]
