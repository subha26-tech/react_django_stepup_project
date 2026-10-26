from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from razorpay.errors import SignatureVerificationError

from .models import Brand, Cart, CartItem, Category, Order, Product


class CartWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='shopper',
            email='shopper@example.com',
            password='correct-horse-battery',
        )
        self.brand = Brand.objects.create(name='StepUp', slug='stepup')
        self.category = Category.objects.create(name='Shoes', slug='shoes')
        self.product = Product.objects.create(
            name='Everyday Shoe',
            slug='everyday-shoe',
            brand=self.brand,
            category=self.category,
            price=Decimal('2799.00'),
            description='Comfortable everyday footwear.',
            main_image='/assets/everyday-shoe.png',
        )

    def authenticate(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_login_requires_valid_backend_credentials_and_returns_token(self):
        cache.clear()
        response = self.client.post(
            '/api/auth/login/',
            {'email': 'unknown@example.com', 'password': 'any-password'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            '/api/auth/login/',
            {'email': 'SHOPPER@example.com', 'password': 'correct-horse-battery'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['id'], self.user.id)
        self.assertTrue(response.data['token'])

    def test_registration_creates_an_authenticated_account(self):
        response = self.client.post('/api/auth/register/', {
            'name': 'New Shopper',
            'email': 'new-shopper@example.com',
            'password': 'secure-password-123',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['token'])
        self.assertTrue(User.objects.get(email='new-shopper@example.com').check_password('secure-password-123'))

    def test_guest_cart_merge_combines_same_product_variant(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, size='41', quantity=2)
        self.authenticate()

        response = self.client.post('/api/cart/merge/', {
            'items': [
                {'id': self.product.id, 'size': '41', 'quantity': 1},
                {'id': self.product.id, 'size': '41', 'quantity': 3},
                {'id': self.product.id, 'size': '42', 'quantity': 1},
            ]
        }, format='json')

        self.assertEqual(response.status_code, 200)
        items = {(item['id'], item['size']): item for item in response.data['items']}
        self.assertEqual(items[(self.product.id, '41')]['quantity'], 6)
        self.assertEqual(items[(self.product.id, '42')]['quantity'], 1)
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 2)

    def test_cart_is_private_and_authenticated_changes_are_persisted(self):
        self.assertEqual(self.client.get('/api/cart/').status_code, 401)

        self.authenticate()
        payload = {'items': [{'id': self.product.id, 'size': '43', 'quantity': 2}]}
        response = self.client.put('/api/cart/', payload, format='json')

        self.assertEqual(response.status_code, 200)
        saved_item = CartItem.objects.get(cart__user=self.user)
        self.assertEqual((saved_item.size, saved_item.quantity), ('43', 2))

        response = self.client.get('/api/cart/')
        self.assertEqual(response.data['items'][0]['size'], '43')
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def create_razorpay_order(self):
        return Order.objects.create(
            order_number='#payment-test',
            customer_name='Shopper',
            email='shopper@example.com',
            phone='1234567890',
            address_line='1 Main Street',
            city='Tenkasi',
            state='Tamil Nadu',
            pincode='627811',
            payment_method='RAZORPAY',
            razorpay_order_id='order_payment_test',
            total_amount=Decimal('2799.00'),
            status='Pending Payment',
            expected_delivery=None,
            status_history=[
                {
                    'title': 'Order created',
                    'time': 'Jan 01, 2026 | 01:00 PM',
                    'description': 'Order placed; awaiting payment.',
                    'completed': True,
                    'icon': 'cart',
                },
                {'title': 'Order Dispatched', 'time': 'Awaiting dispatch', 'completed': False, 'icon': 'home'},
                {'title': 'Order in transit', 'time': 'Awaiting transit', 'completed': False, 'icon': 'truck'},
                {'title': 'Delivered successfully', 'time': 'Not delivered yet', 'completed': False, 'icon': 'check'},
            ],
        )

    @patch('api.views.razorpay.Client')
    def test_razorpay_order_waits_for_payment_before_scheduling_delivery(self, client_factory):
        client_factory.return_value.order.create.return_value = {'id': 'order_created_test'}

        response = self.client.post('/api/orders/create/', {
            'firstName': 'Shopper',
            'lastName': 'Test',
            'email': 'shopper@example.com',
            'phone': '1234567890',
            'addressLine': '1 Main Street',
            'city': 'Tenkasi',
            'state': 'Tamil Nadu',
            'pincode': '627811',
            'payment_method': 'RAZORPAY',
            'delivery_fees': 0,
            'total_amount': '2799.00',
            'items': [{
                'id': self.product.id,
                'name': self.product.name,
                'image': self.product.main_image,
                'brand': self.brand.name,
                'size': '41',
                'quantity': 1,
                'price': '2799.00',
            }],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(order_number=response.data['order']['order_number'])
        self.assertEqual(order.status, 'Pending Payment')
        self.assertIsNone(order.expected_delivery)
        self.assertEqual(order.status_history[0]['title'], 'Order created')
        self.assertIn('awaiting payment', order.status_history[0]['description'])

    @patch('api.views.razorpay.Client')
    def test_failed_payment_verification_does_not_confirm_order(self, client_factory):
        order = self.create_razorpay_order()
        client_factory.return_value.utility.verify_payment_signature.side_effect = SignatureVerificationError(
            'Invalid signature'
        )

        response = self.client.post('/api/orders/razorpay-verify/', {
            'order_number': order.order_number,
            'razorpay_order_id': order.razorpay_order_id,
            'razorpay_payment_id': 'pay_invalid',
            'razorpay_signature': 'invalid',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, 'Pending')

    @patch('api.views.razorpay.Client')
    def test_valid_payment_verification_confirms_order(self, client_factory):
        order = self.create_razorpay_order()
        client = client_factory.return_value
        client.payment.fetch.return_value = {
            'order_id': order.razorpay_order_id,
            'status': 'captured',
            'amount': 279900,
            'currency': 'INR',
        }

        response = self.client.post('/api/orders/razorpay-verify/', {
            'order_number': order.order_number,
            'razorpay_order_id': order.razorpay_order_id,
            'razorpay_payment_id': 'pay_valid',
            'razorpay_signature': 'valid',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        order.refresh_from_db()
        self.assertEqual(order.payment_status, 'Paid')
        self.assertEqual(order.status, 'Placed')
        self.assertTrue(order.expected_delivery)

    @patch('api.views.razorpay.Client')
    def test_confirmed_failed_payment_marks_order_failed(self, client_factory):
        order = self.create_razorpay_order()
        client_factory.return_value.payment.fetch.return_value = {
            'order_id': order.razorpay_order_id,
            'status': 'failed',
            'amount': 279900,
            'currency': 'INR',
            'error_description': 'Payment declined',
        }

        response = self.client.post('/api/orders/razorpay-failed/', {
            'order_number': order.order_number,
            'razorpay_order_id': order.razorpay_order_id,
            'razorpay_payment_id': 'pay_failed',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        order.refresh_from_db()
        self.assertEqual(order.payment_status, 'Failed')
        self.assertEqual(order.status, 'Payment Failed')
        self.assertIsNone(order.expected_delivery)
        self.assertEqual(order.payment_failure_reason, 'Payment declined')
        self.assertEqual(order.razorpay_payment_id, 'pay_failed')
        self.assertEqual(order.status_history[-1]['title'], 'Payment failed')
        self.assertEqual(order.status_history[-1]['description'], 'Payment declined')

    @patch('api.views.razorpay.Client')
    def test_unconfirmed_failed_payment_does_not_change_order(self, client_factory):
        order = self.create_razorpay_order()
        client_factory.return_value.payment.fetch.return_value = {
            'order_id': order.razorpay_order_id,
            'status': 'authorized',
            'amount': 279900,
            'currency': 'INR',
        }

        response = self.client.post('/api/orders/razorpay-failed/', {
            'order_number': order.order_number,
            'razorpay_order_id': order.razorpay_order_id,
            'razorpay_payment_id': 'pay_not_failed',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, 'Pending')

    @patch('api.views.razorpay.Client')
    def test_payment_verification_rejects_mismatched_amount_or_currency(self, client_factory):
        order = self.create_razorpay_order()
        client = client_factory.return_value

        for payment_details in (
            {
                'order_id': order.razorpay_order_id,
                'status': 'captured',
                'amount': 1,
                'currency': 'INR',
            },
            {
                'order_id': order.razorpay_order_id,
                'status': 'captured',
                'amount': 279900,
                'currency': 'USD',
            },
        ):
            with self.subTest(payment_details=payment_details):
                client.payment.fetch.return_value = payment_details
                response = self.client.post('/api/orders/razorpay-verify/', {
                    'order_number': order.order_number,
                    'razorpay_order_id': order.razorpay_order_id,
                    'razorpay_payment_id': 'pay_invalid_order_amount',
                    'razorpay_signature': 'valid',
                }, format='json')

                self.assertEqual(response.status_code, 400)
                order.refresh_from_db()
                self.assertEqual(order.payment_status, 'Pending')
