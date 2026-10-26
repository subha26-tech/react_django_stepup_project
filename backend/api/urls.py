from django.urls import path
from .views import (
    ProductListView, ProductDetailView, CategoryListView,
    BrandListView, CreateOrderView, VerifyRazorpayPaymentView,
    OrderDetailView, ContactEnquiryView, NewsletterSubscribeView,
    AuthLoginView, AuthRegisterView, AuthMeView, PasswordResetRequestView,
    PasswordResetConfirmView, UserOrdersView, AdminOrdersView, CartView
)

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('brands/', BrandListView.as_view(), name='brand-list'),

    # Orders — list by email must come BEFORE the detail route with <str:order_number>
    path('orders/', UserOrdersView.as_view(), name='user-orders'),
    path('admin/orders/', AdminOrdersView.as_view(), name='admin-orders'),
    path('admin/orders/<int:order_id>/status/', AdminOrdersView.as_view(), name='admin-order-status'),
    path('orders/create/', CreateOrderView.as_view(), name='order-create'),
    path('orders/razorpay-verify/', VerifyRazorpayPaymentView.as_view(), name='razorpay-verify'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),

    path('contact/', ContactEnquiryView.as_view(), name='contact-enquiry'),
    path('subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),

    path('auth/login/', AuthLoginView.as_view(), name='auth-login'),
    path('auth/register/', AuthRegisterView.as_view(), name='auth-register'),
    path('auth/me/', AuthMeView.as_view(), name='auth-me'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/merge/', CartView.as_view(), name='cart-merge'),
]
