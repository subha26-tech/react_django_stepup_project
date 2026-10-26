import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stepup_backend.settings')
django.setup()

from django.db import transaction
from api.models import Category, Brand, Product, Review, Order, OrderItem

def seed():
    # print("Clearing old data...")
    # # OrderItem.objects.all().delete()
    # # Order.objects.all().delete()
    # Review.objects.all().delete()
    # Product.objects.all().delete()
    # Brand.objects.all().delete()
    # Category.objects.all().delete()

     # Skip seeding if the database already contains catalog data.
    if (
        Category.objects.exists()
        or Brand.objects.exists()
        or Product.objects.exists()
        or Review.objects.exists()
        # or Order.objects.exists()
        # or OrderItem.objects.exists()
    ):
        print("Seed data already exists. Skipping insertion.")
        return

    with transaction.atomic():
        print("Creating Categories...")
        cat_mens = Category.objects.create(name='Mens', slug='mens', description='Men Footwear & Shoes', banner_image='/assets/image.png')
        cat_womens = Category.objects.create(name='Womens', slug='womens', description='Women Footwear & Shoes', banner_image='/assets/image (2).png')
        cat_kids = Category.objects.create(name='Kids', slug='kids', description='Kids Footwear & Shoes', banner_image='/assets/image (3).png')
        cat_brands = Category.objects.create(name='Brands', slug='brands', description='Top Shoe Brands')
        cat_offers = Category.objects.create(name='Offers', slug='offers', description='Special Discounts & Offers')

        print("Creating Brands...")
        brand_names = [
            "Comfy Steps", "Ophelia", "Billie", "Drew", "Weaver", "Calista", "Colby",
            "Barbie", "Beckett", "Bluey", "Comfort Plus", "Crocs", "Cushion Walk",
            "Disney frozen", "Disney stitch", "Divaz", "Dunlop", "EarthWorks", "Gabbys Dollhouse",
            "Heart", "Heavenly feet", "Hobos", "Hush puppies", "Jo& Joe", "JuJu",
            "Kickers", "Krush", "Lambretta", "Lilley", "LoL", "Lotus", "Lunar",
            "Marco", "Lozzi", "Marvel", "Maya", "grace", "Original penguin", "Osaga",
            "Paw patrol", "Pokemon", "Red fish", "Red level", "Regatta", "Rieker", "Rocket Dog",
            "Skechers", "Soft line", "Softlites", "Spider-man", "Stone creek", "Super mario",
            "Totes isotoner", "Trespass", "Truffle", "Trux", "Umbro", "Walkright", "Wednesday",
            "Wrangler", "XL"
        ]
        brand_map = {}
        for b_name in brand_names:
            slug = b_name.lower().replace('&', 'and').replace(' ', '-').replace("'", '')
            brand_map[b_name], _ = Brand.objects.get_or_create(name=b_name, slug=slug)

        print("Creating Products...")
        
        # 1. Harlan Mens Tan Boat Shoe (PDP hero product)
        p1 = Product.objects.create(
            name="Harlan Mens Tan Boat Shoe",
            slug="harlan-mens-tan-boat-shoe",
            brand=brand_map["Comfy Steps"],
            category=cat_mens,
            subcategory="Boat Shoe",
            gender="mens",
            price=2799.00,
            original_price=3499.00,
            discount_percent=20,
            description="The Harlan men's boat shoes from Comfy Steps are perfect for your casual summer outings. Featuring a tan upper with navy blue accents and intricate white stitching, these shoes offer a trendy look. The twin elasticated gussets and lace up fastening ensures a quick and secure fit, while the gripped outsole provides stability and security.",
            main_image="/assets/image (4).png",
            image_angles=[
                "/assets/image (4).png",
                "/assets/image (40).png",
                "/assets/image (41).png",
                "/assets/image (42).png",
                "/assets/image (43).png",
                "/assets/image (46).png"
            ],
            colors=[
                {"name": "Tan", "hex": "#b5784c"},
                {"name": "Black", "hex": "#1b1b1b"},
                {"name": "Red", "hex": "#d32f2f"}
            ],
            sizes=[41, 42, 43, 44, 45],
            rating=5.0,
            review_count=16,
            is_trending=True,
            is_new=True
        )

        Review.objects.create(
            product=p1,
            reviewer_name="Beverley",
            location="Weymouth",
            title="Super Looking",
            comment="Very pleased with the super fast delivery and packaging. Shoes are very good quality and superb See more...",
            fit_rating=5,
            comfort_rating=5,
            value_rating=5,
            quality_rating=5,
            overall_rating=5,
            recommended=True
        )
        Review.objects.create(
            product=p1,
            reviewer_name="Beverley",
            location="Weymouth",
            title="Super Looking",
            comment="Very pleased with the super fast delivery and packaging. Shoes are very good quality and superb See more...",
            fit_rating=5,
            comfort_rating=5,
            value_rating=5,
            quality_rating=5,
            overall_rating=5,
            recommended=True
        )

        # 2. Ophelia Womens Silver Diamante Heel
        Product.objects.create(
            name="Ophelia Womens Silver Diamante Heel",
            slug="ophelia-womens-silver-diamante-heel",
            brand=brand_map["Ophelia"],
            category=cat_womens,
            subcategory="Heel",
            gender="womens",
            price=2299.00,
            original_price=2999.00,
            discount_percent=23,
            description="Gleaming metallic strap heels adorned with sparkling micro-diamantes and an ultra-steady mid block heel for parties and weddings.",
            main_image="/assets/14833_2_B02.20250530000126.jpg",
            image_angles=["/assets/14833_2_B02.20250530000126.jpg"],
            colors=[{"name": "Silver", "hex": "#d4d4d8"}],
            sizes=[36, 37, 38, 39, 40],
            rating=5.0,
            review_count=24,
            is_trending=True
        )

        # 3. Billie Womens Silver Diamante Heel
        Product.objects.create(
            name="Billie Womens Silver Diamante Heel",
            slug="billie-womens-silver-diamante-heel",
            brand=brand_map["Billie"],
            category=cat_womens,
            subcategory="Heel",
            gender="womens",
            price=3000.00,
            original_price=3800.00,
            discount_percent=21,
            description="Slip-on mule design showcasing an intricate geometric rhinestone band and mirrored silver heel.",
            main_image="/assets/14832_2_B02.20250530000126.jpg",
            image_angles=["/assets/14832_2_B02.20250530000126.jpg"],
            colors=[{"name": "Silver", "hex": "#e4e4e7"}],
            sizes=[36, 37, 38, 39, 40],
            rating=4.9,
            review_count=18,
            is_trending=True
        )

        # 4. Drew Womens Blush Diamante Slip On Shoe
        Product.objects.create(
            name="Drew Womens Blush Diamante Slip On Shoe",
            slug="drew-womens-blush-diamante-slip-on",
            brand=brand_map["Drew"],
            category=cat_womens,
            subcategory="Slip On",
            gender="womens",
            price=2599.00,
            original_price=3199.00,
            discount_percent=19,
            description="Ultra-lightweight stretch mesh slip-on shoe with radiant blush pink diamantes and ergonomic sole.",
            main_image="/assets/12552_2_B02.20240226000125.jpg",
            image_angles=["/assets/12552_2_B02.20240226000125.jpg"],
            colors=[{"name": "Blush Pink", "hex": "#e0b0b8"}],
            sizes=[36, 37, 38, 39, 40, 41],
            rating=4.8,
            review_count=32,
            is_trending=True
        )

        # 5. Drew Womens Navy Diamante Slip On Shoe
        Product.objects.create(
            name="Drew Womens Navy Diamante Slip On Shoe",
            slug="drew-womens-navy-diamante-slip-on",
            brand=brand_map["Drew"],
            category=cat_womens,
            subcategory="Slip On",
            gender="womens",
            price=1299.00,
            original_price=1999.00,
            discount_percent=35,
            description="Comfortable navy slip-on trainers with all-over tonal diamante glitter and shock-absorbent white sole.",
            main_image="/assets/125098_2_B02.20240229000136.jpg",
            image_angles=["/assets/125098_2_B02.20240229000136.jpg"],
            colors=[{"name": "Navy", "hex": "#1b2a4a"}],
            sizes=[36, 37, 38, 39, 40, 41],
            rating=4.9,
            review_count=45,
            is_trending=True,
            is_offer=True,
            offer_text="Two pairs for thousand"
        )

        # 6. Weaver Mens Navy Lace Up Trainer
        Product.objects.create(
            name="Weaver Mens Navy Lace Up Trainer",
            slug="weaver-mens-navy-lace-up-trainer",
            brand=brand_map["Weaver"],
            category=cat_mens,
            subcategory="Trainers",
            gender="mens",
            price=2799.00,
            original_price=3499.00,
            discount_percent=20,
            description="Performance lifestyle lace-up trainer built with engineered mesh, padded ankle support and durable rubber grip.",
            main_image="/assets/image (5).png",
            image_angles=["/assets/image (5).png"],
            colors=[{"name": "Navy", "hex": "#1e293b"}],
            sizes=[40, 41, 42, 43, 44, 45],
            rating=4.8,
            review_count=28,
            is_trending=True
        )

        # 7. Weaver Mens White Lace Up Trainer
        Product.objects.create(
            name="Weaver Mens White Lace Up Trainer",
            slug="weaver-mens-white-lace-up-trainer",
            brand=brand_map["Weaver"],
            category=cat_mens,
            subcategory="Trainers",
            gender="mens",
            price=2259.00,
            original_price=2899.00,
            discount_percent=22,
            description="Crisp white trainer with sleek aerodynamic accents, breathable upper and lightweight athletic sole.",
            main_image="/assets/830166_2_B02.20240925000409.jpg",
            image_angles=["/assets/830166_2_B02.20240925000409.jpg"],
            colors=[{"name": "White", "hex": "#ffffff"}],
            sizes=[40, 41, 42, 43, 44, 45],
            rating=4.7,
            review_count=19,
            is_trending=True
        )

        # 8. Calista Girls Pink Daisy Print Sandal
        Product.objects.create(
            name="Calista Girls Pink Daisy Print Sandal",
            slug="calista-girls-pink-daisy-print-sandal",
            brand=brand_map["Calista"],
            category=cat_kids,
            subcategory="Sandals",
            gender="kids",
            price=2899.00,
            original_price=3299.00,
            discount_percent=12,
            description="Delightful pink strap sandals adorned with cheerful yellow-center daisy charms and dual touch-fasten closures.",
            main_image="/assets/292091_2_B02.20240807000251.jpg",
            image_angles=["/assets/292091_2_B02.20240807000251.jpg"],
            colors=[{"name": "Pink", "hex": "#f472b6"}],
            sizes=[28, 29, 30, 31, 32, 33],
            rating=5.0,
            review_count=14,
            is_trending=True
        )

        # 9. Colby Boys Blue Dinosaur Canvas
        Product.objects.create(
            name="Colby Boys Blue Dinosaur Canvas",
            slug="colby-boys-blue-dinosaur-canvas",
            brand=brand_map["Colby"],
            category=cat_kids,
            subcategory="Canvas",
            gender="kids",
            price=3299.00,
            original_price=3999.00,
            discount_percent=18,
            description="Vibrant royal blue canvas shoe with colorful Jurassic dinosaur prints, easy fasten strap and fun molded dinosaur sidewall.",
            main_image="/assets/20741_2_B02.20240304000134.jpg",
            image_angles=["/assets/20741_2_B02.20240304000134.jpg"],
            colors=[{"name": "Blue", "hex": "#1d4ed8"}],
            sizes=[28, 29, 30, 31, 32, 33],
            rating=5.0,
            review_count=21,
            is_trending=True
        )

        # Additional catalog items from images 6-39
        additional_catalog = [
            ("Weaver Mens Charcoal Runner", "Weaver", cat_mens, "Trainers", "mens", 2499.00, "/assets/image (6).png", [41, 42, 43, 44]),
            ("Comfy Steps Mens Oxford Leather", "Comfy Steps", cat_mens, "Oxford", "mens", 3299.00, "/assets/image (7).png", [41, 42, 43, 44, 45]),
            ("Walkright Mens Leather Loafer", "Walkright", cat_mens, "Loafer", "mens", 2199.00, "/assets/image (8).png", [40, 41, 42, 43, 44]),
            ("EarthWorks Mens Steel Toe Boot", "EarthWorks", cat_mens, "Boots", "mens", 3799.00, "/assets/image (9).png", [41, 42, 43, 44, 45]),
            ("Trespass Mens Outdoor Trail Shoe", "Trespass", cat_mens, "Shoes", "mens", 3499.00, "/assets/image (10).png", [41, 42, 43, 44]),
            ("Hush puppies Casual Slip On", "Hush puppies", cat_mens, "Slip On", "mens", 2899.00, "/assets/image (11).png", [40, 41, 42, 43]),
            ("Lilley Womens Classic Ankle Boot", "Lilley", cat_womens, "Boots", "womens", 2699.00, "/assets/image (12).png", [36, 37, 38, 39, 40]),
            ("Softlites Womens Comfort Ballerina", "Softlites", cat_womens, "Ballerina", "womens", 1899.00, "/assets/image (13).png", [36, 37, 38, 39]),
            ("Lotus Womens Strappy Party Heel", "Lotus", cat_womens, "Heel", "womens", 3499.00, "/assets/image (14).png", [37, 38, 39, 40]),
            ("Cushion Walk Womens Mule Slipper", "Cushion Walk", cat_womens, "Slippers", "womens", 1299.00, "/assets/image (15).png", [36, 37, 38, 39, 40]),
            ("Rocket Dog Womens Chunky Trainer", "Rocket Dog", cat_womens, "Trainers", "womens", 3199.00, "/assets/image (16).png", [36, 37, 38, 39]),
            ("Truffle Womens Platform Sandal", "Truffle", cat_womens, "Sandals", "womens", 2499.00, "/assets/image (17).png", [36, 37, 38, 39, 40]),
            ("Disney Frozen Girls Sparkle Sneaker", "Disney frozen", cat_kids, "Character", "kids", 2399.00, "/assets/image (18).png", [26, 27, 28, 29, 30]),
            ("Spider-man Boys Light-Up Trainer", "Spider-man", cat_kids, "Character", "kids", 2799.00, "/assets/image (19).png", [28, 29, 30, 31, 32]),
            ("Paw Patrol Kids Waterproof Wellies", "Paw patrol", cat_kids, "Wellies", "kids", 1799.00, "/assets/image (20).png", [25, 26, 27, 28, 29]),
            ("Barbie Girls Glitter Strap Sandal", "Barbie", cat_kids, "Sandals", "kids", 1999.00, "/assets/image (21).png", [27, 28, 29, 30, 31]),
            ("Kickers Kids Leather School Shoe", "Kickers", cat_kids, "Shoes", "kids", 2999.00, "/assets/image (22).png", [28, 29, 30, 31, 32]),
            ("Super Mario Boys Canvas Sneaker", "Super mario", cat_kids, "Canvas", "kids", 2199.00, "/assets/image (23).png", [28, 29, 30, 31, 32]),
            ("Skechers Mens Ultra Flex Trainer", "Skechers", cat_mens, "Trainers", "mens", 4299.00, "/assets/image (24).png", [41, 42, 43, 44, 45]),
            ("Wrangler Mens Rugged Desert Boot", "Wrangler", cat_mens, "Boots", "mens", 3999.00, "/assets/image (25).png", [41, 42, 43, 44]),
            ("Rieker Womens Cushioned Sandal", "Rieker", cat_womens, "Sandals", "womens", 2799.00, "/assets/image (26).png", [36, 37, 38, 39, 40]),
            ("Bluey Kids Warm Fleece Slipper", "Bluey", cat_kids, "Slippers", "kids", 1499.00, "/assets/image (27).png", [24, 25, 26, 27, 28])
        ]

        for item in additional_catalog:
            name, brand_key, cat, subcat, gen, price, img, sizes = item
            slug = name.lower().replace(' ', '-').replace("'", '')
            Product.objects.create(
                name=name,
                slug=slug,
                brand=brand_map[brand_key],
                category=cat,
                subcategory=subcat,
                gender=gen,
                price=price,
                original_price=price * 1.25,
                discount_percent=20,
                description=f"High quality {name} made with premium materials for maximum durability and effortless everyday style.",
                main_image=img,
                image_angles=[img],
                colors=[{"name": "Default", "hex": "#333333"}],
                sizes=sizes,
                rating=4.7,
                review_count=10,
                is_new=True
            )

        # Create the reference Order #Bh2300006 from Tracking Page!
        # demo_order = Order.objects.create(
        #     order_number="#Bh2300006",
        #     customer_name="Beverley",
        #     email="stepup@gmail.com",
        #     phone="+91XXXXXXXXXX",
        #     address_line="2/38, yyyyyyyyyyyy",
        #     city="Tenkasi",
        #     state="Tamilnadu",
        #     landmark="Near Post office",
        #     pincode="627811",
        #     payment_method="COD",
        #     payment_status="Pending",
        #     total_amount=2799.00,
        #     delivery_fees=0.00,
        #     status="In Transit",
        #     expected_delivery="Exp : Delivery by sun, May 31",
        #     status_history=[
        #         {
        #             "title": "Order Placed",
        #             "time": "May 21,2025 | 03:45 pm",
        #             "completed": True,
        #             "icon": "cart"
        #         },
        #         {
        #             "title": "OrderDispatched",
        #             "time": "May 22,2025 | 11:45 am",
        #             "completed": True,
        #             "icon": "home"
        #         },
        #         {
        #             "title": "Order in transit",
        #             "time": "Reached at Tenkasi,Post office",
        #             "completed": True,
        #             "icon": "truck"
        #         },
        #         {
        #             "title": "Delivered successfully",
        #             "time": "Not delivered yet",
        #             "completed": False,
        #             "icon": "check"
        #         }
        #     ]
        # )

        # OrderItem.objects.create(
        #     order=demo_order,
        #     product=p1,
        #     product_name=p1.name,
        #     product_image=p1.main_image,
        #     brand_name=p1.brand.name,
        #     size="41",
        #     quantity=1,
        #     price=p1.price
        # )

        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
