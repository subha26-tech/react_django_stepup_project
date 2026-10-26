from django.contrib import admin
from .order_status import apply_order_status
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'product_image', 'brand_name', 'size', 'quantity', 'price')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'customer_name',
        'email',
        'status',
        'payment_status',
        'created_at',
    )
    list_filter = ('status', 'payment_method', 'payment_status')
    search_fields = ('order_number', 'customer_name', 'email', 'phone')
    readonly_fields = ('created_at',)
    inlines = (OrderItemInline,)

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            previous_status = Order.objects.only('status').get(pk=obj.pk).status
            apply_order_status(obj, obj.status, previous_status=previous_status)

        super().save_model(request, obj, form, change)
