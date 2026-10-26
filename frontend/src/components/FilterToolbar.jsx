import React, { useState } from 'react';
import { ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FilterToolbar({ onFilterChange, currentFilters = {} }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filterOptions = {
    style: ['All Styles', 'Boat Shoe', 'Trainers', 'Heel', 'Slip On', 'Sandals', 'Canvas', 'Boots', 'Oxford', 'Loafer'],
    size: ['All Sizes', '28', '29', '30', '31', '32', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    brands: ['All Brands', 'Comfy Steps', 'Ophelia', 'Billie', 'Drew', 'Weaver', 'Calista', 'Colby', 'Skechers', 'Crocs', 'Clarks', 'Walkright'],
    color: ['All Colors', 'Tan', 'Black', 'Red', 'Silver', 'Blush Pink', 'Navy', 'White', 'Pink', 'Blue']
  };

  const handleSelect = (category, value) => {
    setActiveDropdown(null);
    if (value.startsWith('All ')) {
      onFilterChange(category, '');
    } else {
      onFilterChange(category, value);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)', padding: '14px 0', position: 'relative', zIndex: 40 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '17px',
            fontWeight: '600',
            fontFamily: 'serif',
            color: '#0f172a'
          }}
        >
          <span>Filters</span>
          {isOpen ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
        </button>

        {/* Dropdowns */}
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* Style Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#1e293b',
                  padding: '9px 24px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '140px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{currentFilters.style || 'Style'}</span>
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'style' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 50, maxHeight: '240px', overflowY: 'auto' }}>
                  {filterOptions.style.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelect('style', opt)}
                      style={{ padding: '8px 14px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: currentFilters.style === opt ? '#1f4747' : '#334155', fontWeight: currentFilters.style === opt ? '700' : '400' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Size Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#1e293b',
                  padding: '9px 24px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '130px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{currentFilters.size ? `Size: ${currentFilters.size}` : 'Size'}</span>
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'size' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', minWidth: '160px', zIndex: 50, maxHeight: '240px', overflowY: 'auto' }}>
                  {filterOptions.size.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelect('size', opt)}
                      style={{ padding: '8px 14px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: currentFilters.size === opt ? '#1f4747' : '#334155' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brands Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'brands' ? null : 'brands')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#1e293b',
                  padding: '9px 24px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '140px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{currentFilters.brand || 'Brands'}</span>
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'brands' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', minWidth: '180px', zIndex: 50, maxHeight: '240px', overflowY: 'auto' }}>
                  {filterOptions.brands.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelect('brand', opt)}
                      style={{ padding: '8px 14px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: currentFilters.brand === opt ? '#1f4747' : '#334155' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#1e293b',
                  padding: '9px 24px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '130px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{currentFilters.color || 'Color'}</span>
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'color' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', minWidth: '160px', zIndex: 50, maxHeight: '240px', overflowY: 'auto' }}>
                  {filterOptions.color.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelect('color', opt)}
                      style={{ padding: '8px 14px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: currentFilters.color === opt ? '#1f4747' : '#334155' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Button if any active */}
            {(currentFilters.style || currentFilters.size || currentFilters.brand || currentFilters.color) && (
              <button
                onClick={() => {
                  onFilterChange('reset', '');
                }}
                style={{ fontSize: '13px', color: '#ef4444', textDecoration: 'underline', fontWeight: '500' }}
              >
                Reset Filters
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
