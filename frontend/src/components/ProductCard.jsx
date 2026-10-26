import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  // Split name to display nicely with title and subtitle like in Home page.png
  const nameParts = product.name.split(' ');
  const title = product.name;
  const priceFormatted = Number(product.price).toLocaleString('en-IN');

  return (
    <Link 
      to={`/product/${product.id}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        textDecoration: 'none',
        color: '#0f172a',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image Container with rounded borders */}
      <div 
        style={{
          width: '100%',
          aspectRatio: '1 / 1.05',
          backgroundColor: '#f1f5f9',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '16px',
          marginBottom: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        <img 
          src={product.main_image} 
          alt={product.name}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain' 
          }}
          onError={(e) => {
            e.currentTarget.src = '/assets/image (4).png';
          }}
        />
      </div>

      {/* Product Details */}
      <div style={{ maxWidth: '220px' }}>
        <h3 
          className="serif-font" 
          style={{ 
            fontSize: '14.5px', 
            fontWeight: '600', 
            color: '#1e293b', 
            lineHeight: '1.35', 
            marginBottom: '4px' 
          }}
        >
          {title}
        </h3>
        <p 
          style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#1e293b', 
            marginTop: '2px' 
          }}
        >
          MRP : ₹ {priceFormatted}
        </p>
      </div>
    </Link>
  );
}
