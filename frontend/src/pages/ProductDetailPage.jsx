import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('Tan');
  const [selectedSize, setSelectedSize] = useState('41');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fallback product data matching Product description page.png exactly
  const fallbackProduct = {
    id: 1,
    name: "Harlan Mens Tan Boat Shoe",
    brand: { name: "Comfy Steps" },
    price: 2799,
    original_price: 3499,
    description: "The Harlan men's boat shoes from Comfy Steps are perfect for your casual summer outings. Featuring a tan upper with navy blue accents and intricate white stitching, these shoes offer a trendy look. The twin elasticated gussets and lace up fastening ensures a quick and secure fit, while the gripped outsole provides stability and security.",
    main_image: "/assets/image (4).png",
    image_angles: [
      "/assets/image (4).png",
      "/assets/image (40).png",
      "/assets/image (41).png",
      "/assets/image (42).png",
      "/assets/image (43).png",
      "/assets/image (46).png"
    ],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Tan", hex: "#99582a" },
      { name: "Red", hex: "#e11d48" }
    ],
    sizes: [41, 42, 43, 44, 45],
    rating: 5.0,
    review_count: 16,
    reviews: [
      {
        reviewer_name: "Beverley",
        location: "Weymouth",
        title: "Super Looking",
        comment: "Very pleased with the super fast delivery and packaging. Shoes are very good quality and superb See more...",
        fit_rating: 5,
        comfort_rating: 5,
        value_rating: 5,
        quality_rating: 5,
        overall_rating: 5,
        recommended: true
      },
      {
        reviewer_name: "Beverley",
        location: "Weymouth",
        title: "Super Looking",
        comment: "Very pleased with the super fast delivery and packaging. Shoes are very good quality and superb See more...",
        fit_rating: 5,
        comfort_rating: 5,
        value_rating: 5,
        quality_rating: 5,
        overall_rating: 5,
        recommended: true
      }
    ]
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const prodId = id || 1;
    axios.get(`http://127.0.0.1:8000/api/products/${prodId}/`)
      .then(res => {
        setProduct(res.data);
        if (res.data.colors && res.data.colors.length > 0) {
          setSelectedColor(res.data.colors[0].name);
        }
        if (res.data.sizes && res.data.sizes.length > 0) {
          setSelectedSize(String(res.data.sizes[0]));
        }
        if (res.data.image_angles && res.data.image_angles.length > 0) {
          setSelectedImage(res.data.image_angles[0]);
        }
      })
      .catch(() => {
        setProduct(fallbackProduct);
        setSelectedImage(fallbackProduct.image_angles[0]);
      });
  }, [id]);

  const p = product || fallbackProduct;

  const handleAddToCart = () => {
    addToCart(p, selectedSize, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(p, selectedSize, quantity);
    navigate('/checkout');
  };

  const imagesGrid = (p.image_angles && p.image_angles.length > 0) 
    ? p.image_angles 
    : [p.main_image, p.main_image, p.main_image, p.main_image, p.main_image, p.main_image];

  return (
    <div className="fade-in container" style={{ marginTop: '28px', marginBottom: '60px' }}>
      
      {/* Added to cart toast */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#1f4747',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✓ {p.name} added to cart!</span>
          <button 
            onClick={() => navigate('/cart')}
            style={{ backgroundColor: '#ffffff', color: '#1f4747', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
          >
            View Cart
          </button>
        </div>
      )}

      {/* Main Product Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '50px', alignItems: 'start' }}>
        
        {/* Left: 6 Image Grid (2x3) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {imagesGrid.slice(0, 6).map((imgUrl, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                cursor: 'pointer',
                border: selectedImage === imgUrl ? '2px solid #1f4747' : '1px solid #e2e8f0',
                transition: 'border-color 0.2s'
              }}
              onClick={() => setSelectedImage(imgUrl)}
            >
              <img 
                src={imgUrl} 
                alt={`${p.name} angle ${index + 1}`} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.src = '/assets/image (4).png'; }}
              />
            </div>
          ))}
        </div>

        {/* Right: Product Actions & Details */}
        <div>
          <h2 className="serif-font" style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            {p.brand?.name || 'Comfy Steps'}
          </h2>
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: '#334155', marginBottom: '14px' }}>
            {p.name}
          </h1>

          <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            MRP ₹ {Number(p.price).toLocaleString('en-IN')}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: '#f59e0b', fontSize: '16px' }}>★</span>
            ))}
            <span style={{ fontSize: '14px', color: '#475569', marginLeft: '6px' }}>
              {p.rating || 5}/5({p.review_count || 16} reviews)
            </span>
          </div>

          {/* Color Selector */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              Color : {selectedColor}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(p.colors && p.colors.length > 0 ? p.colors : [
                { name: "Black", hex: "#111111" },
                { name: "Tan", hex: "#99582a" },
                { name: "Red", hex: "#dc2626" }
              ]).map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: selectedColor === c.name ? '3px solid #1f4747' : '2px solid #cbd5e1',
                    outline: selectedColor === c.name ? '2px solid #ffffff' : 'none'
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Shoe Size Selector */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
              Shoe Size
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(p.sizes && p.sizes.length > 0 ? p.sizes : [41, 42, 43, 44, 45]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(String(sz))}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedSize === String(sz) ? '#1f4747' : '#e2e8f0',
                    color: selectedSize === String(sz) ? '#ffffff' : '#1e293b',
                    borderRadius: '3px',
                    fontWeight: '600',
                    fontSize: '14px',
                    minWidth: '42px'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              Quantity
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '6px 14px', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}
              >
                –
              </button>
              <span style={{ padding: '6px 14px', fontSize: '15px', fontWeight: '600', color: '#0f172a', minWidth: '32px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '6px 14px', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                backgroundColor: '#2b5050',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'serif',
                textAlign: 'center'
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              style={{
                backgroundColor: '#234d4e',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <span>Buy Now</span>
              <span style={{ backgroundColor: '#ffffff', color: '#2563eb', fontSize: '11px', padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold' }}>
                GPay / Card
              </span>
            </button>
          </div>

          {/* Secure Checkout Box */}
          <div 
            style={{ 
              border: '1px solid #1e293b', 
              borderRadius: '2px', 
              padding: '10px 16px', 
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
              Secure Checkout With
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', fontSize: '13px', fontWeight: 'bold' }}>
              <span style={{ border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '2px', color: '#0284c7' }}>UPI</span>
              <span style={{ color: '#ea580c' }}>mastercard</span>
              <span style={{ color: '#0284c7', fontStyle: 'italic' }}>RuPay▶</span>
              <span style={{ color: '#1d4ed8', fontWeight: '900' }}>VISA</span>
            </div>
          </div>

          {/* WhatsApp Size Advisor */}
          <div 
            style={{ 
              border: '1px solid #1e293b', 
              borderRadius: '2px', 
              padding: '8px 16px', 
              textAlign: 'center',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13.5px',
              fontWeight: '500',
              color: '#0f172a'
            }}
          >
            <span>Unsure about your size? Let's connect</span>
            <span style={{ color: '#22c55e', fontSize: '18px' }}>🟢</span>
          </div>

          {/* Info Card (COD, Dispatch, Return) */}
          <div 
            style={{ 
              backgroundColor: '#e2e8f0', 
              borderRadius: '8px', 
              padding: '16px 20px', 
              textAlign: 'center',
              marginBottom: '28px'
            }}
          >
            <p style={{ fontSize: '14.5px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
              COD Available
            </p>
            <p style={{ fontSize: '14.5px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
              24 Hour Dispatch
            </p>
            <p style={{ fontSize: '14.5px', fontWeight: '600', color: '#1e293b' }}>
              7 Days easy return & exchange
            </p>
          </div>

          {/* Product Details Section */}
          <div>
            <h3 className="serif-font" style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              Product Details
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
              {p.description}
            </p>
          </div>

        </div>

      </div>

      {/* Reviews Section matching Product description page.png */}
      <section style={{ marginTop: '60px' }}>
        {(p.reviews && p.reviews.length > 0 ? p.reviews : fallbackProduct.reviews).map((rev, idx) => (
          <div 
            key={idx}
            style={{
              border: '1px solid #1e293b',
              padding: '24px 30px',
              marginBottom: '20px',
              backgroundColor: '#ffffff'
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', fontFamily: 'serif', color: '#0f172a' }}>
              Reviews:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
              
              {/* Reviewer info + Rating Breakdown */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#234d4e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {rev.reviewer_name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      Reviewed by {rev.reviewer_name}
                    </p>
                    <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                      From: {rev.location || 'Weymouth'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                    <span>Fit</span>
                    <span style={{ color: '#f59e0b' }}>★★★★★</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                    <span>Comfort</span>
                    <span style={{ color: '#f59e0b' }}>★★★★★</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                    <span>Value for Money</span>
                    <span style={{ color: '#f59e0b' }}>★★★★★</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                    <span>Quality</span>
                    <span style={{ color: '#f59e0b' }}>★★★★★</span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {rev.title || 'Super Looking'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>Overall rating</span>
                  <span style={{ color: '#f59e0b', fontSize: '15px' }}>★★★★★</span>
                </div>
                <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', marginBottom: '12px' }}>
                  {rev.comment}
                </p>
                <p style={{ fontSize: '13.5px', fontWeight: '600', color: '#1f4747' }}>
                  {rev.reviewer_name} would recommend this product <span style={{ color: '#16a34a' }}>✔</span>
                </p>
              </div>

            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
