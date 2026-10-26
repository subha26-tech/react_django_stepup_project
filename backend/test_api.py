import os, django, json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stepup_backend.settings')
django.setup()

from django.test import Client

client = Client()

# 1. Product list
res = client.get('/api/products/')
assert res.status_code == 200, f'Status {res.status_code}'
data = res.json()
print("Product list OK: count =", len(data), "first =", data[0]["name"])

# 2. Product detail
res = client.get('/api/products/1/')
assert res.status_code == 200
p1 = res.json()
print("Product detail OK:", p1["name"], "reviews =", len(p1["reviews"]))

# 3. Order creation (COD)
order_payload = {
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john@example.com',
    'phone': '9876543210',
    'addressLine': '123 Main St',
    'city': 'Mumbai',
    'state': 'Maharashtra',
    'landmark': 'Station',
    'pincode': '400001',
    'payment_method': 'COD',
    'total_amount': 2799,
    'items': [{'id': 1, 'name': 'Harlan Mens Tan Boat Shoe', 'size': '41', 'quantity': 1, 'price': 2799}]
}
res = client.post('/api/orders/create/', data=json.dumps(order_payload), content_type='application/json')
assert res.status_code == 201
ord_data = res.json()
order_no = ord_data['order']['order_number']
print("Order create OK:", order_no)

# 4. Order tracking detail
clean_no = order_no.replace('#', '')
res = client.get(f'/api/orders/{clean_no}/')
assert res.status_code == 200
print("Order detail fetch OK:", res.json()["order_number"], "status =", res.json()["status"])

# 5. Contact enquiry
res = client.post('/api/contact/', data=json.dumps({'name': 'Test', 'email': 'test@test.com', 'phone': '9999999999', 'message': 'Hello'}), content_type='application/json')
assert res.status_code == 201
print("Contact enquiry OK")

# 6. Newsletter subscribe
res = client.post('/api/subscribe/', data=json.dumps({'email': 'newsub@example.com'}), content_type='application/json')
assert res.status_code == 201
print("Newsletter subscribe OK")
