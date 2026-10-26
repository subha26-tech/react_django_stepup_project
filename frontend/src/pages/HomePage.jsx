import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback 8 products matching Home page.png layout reference
  const fallbackTrending = [
    {
      id: 2,
      name: 'Ophelia Womens Silver Diamante Heel',
      price: 2299,
      main_image: '/assets/14833_2_B02.20250530000126.jpg'
    },
    {
      id: 3,
      name: 'Billie Womens Silver Diamante Heel',
      price: 3000,
      main_image: '/assets/14832_2_B02.20250530000126.jpg'
    },
    {
      id: 4,
      name: 'Drew Womens Blush Diamante Slip On Shoe',
      price: 2599,
      main_image: '/assets/12552_2_B02.20240226000125.jpg'
    },
    {
      id: 5,
      name: 'Drew Womens Navy Diamante Slip On Shoe',
      price: 1299,
      main_image: '/assets/125098_2_B02.20240229000136.jpg'
    },
    {
      id: 6,
      name: 'Weaver Mens Navy Lace Up Trainer',
      price: 2799,
      main_image: '/assets/image (5).png'
    },
    {
      id: 7,
      name: 'Weaver Mens White Lace Up Trainer',
      price: 2259,
      main_image: '/assets/830166_2_B02.20240925000409.jpg'
    },
    {
      id: 8,
      name: 'Calista Girls Pink Daisy Print Sandal',
      price: 2899,
      main_image: '/assets/292091_2_B02.20240807000251.jpg'
    },
    {
      id: 9,
      name: 'Colby Boys Blue Dinosaur Canvas',
      price: 3299,
      main_image: '/assets/20741_2_B02.20240304000134.jpg'
    }
  ];

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/?trending=true')
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Sort or pick the 8 specific products
          setTrendingProducts(res.data.slice(0, 8));
        } else {
          setTrendingProducts(fallbackTrending);
        }
      })
      .catch(() => {
        setTrendingProducts(fallbackTrending);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      {/* 1. Hero Carousel Banner */}
      <section className="container" style={{ marginTop: '22px' }}>
        <div 
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}
        >
          <img 
            src="/assets/hero_banner_kids.png" 
            alt="Flat 50% Sale Kids Shoes" 
            style={{ width: '100%', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
          />
          {/* Overlay CTA */}
          <div style={{ position: 'absolute', bottom: '24px', left: '40px' }}>
            <Link
              to="/products?category=kids"
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                fontFamily: 'serif',
                fontSize: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                display: 'inline-block'
              }}
            >
              Shop Now
            </Link>
          </div>

          {/* Dots Indicator */}
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #334155' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid #ffffff' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid #ffffff' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid #ffffff' }}></span>
          </div>
        </div>
      </section>

      {/* 2. Overview Section */}
      <section className="container" style={{ textAlign: 'center', marginTop: '48px', marginBottom: '40px', maxWidth: '1020px' }}>
        <h2 
          className="serif-font" 
          style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}
        >
          Overview
        </h2>
        <p style={{ fontSize: '15.5px', color: '#1e293b', lineHeight: '1.7', fontFamily: 'serif' }}>
          "Explore our curated selection of high-quality shoes for every occasion. From durable athletic shoes designed for peak performance to stylish casual sneakers and elegant dress shoes, we offer a diverse range of footwear to suit your needs. Our user-friendly interface makes it easy to browse our collection and find the perfect pair, while detailed product descriptions and high-quality images ensure you make an informed decision. Join our community of style and discover your next favorite shoe!"
        </p>
      </section>

      {/* 3. What are you looking for? Section */}
      <section className="container" style={{ textAlign: 'center', marginTop: '40px', marginBottom: '60px' }}>
        <h2 
          className="serif-font" 
          style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '32px' }}
        >
          What are you looking for?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          
          {/* Mens */}
          <Link to="/products?category=mens" style={{ textAlign: 'center', textDecoration: 'none' }}>
            <div 
              style={{ 
                borderRadius: '18px', 
                overflow: 'hidden', 
                aspectRatio: '1 / 1.05', 
                backgroundColor: '#f1f5f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '14px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src="/assets/image.png" alt="Mens" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Mens</h3>
          </Link>

          {/* Womens */}
          <Link to="/products?category=womens" style={{ textAlign: 'center', textDecoration: 'none' }}>
            <div 
              style={{ 
                borderRadius: '18px', 
                overflow: 'hidden', 
                aspectRatio: '1 / 1.05', 
                backgroundColor: '#f1f5f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '14px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src="/assets/image (2).png" alt="Womens" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Womens</h3>
          </Link>

          {/* Kids */}
          <Link to="/products?category=kids" style={{ textAlign: 'center', textDecoration: 'none' }}>
            <div 
              style={{ 
                borderRadius: '18px', 
                overflow: 'hidden', 
                aspectRatio: '1 / 1.05', 
                backgroundColor: '#f1f5f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '14px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src="/assets/image (3).png" alt="Kids" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Kids</h3>
          </Link>

        </div>
      </section>

      {/* 4. New & Trending Section */}
      <section className="container" style={{ marginTop: '50px', marginBottom: '40px' }}>
        <h2 
          className="serif-font" 
          style={{ textAlign: 'center', fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '36px' }}
        >
          New & Trending
        </h2>

        {/* 8 Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px 24px', marginBottom: '30px' }}>
          {(trendingProducts.length > 0 ? trendingProducts : fallbackTrending).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Link
            to="/products"
            style={{
              backgroundColor: '#234d4e',
              color: '#ffffff',
              padding: '10px 28px',
              borderRadius: '6px',
              fontFamily: 'serif',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            View all
          </Link>
        </div>
      </section>

      {/* 5. Promotional Banner */}
      <section className="container" style={{ marginTop: '40px', marginBottom: '20px' }}>
        <div 
          style={{
            backgroundColor: '#2b5050',
            color: '#ffffff',
            padding: '18px 24px',
            textAlign: 'center',
            fontSize: '22px',
            fontFamily: 'serif',
            fontWeight: '600',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '28px' }}>🎁</span>
          <span>Get your first order with free gift</span>
          <span style={{ fontSize: '28px' }}>🎁</span>
          <span>& 50 % offer 🪙</span>
        </div>
      </section>
    </div>
  );
}
