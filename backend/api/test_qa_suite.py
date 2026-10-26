from decimal import Decimal
import json
import re
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib import admin
from django.core.cache import cache
from django.core import mail
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.test import Client, RequestFactory, TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .admin import OrderAdmin
from .models import Brand, CartItem, Category, ContactEnquiry, NewsletterSubscriber, Order, OrderItem, Product


class PublicApiQualityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username='qa-customer',
            email='qa-customer@example.com',
            password='qa-customer-password',
        )
        self.other_customer = User.objects.create_user(
            username='other-customer',
            email='other-customer@example.com',
            password='other-customer-password',
        )
        self.brand = Brand.objects.create(name='QA Brand', slug='qa-brand')
        self.category = Category.objects.create(name='QA Shoes', slug='qa-shoes')
        self.product = Product.objects.create(
            name='QA Walking Shoe',
            slug='qa-walking-shoe',
            brand=self.brand,
            category=self.category,
            gender='mens',
            subcategory='Trainers',
            price=Decimal('1200.00'),
            description='QA product fixture',
            main_image='/assets/qa-shoe.png',
            sizes=[41, 42],
            colors=[{'name': 'Black', 'hex': '#000000'}],
            is_trending=True,
            is_new=True,
            is_offer=True,
        )

    def create_order(self, order_number='#qa-private-order', email='qa-customer@example.com'):
        return Order.objects.create(
            order_number=order_number,
            customer_name='QA Customer',
            email=email,
            phone='9876543210',
            address_line='10 QA Street',
            city='Tenkasi',
            state='Tamil Nadu',
            pincode='627811',
            total_amount=Decimal('1200.00'),
        )

    def authenticate_as(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_catalog_lists_and_product_detail(self):
        self.assertEqual(self.client.get('/api/products/').status_code, 200)
        self.assertEqual(self.client.get('/api/products/1/').status_code, 200)
        self.assertEqual(self.client.get('/api/categories/').status_code, 200)
        self.assertEqual(self.client.get('/api/brands/').status_code, 200)

    def test_catalog_text_and_category_filters(self):
        for query in ('search=Walking', 'category=mens', 'brand=qa-brand', 'style=Trainer'):
            with self.subTest(query=query):
                response = self.client.get(f'/api/products/?{query}')
                self.assertEqual(response.status_code, 200)
                self.assertEqual([item['id'] for item in response.data], [self.product.id])

    def test_catalog_boolean_filters_and_no_match(self):
        for query in ('trending=true', 'new=true', 'offer=true'):
            with self.subTest(query=query):
                response = self.client.get(f'/api/products/?{query}')
                self.assertEqual(response.status_code, 200)
                self.assertEqual([item['id'] for item in response.data], [self.product.id])

        response = self.client.get('/api/products/?search=definitely-not-a-product')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_invalid_product_id_returns_not_found(self):
        self.assertEqual(self.client.get('/api/products/999999/').status_code, 404)

    def test_size_filter_returns_catalog_results(self):
        response = self.client.get('/api/products/?size=41')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [self.product.id])

    def test_valid_contact_enquiry_is_persisted(self):
        response = self.client.post('/api/contact/', {
            'name': 'QA Customer',
            'email': 'qa-customer@example.com',
            'phone': '9876543210',
            'message': 'QA contact request',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactEnquiry.objects.count(), 1)

    def test_contact_rejects_missing_and_invalid_fields(self):
        missing = self.client.post('/api/contact/', {}, format='json')
        self.assertEqual(missing.status_code, 400)

        invalid_email = self.client.post('/api/contact/', {
            'name': 'QA Customer',
            'email': 'not-an-email',
            'phone': '9876543210',
            'message': 'QA contact request',
        }, format='json')
        self.assertEqual(invalid_email.status_code, 400)

    def test_newsletter_requires_email_and_duplicate_subscription_is_idempotent(self):
        self.assertEqual(
            self.client.post('/api/subscribe/', {}, format='json').status_code,
            400,
        )
        payload = {'email': 'qa-newsletter@example.com'}
        self.assertEqual(self.client.post('/api/subscribe/', payload, format='json').status_code, 201)
        self.assertEqual(self.client.post('/api/subscribe/', payload, format='json').status_code, 201)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)

    def test_valid_cod_order_persists_order_items_and_delivery_history(self):
        response = self.client.post('/api/orders/create/', {
            'firstName': 'QA',
            'lastName': 'Customer',
            'email': 'qa-customer@example.com',
            'phone': '9876543210',
            'addressLine': '10 QA Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'COD',
            'total_amount': '1200.00',
            'items': [{
                'id': self.product.id,
                'name': self.product.name,
                'size': '41',
                'quantity': 1,
                'price': '1200.00',
            }],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertEqual(len(response.data['order']['status_history']), 4)

    def test_authenticated_order_uses_account_email_and_appears_in_my_orders(self):
        self.authenticate_as(self.customer)

        response = self.client.post('/api/orders/create/', {
            'firstName': 'QA',
            'lastName': 'Customer',
            'email': 'different-contact@example.com',
            'phone': '9876543210',
            'addressLine': '10 QA Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'COD',
            'total_amount': '1200.00',
            'items': [{
                'id': self.product.id,
                'name': self.product.name,
                'size': '41',
                'quantity': 1,
                'price': '1200.00',
            }],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['order']['email'], self.customer.email)

        my_orders = self.client.get('/api/orders/')
        self.assertEqual(my_orders.status_code, 200)
        self.assertEqual(
            [order['order_number'] for order in my_orders.data],
            [response.data['order']['order_number']],
        )

    def test_admin_status_change_updates_tracking_progress(self):
        order = self.create_order()
        order.status_history = [
            {'title': 'Order Placed', 'time': 'Placed', 'completed': True, 'icon': 'cart'},
            {'title': 'Order Dispatched', 'time': 'Awaiting dispatch', 'completed': False, 'icon': 'home'},
            {'title': 'Order in transit', 'time': 'Awaiting transit', 'completed': False, 'icon': 'truck'},
            {'title': 'Delivered successfully', 'time': 'Not delivered yet', 'completed': False, 'icon': 'check'},
        ]
        order.save(update_fields=['status_history'])
        changed_order = Order.objects.get(pk=order.pk)
        changed_order.status = 'In Transit'

        OrderAdmin(Order, admin.site).save_model(
            RequestFactory().post('/admin/api/order/'),
            changed_order,
            SimpleNamespace(changed_data=['status']),
            change=True,
        )

        changed_order.refresh_from_db()
        self.assertEqual(
            [step['completed'] for step in changed_order.status_history],
            [True, True, True, False],
        )
        self.assertNotEqual(changed_order.status_history[2]['time'], 'Awaiting transit')
        self.assertEqual(changed_order.status_history[3]['time'], 'Not delivered yet')

    def test_staff_api_lists_orders_and_updates_status_but_rejects_customers(self):
        order = self.create_order()
        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            product_image=self.product.main_image,
            brand_name=self.brand.name,
            size='42',
            quantity=1,
            price=self.product.price,
        )
        order.status_history = [
            {'title': 'Order Placed', 'time': 'Placed', 'completed': True, 'icon': 'cart'},
            {'title': 'Order Dispatched', 'time': 'Awaiting dispatch', 'completed': False, 'icon': 'home'},
            {'title': 'Order in transit', 'time': 'Awaiting transit', 'completed': False, 'icon': 'truck'},
            {'title': 'Delivered successfully', 'time': 'Not delivered yet', 'completed': False, 'icon': 'check'},
        ]
        order.save(update_fields=['status_history'])
        endpoint = f'/api/admin/orders/{order.pk}/status/'

        self.assertEqual(self.client.get('/api/admin/orders/').status_code, 401)
        self.assertEqual(self.client.patch(endpoint, {'status': 'Delivered'}, format='json').status_code, 401)

        self.authenticate_as(self.customer)
        self.assertEqual(self.client.get('/api/admin/orders/').status_code, 403)
        self.assertEqual(self.client.patch(endpoint, {'status': 'Delivered'}, format='json').status_code, 403)

        staff = User.objects.create_user(
            username='qa-staff',
            email='qa-staff@example.com',
            password='qa-staff-password',
            is_staff=True,
        )
        staff_login = self.client.post('/api/auth/login/', {
            'email': staff.email,
            'password': 'qa-staff-password',
        }, format='json')
        self.assertEqual(staff_login.status_code, 200)
        self.assertTrue(staff_login.data['user']['is_staff'])

        self.authenticate_as(staff)
        order_list = self.client.get('/api/admin/orders/')
        self.assertEqual(order_list.status_code, 200)
        self.assertEqual(order_list.data[0]['order_number'], order.order_number)
        self.assertEqual(
            order_list.data[0]['items'][0]['product_category_name'],
            self.category.name,
        )

        invalid = self.client.patch(endpoint, {'status': 'Cancelled'}, format='json')
        self.assertEqual(invalid.status_code, 400)

        updated = self.client.patch(endpoint, {'status': 'In Transit'}, format='json')
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data['status'], 'In Transit')
        self.assertEqual(
            [step['completed'] for step in updated.data['status_history']],
            [True, True, True, False],
        )

    def test_login_uses_django_auth_and_returns_admin_staff_customer_roles(self):
        cache.clear()
        staff = User.objects.create_user(
            username='role-staff',
            email='role-staff@example.com',
            password='role-staff-password',
            is_staff=True,
        )
        admin_user = User.objects.create_superuser(
            username='role-admin',
            email='role-admin@example.com',
            password='role-admin-password',
        )
        inactive = User.objects.create_user(
            username='role-inactive',
            email='role-inactive@example.com',
            password='role-inactive-password',
            is_active=False,
        )

        accounts = (
            (self.customer, 'customer', False, False, 'qa-customer-password'),
            (staff, 'staff', True, False, 'role-staff-password'),
            (admin_user, 'admin', True, True, 'role-admin-password'),
        )
        for account, role, is_staff, is_superuser, password in accounts:
            with self.subTest(role=role):
                response = self.client.post('/api/auth/login/', {
                    'email': account.email,
                    'password': password,
                }, format='json')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['user']['role'], role)
                self.assertEqual(response.data['user']['is_staff'], is_staff)
                self.assertEqual(response.data['user']['is_superuser'], is_superuser)
                self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
                current_user = self.client.get('/api/auth/me/')
                self.assertEqual(current_user.status_code, 200)
                self.assertEqual(current_user.data['user']['role'], role)

        self.client.credentials()
        disabled_login = self.client.post('/api/auth/login/', {
            'email': inactive.email,
            'password': 'role-inactive-password',
        }, format='json')
        self.assertEqual(disabled_login.status_code, 400)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_request_is_generic_and_reset_revokes_tokens(self):
        cache.clear()
        self.authenticate_as(self.customer)
        old_token = Token.objects.get(user=self.customer)

        valid_request = self.client.post('/api/auth/password-reset/', {
            'email': self.customer.email,
        }, format='json')
        unknown_request = self.client.post('/api/auth/password-reset/', {
            'email': 'unknown-password-reset@example.com',
        }, format='json')

        self.assertEqual(valid_request.status_code, 200)
        self.assertEqual(unknown_request.status_code, 200)
        self.assertEqual(valid_request.data, unknown_request.data)
        self.assertEqual(len(mail.outbox), 1)

        match = re.search(
            r'http://127\.0\.0\.1:5173/reset-password/([^/\s]+)/([^/\s]+)',
            mail.outbox[0].body,
        )
        self.assertIsNotNone(match)
        uid, reset_token = match.groups()

        reset = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid,
            'token': reset_token,
            'password': 'T0ugh-Reset-Password!2026',
        }, format='json')
        self.assertEqual(reset.status_code, 200)
        self.assertTrue(User.objects.get(pk=self.customer.pk).check_password('T0ugh-Reset-Password!2026'))
        self.assertFalse(Token.objects.filter(pk=old_token.pk).exists())

        replay = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid,
            'token': reset_token,
            'password': 'Another-T0ugh-Password!2026',
        }, format='json')
        self.assertEqual(replay.status_code, 400)

        login = self.client.post('/api/auth/login/', {
            'email': self.customer.email,
            'password': 'T0ugh-Reset-Password!2026',
        }, format='json')
        self.assertEqual(login.status_code, 200)

    def test_password_reset_confirm_rejects_weak_password_and_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.customer.pk))
        token = default_token_generator.make_token(self.customer)
        weak_password = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid,
            'token': token,
            'password': '123',
        }, format='json')
        self.assertEqual(weak_password.status_code, 400)
        self.assertTrue(User.objects.get(pk=self.customer.pk).check_password('qa-customer-password'))

        invalid_token = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid,
            'token': 'invalid-token',
            'password': 'T0ugh-Reset-Password!2026',
        }, format='json')
        self.assertEqual(invalid_token.status_code, 400)

    def test_staff_admin_can_change_order_status_in_admin_form(self):
        staff = User.objects.create_superuser(
            username='qa-order-admin',
            email='qa-order-admin@example.com',
            password='qa-order-admin-password',
        )
        order = self.create_order()
        order.status_history = [
            {'title': 'Order Placed', 'time': 'Placed', 'completed': True, 'icon': 'cart'},
            {'title': 'Order Dispatched', 'time': 'Awaiting dispatch', 'completed': False, 'icon': 'home'},
            {'title': 'Order in transit', 'time': 'Awaiting transit', 'completed': False, 'icon': 'truck'},
            {'title': 'Delivered successfully', 'time': 'Not delivered yet', 'completed': False, 'icon': 'check'},
        ]
        order.save(update_fields=['status_history'])

        client = Client()
        client.force_login(staff)
        change_url = reverse('admin:api_order_change', args=[order.pk])
        form_page = client.get(change_url)
        self.assertEqual(form_page.status_code, 200)
        self.assertContains(form_page, 'name="status"')

        form = form_page.context['adminform'].form
        form_data = {}
        for name, field in form.fields.items():
            if name not in form.initial:
                continue
            value = form.initial[name]
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            form_data[name] = '' if value is None else str(value)
        form_data['status'] = 'In Transit'
        form_data['_save'] = 'Save'
        form_data.update({
            'items-TOTAL_FORMS': '0',
            'items-INITIAL_FORMS': '0',
            'items-MIN_NUM_FORMS': '0',
            'items-MAX_NUM_FORMS': '1000',
        })

        response = client.post(change_url, form_data)
        self.assertEqual(response.status_code, 302)
        order.refresh_from_db()
        self.assertEqual(order.status, 'In Transit')
        self.assertEqual(
            [step['completed'] for step in order.status_history],
            [True, True, True, False],
        )

    @patch('api.views.razorpay.Client')
    def test_razorpay_order_uses_exact_server_amount_in_paise(self, client_factory):
        self.product.price = Decimal('1200.37')
        self.product.save(update_fields=['price'])
        client_factory.return_value.order.create.return_value = {'id': 'order_qa_payment'}

        response = self.client.post('/api/orders/create/', {
            'firstName': 'QA',
            'lastName': 'Customer',
            'email': 'qa-customer@example.com',
            'phone': '9876543210',
            'addressLine': '10 QA Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'RAZORPAY',
            'total_amount': '1200.37',
            'items': [{
                'id': self.product.id,
                'name': self.product.name,
                'size': '41',
                'quantity': 1,
                'price': '1200.37',
            }],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        razorpay_request = client_factory.return_value.order.create.call_args.args[0]
        self.assertEqual(razorpay_request['amount'], 120037)
        self.assertEqual(response.data['razorpay_order_id'], 'order_qa_payment')
        self.assertEqual(Order.objects.get().total_amount, Decimal('1200.37'))

    def test_order_creation_rejects_missing_customer_and_items(self):
        response = self.client.post('/api/orders/create/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_creation_rejects_unknown_product_instead_of_substituting(self):
        response = self.client.post('/api/orders/create/', {
            'firstName': 'QA',
            'lastName': 'Customer',
            'email': 'qa-customer@example.com',
            'phone': '9876543210',
            'addressLine': '10 QA Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'COD',
            'total_amount': '1200.00',
            'items': [{'id': 999999, 'size': '41', 'quantity': 1}],
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(OrderItem.objects.count(), 0)

    def test_order_list_requires_customer_authorization(self):
        self.create_order()
        response = self.client.get('/api/orders/?email=qa-customer@example.com')
        self.assertEqual(response.status_code, 401)

        self.create_order(order_number='#qa-other-order', email='other-customer@example.com')
        self.authenticate_as(self.customer)
        response = self.client.get('/api/orders/?email=other-customer@example.com')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([order['order_number'] for order in response.data], ['#qa-private-order'])

    def test_order_detail_requires_customer_authorization(self):
        self.create_order()
        response = self.client.get('/api/orders/qa-private-order/')
        self.assertEqual(response.status_code, 401)

        self.authenticate_as(self.other_customer)
        response = self.client.get('/api/orders/qa-private-order/')
        self.assertEqual(response.status_code, 404)

        self.authenticate_as(self.customer)
        response = self.client.get('/api/orders/qa-private-order/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['order_number'], '#qa-private-order')

    def test_cart_rejects_invalid_quantities_and_missing_variant_without_mutation(self):
        self.authenticate_as(self.customer)
        valid_items = [{'id': self.product.id, 'size': '41', 'quantity': 2}]
        self.assertEqual(self.client.put('/api/cart/', {'items': valid_items}, format='json').status_code, 200)

        for invalid_item in (
            {'id': self.product.id, 'size': '41', 'quantity': 0},
            {'id': self.product.id, 'size': '41', 'quantity': -1},
            {'id': self.product.id, 'quantity': 1},
        ):
            with self.subTest(item=invalid_item):
                response = self.client.put('/api/cart/', {'items': [invalid_item]}, format='json')
                self.assertEqual(response.status_code, 400)
                saved = CartItem.objects.get(cart__user=self.customer)
                self.assertEqual((saved.size, saved.quantity), ('41', 2))

        removed = self.client.put('/api/cart/', {'items': []}, format='json')
        self.assertEqual(removed.status_code, 200)
        self.assertEqual(removed.data['items'], [])

    def test_registration_rejects_duplicate_and_weak_passwords(self):
        duplicate = self.client.post('/api/auth/register/', {
            'name': 'QA Customer',
            'email': self.customer.email,
            'password': 'valid-password-123',
        }, format='json')
        self.assertEqual(duplicate.status_code, 400)

        for password in ('short', 'password', '12345678'):
            with self.subTest(password=password):
                response = self.client.post('/api/auth/register/', {
                    'name': 'Weak Password User',
                    'email': f'{password.replace(" ", "")}@example.com',
                    'password': password,
                }, format='json')
                self.assertEqual(response.status_code, 400)

    def test_order_rejects_tampered_totals_and_item_prices(self):
        base_payload = {
            'firstName': 'QA',
            'lastName': 'Customer',
            'email': 'qa-customer@example.com',
            'phone': '9876543210',
            'addressLine': '10 QA Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'COD',
            'total_amount': '1.00',
            'items': [{
                'id': self.product.id,
                'name': self.product.name,
                'size': '41',
                'quantity': 1,
                'price': '0.01',
            }],
        }
        tampering_cases = (
            {'total_amount': '1.00', 'item_price': '0.01', 'quantity': 1},
            {'total_amount': '-1.00', 'item_price': str(self.product.price), 'quantity': 1},
            {'total_amount': '1.00', 'item_price': str(self.product.price), 'quantity': 100000000},
        )
        for case in tampering_cases:
            with self.subTest(case=case):
                orders_before = Order.objects.count()
                payload = {
                    **base_payload,
                    'total_amount': case['total_amount'],
                    'items': [{
                        **base_payload['items'][0],
                        'price': case['item_price'],
                        'quantity': case['quantity'],
                    }],
                }
                response = self.client.post('/api/orders/create/', payload, format='json')
                self.assertEqual(response.status_code, 400)
                self.assertEqual(Order.objects.count(), orders_before)

    def test_search_and_contact_validate_untrusted_inputs(self):
        response = self.client.get('/api/products/?search=%27%20OR%201%3D1--')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        response = self.client.post('/api/contact/', {
            'name': 'N' * 101,
            'email': 'qa@example.com',
            'phone': '9876543210',
            'message': 'QA message',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_authentication_attempts_are_rate_limited(self):
        cache.clear()
        statuses = []
        for attempt in range(6):
            response = self.client.post('/api/auth/login/', {
                'email': 'unknown@example.com',
                'password': f'wrong-password-{attempt}',
            }, format='json')
            statuses.append(response.status_code)
        self.assertEqual(statuses[:5], [400] * 5)
        self.assertEqual(statuses[5], 429)

    def test_catalog_endpoint_has_no_pagination_contract(self):
        first_page = self.client.get('/api/products/?page=1&page_size=1')
        later_page = self.client.get('/api/products/?page=2&page_size=1')
        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(later_page.status_code, 200)
        self.assertIsInstance(first_page.data, list)
        self.assertEqual(first_page.data, later_page.data)
