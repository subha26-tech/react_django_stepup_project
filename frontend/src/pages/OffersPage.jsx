import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const offerType = searchParams.get('type') || '';

  const offerCategories = [
    { label: 'SAVE - Up to 50% Off', key: 'save', desc: 'Huge discounts across summer & athletic footwear' },
    { label: 'Two pairs for thousand', key: 'two-pairs', desc: 'Mix & match comfort slip-ons and casuals' },
    { label: 'Clearance Outlet', key: 'clearance', desc: 'End of season exclusive clearance stock' },
    { label: 'Boots Sale', key: 'boots', desc: 'Premium leather & all-weather boots on limited deal' }
  ];

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/?trending=true`)
      .then(res => {
        setOfferProducts(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [offerType]);

  return (
    <div className="fade-in container" style={{ maxWidth: '1100px', marginTop: '36px', marginBottom: '80px' }}>
      
      {/* Hero Offer Banner */}
      <div 
        style={{
          backgroundColor: '#2b5050',
          color: '#ffffff',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '40px'
        }}
      >
        <span style={{ fontSize: '32px' }}>🎁</span>
        <h1 className="serif-font" style={{ fontSize: '32px', fontWeight: '700', marginTop: '10px', marginBottom: '8px' }}>
          Exclusive Special Offers & Discounts
        </h1>
        <p style={{ fontSize: '16px', color: '#e2e8f0' }}>
          Get your first order with free gift & up to 50% OFF!
        </p>
      </div>

      {/* Offer Categories Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {offerCategories.map(cat => (
          <Link
            key={cat.key}
            to={`/offers?type=${cat.key}`}
            style={{
              border: offerType === cat.key ? '2px solid #1f4747' : '1px solid #e2e8f0',
              backgroundColor: offerType === cat.key ? '#f0fdf4' : '#ffffff',
              padding: '16px',
              borderRadius: '6px',
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <h3 className="serif-font" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              {cat.label}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b' }}>{cat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Products under offer */}
      <h2 className="serif-font" style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>
        Featured Deals
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading offers...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px 24px' }}>
          {offerProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

    </div>
  );
}
