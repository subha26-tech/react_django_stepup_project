import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import FilterToolbar from '../components/FilterToolbar';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const style = searchParams.get('style') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const isOffer = searchParams.get('offer') || '';
  const isNew = searchParams.get('new') || '';

  const currentFilters = {
    category,
    search,
    brand,
    style,
    size,
    color
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (brand) params.append('brand', brand);
    if (style) params.append('style', style);
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    if (isOffer) params.append('offer', isOffer);
    if (isNew) params.append('new', isNew);

    axios.get(`http://127.0.0.1:8000/api/products/?${params.toString()}`)
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [category, search, brand, style, size, color, isOffer, isNew]);

  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (filterType === 'reset') {
      newParams.delete('style');
      newParams.delete('size');
      newParams.delete('brand');
      newParams.delete('color');
    } else if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    setSearchParams(newParams);
  };

  const getPageTitle = () => {
    if (search) return `Search Results for "${search}"`;
    if (category) return `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
    if (brand) return `${brand} Footwear`;
    if (isOffer) return `Special Offers & Clearance`;
    return 'All Footwear Collection';
  };

  return (
    <div className="fade-in">
      {/* Filters Toolbar Bar matching Filters.png */}
      <FilterToolbar onFilterChange={handleFilterChange} currentFilters={currentFilters} />

      <div className="container" style={{ marginTop: '36px', marginBottom: '80px' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="serif-font" style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
            {getPageTitle()}
          </h1>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {products.length} products
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '16px', color: '#64748b' }}>
            Loading collection...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#334155', marginBottom: '16px' }}>No products found matching the criteria.</p>
            <button
              onClick={() => setSearchParams({})}
              style={{
                backgroundColor: '#1f4747',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px 24px' }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
