import os
import random
import time
import logging
from smtplib import SMTPException
from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.db import connection, transaction
from django.db.models import Q
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils.encoding import force_bytes
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
import razorpay
from razorpay.errors import SignatureVerificationError

from .models import Category, Brand, Product, Review, Order, OrderItem, ContactEnquiry, NewsletterSubscriber, Cart, CartItem
from .serializers import (
    CategorySerializer, BrandSerializer, ProductSerializer,
    ReviewSerializer, OrderSerializer, ContactEnquirySerializer,
    NewsletterSubscriberSerializer
)
from .order_status import apply_order_status

logger = logging.getLogger(__name__)

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().select_related('brand', 'category').prefetch_related('reviews')
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(
                Q(category__slug__iexact=category) | 
                Q(category__name__iexact=category) |
                Q(gender__iexact=category)
            )

        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(Q(brand__slug__iexact=brand) | Q(brand__name__iexact=brand))

        style = self.request.query_params.get('style')
        if style:
            queryset = queryset.filter(Q(subcategory__icontains=style) | Q(name__icontains=style))

        size = self.request.query_params.get('size')

        color = self.request.query_params.get('color')
        if color:
            queryset = queryset.filter(colors__contains=[{'name': color}]) | queryset.filter(description__icontains=color)

        trending = self.request.query_params.get('trending')
        if trending and trending.lower() == 'true':
            queryset = queryset.filter(is_trending=True)

        is_new = self.request.query_params.get('new')
        if is_new and is_new.lower() == 'true':
            queryset = queryset.filter(is_new=True)

        is_offer = self.request.query_params.get('offer')
        if is_offer and is_offer.lower() == 'true':
            queryset = queryset.filter(is_offer=True)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(brand__name__icontains=search) |
                Q(subcategory__icontains=search)
            )

        queryset = queryset.order_by('-created_at')
        if size:
            if connection.features.supports_json_field_contains:
                queryset = queryset.filter(sizes__contains=size)
            else:
                matching_ids = [
                    product.id
                    for product in Product.objects.filter(id__in=queryset.values('id')).only('id', 'sizes')
                    if isinstance(product.sizes, list)
                    and any(str(product_size) == size for product_size in product.sizes)
                ]
                queryset = queryset.filter(id__in=matching_ids)

        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all().select_related('brand', 'category').prefetch_related('reviews')
    lookup_field = 'id'

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class BrandListView(generics.ListAPIView):
    serializer_class = BrandSerializer
    queryset = Brand.objects.all().order_by('name')

class CreateOrderView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        data = request.data

        customer_name = f"{data.get('firstName', '')} {data.get('lastName', '')}".strip() or data.get('customer_name', 'Customer')
        email = data.get('email', '')
        if request.user.is_authenticated:
            email = request.user.email
        phone = data.get('phone', '')

        address_line = data.get('addressLine', '') or data.get('address', '')
        city = data.get('city', '')
        state = data.get('state', '')
        landmark = data.get('landmark', '')
        pincode = data.get('pincode', '')

        payment_method = data.get('payment_method', 'COD')
        items_data = data.get('items', [])

        required_fields = {
            'customer_name': customer_name,
            'email': email,
            'phone': phone,
            'addressLine': address_line,
            'city': city,
            'state': state,
            'pincode': pincode,
        }
        missing_fields = [
            field for field, value in required_fields.items()
            if not isinstance(value, str) or not value.strip()
        ]
        if missing_fields:
            return Response(
                {'error': 'Required order details are missing', 'fields': missing_fields},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'A valid email address is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(payment_method, str):
            return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)
        payment_method = payment_method.upper()
        if payment_method not in {'COD', 'RAZORPAY'}:
            return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(items_data, list) or not items_data:
            return Response({'error': 'At least one order item is required'}, status=status.HTTP_400_BAD_REQUEST)

        validated_items = []
        for item in items_data:
            if not isinstance(item, dict):
                return Response({'error': 'Each order item must be an object'}, status=status.HTTP_400_BAD_REQUEST)
            product_id = item.get('id') or item.get('productId')
            if product_id in (None, ''):
                return Response({'error': 'Each order item must include a product ID'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                product = Product.objects.select_related('brand').get(id=product_id)
            except (Product.DoesNotExist, TypeError, ValueError):
                return Response({'error': 'A requested product was not found'}, status=status.HTTP_400_BAD_REQUEST)

            quantity = item.get('quantity', 1)
            if isinstance(quantity, bool):
                return Response({'error': 'Item quantity must be a positive integer'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                return Response({'error': 'Item quantity must be a positive integer'}, status=status.HTTP_400_BAD_REQUEST)
            if quantity < 1 or quantity > 99:
                return Response(
                    {'error': 'Item quantity must be between 1 and 99'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                item_price = Decimal(str(item.get('price', product.price)))
            except (InvalidOperation, TypeError, ValueError):
                return Response({'error': 'Item price is invalid'}, status=status.HTTP_400_BAD_REQUEST)
            if not item_price.is_finite() or item_price != product.price:
                return Response({'error': 'Item price does not match the catalog'}, status=status.HTTP_400_BAD_REQUEST)
            validated_items.append((item, product, quantity))

        try:
            delivery_fees = Decimal(str(data.get('delivery_fees', 0)))
            submitted_total = Decimal(str(data.get('total_amount')))
        except (InvalidOperation, TypeError, ValueError):
            return Response({'error': 'Order totals must be valid amounts'}, status=status.HTTP_400_BAD_REQUEST)
        if not delivery_fees.is_finite() or delivery_fees not in {Decimal('0.00'), Decimal('199.00')}:
            return Response({'error': 'Invalid delivery fee'}, status=status.HTTP_400_BAD_REQUEST)
        if not submitted_total.is_finite():
            return Response({'error': 'Order total must be a valid amount'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum(
            (product.price * quantity for _, product, quantity in validated_items),
            Decimal('0.00'),
        ) + delivery_fees
        if submitted_total != total_amount:
            return Response({'error': 'Order total does not match the catalog'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate custom order number format like in reference: #Bh2300006
        random_suffix = random.randint(100000, 999999)
        order_number = f"#Bh23{random_suffix}"

        # Current time formatted
        now = datetime.now()
        placed_time = now.strftime('%b %d,%Y | %I:%M %p')
        exp_date = (now + timedelta(days=5)).strftime('Exp : Delivery by %a, %b %d')

        initial_history = [
            {
                'title': 'Order created' if payment_method == 'RAZORPAY' else 'Order Placed',
                'time': placed_time,
                **({
                    'description': 'Order placed; awaiting payment.'
                } if payment_method == 'RAZORPAY' else {}),
                'completed': True,
                'icon': 'cart'
            },
            {
                'title': 'Order Dispatched',
                'time': 'Awaiting dispatch',
                'completed': False,
                'icon': 'home'
            },
            {
                'title': 'Order in transit',
                'time': 'Awaiting transit',
                'completed': False,
                'icon': 'truck'
            },
            {
                'title': 'Delivered successfully',
                'time': 'Not delivered yet',
                'completed': False,
                'icon': 'check'
            }
        ]

        # Razorpay integration
        razorpay_order_id = None
        if payment_method == 'RAZORPAY':
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                amount_in_paise = int(total_amount * 100)
                rp_order = client.order.create({
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': order_number,
                    'payment_capture': 1
                })
                razorpay_order_id = rp_order['id']
            except Exception as e:
                return Response(
                    {'error': f'Unable to create Razorpay payment order: {str(e)}'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        with transaction.atomic():
            order = Order.objects.create(
                order_number=order_number,
                customer_name=customer_name,
                email=email,
                phone=phone,
                address_line=address_line,
                city=city,
                state=state,
                landmark=landmark,
                pincode=pincode,
                payment_method=payment_method,
                payment_status='Pending',
                razorpay_order_id=razorpay_order_id,
                total_amount=total_amount,
                delivery_fees=delivery_fees,
                status='Pending Payment' if payment_method == 'RAZORPAY' else 'Placed',
                expected_delivery=exp_date if payment_method == 'COD' else None,
                status_history=initial_history
            )
            for item, prod, quantity in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    product_name=item.get('name', prod.name),
                    product_image=item.get('image', prod.main_image),
                    brand_name=item.get('brand', prod.brand.name if prod.brand else ''),
                    size=str(item.get('size', 41)),
                    quantity=quantity,
                    price=item.get('price', prod.price)
                )

        serializer = OrderSerializer(order)
        return Response({
            'order': serializer.data,
            'razorpay_order_id': razorpay_order_id,
            'razorpay_key_id': settings.RAZORPAY_KEY_ID
        }, status=status.HTTP_201_CREATED)

class VerifyRazorpayPaymentView(APIView):
    def post(self, request):
        data = request.data
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        order_number = data.get('order_number')

        if not all((razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number)):
            return Response({'error': 'Payment verification details are required'}, status=status.HTTP_400_BAD_REQUEST,)

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND,)

        if order.payment_method != "RAZORPAY":
            return Response(
                {"error": "Invalid payment method"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Confirm that the submitted ID matches the stored Razorpay ID.
        if order.razorpay_order_id != razorpay_order_id:
            return Response(
                {"error": "Razorpay order ID mismatch"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET,))
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
            # Fetch payment details from Razorpay.
            payment = client.payment.fetch(razorpay_payment_id)
            
        except SignatureVerificationError:
            return Response({'error': 'Payment signature verification failed'}, status=status.HTTP_400_BAD_REQUEST,)
        except razorpay.errors.RazorpayError:
            return Response(
                {"error": "Unable to verify payment with Razorpay"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Confirm the payment belongs to this order and is captured.
        if payment.get("order_id") != razorpay_order_id:
            return Response(
                {"error": "Payment does not belong to this Razorpay order"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.get("status") != "captured":
            return Response(
                {
                    "error": "Payment is not captured",
                    "payment_status": payment.get("status"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payment.get("amount") != int(order.total_amount * 100):
            return Response(
                {"error": "Payment amount does not match the order"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payment.get("currency") != "INR":
            return Response(
                {"error": "Payment currency does not match the order"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.payment_status = 'Paid'
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        now = timezone.localtime()
        order.expected_delivery = (now + timedelta(days=5)).strftime('Exp : Delivery by %a, %b %d')
        order.payment_failure_reason = ''
        apply_order_status(order, 'Placed', previous_status='Pending Payment')
        order.save()

        serializer = OrderSerializer(order)
        return Response({'success': True, 'order': serializer.data}, status=status.HTTP_200_OK)

class FailRazorpayPaymentView(APIView):
    def post(self, request):
        data = request.data
        order_number = data.get('order_number')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')

        if not all((order_number, razorpay_order_id, razorpay_payment_id)):
            return Response(
                {'error': 'Payment failure details are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_method != 'RAZORPAY' or order.razorpay_order_id != razorpay_order_id:
            return Response({'error': 'Razorpay order ID mismatch'}, status=status.HTTP_400_BAD_REQUEST)
        if order.payment_status == 'Paid':
            return Response({'error': 'A paid order cannot be marked as failed'}, status=status.HTTP_400_BAD_REQUEST)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        try:
            payment = client.payment.fetch(razorpay_payment_id)
        except razorpay.errors.RazorpayError:
            logger.exception('Unable to verify failed Razorpay payment for order %s', order_number)
            return Response(
                {'error': 'Unable to verify payment failure with Razorpay'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if payment.get('order_id') != razorpay_order_id:
            return Response(
                {'error': 'Payment does not belong to this Razorpay order'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payment.get('status') != 'failed':
            return Response(
                {'error': 'Razorpay has not confirmed this payment as failed'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payment.get('amount') != int(order.total_amount * 100) or payment.get('currency') != 'INR':
            return Response(
                {'error': 'Payment amount or currency does not match the order'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_failure_reason = (
            payment.get('error_description')
            or data.get('error_description')
            or 'Payment could not be completed. Customer can retry.'
        )
        if not isinstance(payment_failure_reason, str):
            payment_failure_reason = 'Payment could not be completed. Customer can retry.'
        payment_failure_reason = payment_failure_reason.strip()[:1000]
        if not payment_failure_reason:
            payment_failure_reason = 'Payment could not be completed. Customer can retry.'

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.payment_status == 'Paid':
                return Response(
                    {'error': 'A paid order cannot be marked as failed'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            history = list(order.status_history or [])
            if not any(
                entry.get('title') == 'Payment failed'
                and entry.get('razorpay_payment_id') == razorpay_payment_id
                for entry in history
                if isinstance(entry, dict)
            ):
                history.append({
                    'title': 'Payment failed',
                    'time': timezone.localtime().strftime('%b %d, %Y | %I:%M %p'),
                    'description': payment_failure_reason,
                    'completed': True,
                    'icon': 'payment_failed',
                    'razorpay_payment_id': razorpay_payment_id,
                })

            order.payment_status = 'Failed'
            order.razorpay_payment_id = razorpay_payment_id
            order.status = 'Payment Failed'
            order.expected_delivery = None
            order.payment_failure_reason = payment_failure_reason
            order.status_history = history
            order.save(update_fields=[
                'payment_status',
                'razorpay_payment_id',
                'status',
                'expected_delivery',
                'payment_failure_reason',
                'status_history',
            ])

        return Response({'success': True, 'order': OrderSerializer(order).data}, status=status.HTTP_200_OK)

class OrderDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        # Decode and handle with/without '#'
        clean_no = order_number.replace('%23', '').replace('#', '')
        with_hash = f"#{clean_no}"

        try:
            order = Order.objects.filter(
                Q(order_number=with_hash) | 
                Q(order_number=clean_no) | 
                Q(order_number=order_number)
            ).first()
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            if order.email.casefold() != request.user.email.casefold():
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

class ContactEnquiryView(generics.CreateAPIView):
    serializer_class = ContactEnquirySerializer

class AdminContactEnquiriesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        enquiries = ContactEnquiry.objects.all().order_by('-created_at')
        return Response(ContactEnquirySerializer(enquiries, many=True).data)

class NewsletterSubscribeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        return Response({
            'success': True,
            'message': 'Subscribed successfully' if created else 'Already subscribed'
        }, status=status.HTTP_201_CREATED)

class AuthLoginView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_login'

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not password:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
        email = email.strip()
        user = User.objects.filter(email__iexact=email).first()
        user = authenticate(request, username=user.username, password=password) if user else None
        if not user:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'user': _auth_user_payload(user),
        })

class AuthRegisterView(APIView):
    def post(self, request):
        name = request.data.get('name', '')
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        if (
            not isinstance(name, str)
            or not isinstance(email, str)
            or not isinstance(password, str)
            or not email.strip()
            or not password
        ):
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip()
        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        username = email.split('@')[0]
        if User.objects.filter(username=username).exists():
            username = email
        user = User(username=username, email=email, first_name=name.strip())
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response(
                {'error': ' '.join(error.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(password)
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'user': _auth_user_payload(user),
        }, status=status.HTTP_201_CREATED)


def _auth_user_payload(user):
    role = 'admin' if user.is_superuser else 'staff' if user.is_staff else 'customer'
    return {
        'id': user.id,
        'name': user.first_name or user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'role': role,
    }


class AuthMeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'success': True, 'user': _auth_user_payload(request.user)})


class PasswordResetRequestView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_password_reset'

    def post(self, request):
        email = request.data.get('email', '')
        if not isinstance(email, str) or not email.strip():
            return Response(
                {'error': 'Enter the email address associated with your account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = email.strip()
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'error': 'Enter a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user and user.has_usable_password():
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f'{settings.FRONTEND_URL}/reset-password/{uid}/{token}'
            message = (
                f'Hello {user.first_name or user.username},\n\n'
                f'Use the link below to reset your StepUp password:\n{reset_url}\n\n'
                'If you did not request this change, you can ignore this email.'
            )
            try:
                send_mail(
                    'Reset your StepUp password',
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except (SMTPException, OSError):
                logger.exception('Unable to send password reset email for user id %s', user.pk)

        return Response({
            'success': True,
            'message': 'If an account exists for that email, password reset instructions have been sent.',
        })


class PasswordResetConfirmView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_password_reset_confirm'

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        password = request.data.get('password', '')
        if not all(isinstance(value, str) and value for value in (uid, token, password)):
            return Response(
                {'error': 'A valid reset link and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, UnicodeDecodeError, User.DoesNotExist):
            return Response(
                {'error': 'This password reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'This password reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response(
                {'error': ' '.join(error.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=['password'])
        Token.objects.filter(user=user).delete()
        return Response({'success': True, 'message': 'Your password has been reset. Please sign in.'})


class CartView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'items': self._cart_items(request.user)})

    def put(self, request):
        normalized_items, error = self._normalize_items(request.data.get('items'))
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart.items.all().delete()
            CartItem.objects.bulk_create([
                CartItem(cart=cart, product=product, size=size, quantity=quantity)
                for product, size, quantity in normalized_items
            ])

        return Response({'items': self._cart_items(request.user)})

    def post(self, request):
        normalized_items, error = self._normalize_items(request.data.get('items'))
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(user=request.user)
            for product, size, quantity in normalized_items:
                item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    size=size,
                    defaults={'quantity': quantity}
                )
                if not created:
                    item.quantity += quantity
                    item.save(update_fields=['quantity'])

        return Response({'items': self._cart_items(request.user)})

    @staticmethod
    def _normalize_items(items):
        if not isinstance(items, list):
            return None, 'items must be a list'

        quantities = {}
        products = {}
        for item in items:
            if not isinstance(item, dict):
                return None, 'Each cart item must be an object'

            product_id = item.get('id', item.get('product_id'))
            size = str(item.get('size', '')).strip()
            quantity = item.get('quantity')
            if not size or len(size) > 20:
                return None, 'Each cart item must have a valid size'
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                return None, 'Each cart item must have a positive integer quantity'
            try:
                product = Product.objects.get(pk=product_id)
            except (Product.DoesNotExist, TypeError, ValueError):
                return None, f'Product {product_id} does not exist'

            key = (product.pk, size)
            products[key] = product
            quantities[key] = quantities.get(key, 0) + quantity

        return [
            (products[key], key[1], quantity)
            for key, quantity in quantities.items()
        ], None

    @staticmethod
    def _cart_items(user):
        cart = Cart.objects.filter(user=user).first()
        if cart is None:
            return []
        return [
            {
                'id': item.product_id,
                'name': item.product.name,
                'brand': item.product.brand.name,
                'price': str(item.product.price),
                'size': item.size,
                'quantity': item.quantity,
                'image': item.product.main_image,
                'deliveryFee': 0,
            }
            for item in cart.items.select_related('product__brand').order_by('id')
        ]


class UserOrdersView(APIView):
    """Return orders associated with the authenticated account email."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.email.strip()
        if not email:
            return Response({'error': 'Account email is required'}, status=status.HTTP_400_BAD_REQUEST)
        orders = Order.objects.filter(email__iexact=email).prefetch_related('items').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminOrdersView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.prefetch_related(
            'items__product__category',
        ).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)

    def patch(self, request, order_id):
        new_status = request.data.get('status')
        allowed_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in allowed_statuses:
            return Response(
                {'error': 'Choose a valid order status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=order_id)
                if order.payment_method == 'RAZORPAY' and order.payment_status == 'Failed':
                    return Response(
                        {'error': 'Shipment status cannot be changed while Razorpay payment has failed.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                apply_order_status(order, new_status)
                order.save(update_fields=['status', 'status_history'])
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderSerializer(order).data)
