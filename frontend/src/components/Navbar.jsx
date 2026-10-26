import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, ArrowLeft, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isHome = location.pathname === '/';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setActiveDropdown(null);
    }
  };

  const megaMenus = {
    mens: {
      title: 'Mens',
      columns: [
        { title: 'New Arrivals', items: [{ label: 'View all', filter: 'mens' }] },
        { title: 'Sandals', items: [
          { label: 'View all', filter: 'mens' },
          { label: 'Flip Flop', filter: 'mens&style=Flip Flop' },
          { label: 'Mule', filter: 'mens&style=Mule' },
          { label: 'Slider', filter: 'mens&style=Slider' },
          { label: 'Sport', filter: 'mens&style=Sport' }
        ]},
        { title: 'Trainers', items: [
          { label: 'View all', filter: 'mens&style=Trainers' },
          { label: 'Easy Fasten', filter: 'mens&style=Trainers' }
        ]},
        { title: 'Canvas', items: [
          { label: 'View all', filter: 'mens&style=Canvas' },
          { label: 'Lace Up', filter: 'mens&style=Canvas' },
          { label: 'Slip On', filter: 'mens&style=Canvas' }
        ]},
        { title: 'Shoes', items: [
          { label: 'View all', filter: 'mens' },
          { label: 'Brogue', filter: 'mens&style=Brogue' },
          { label: 'Causal', filter: 'mens&style=Casual' },
          { label: 'Easy Fasten', filter: 'mens&style=Easy' },
          { label: 'Lace up', filter: 'mens&style=Lace' },
          { label: 'Leather', filter: 'mens&style=Leather' },
          { label: 'Loafer', filter: 'mens&style=Loafer' },
          { label: 'Oxford', filter: 'mens&style=Oxford' }
        ]},
        { title: 'Safety Footwear', items: [
          { label: 'View all', filter: 'mens&style=Safety' },
          { label: 'Boots', filter: 'mens&style=Boots' },
          { label: 'Shoes', filter: 'mens&style=Safety' },
          { label: 'Steel toe cap', filter: 'mens&style=Steel' },
          { label: 'Trainers', filter: 'mens&style=Trainers' }
        ]},
        { title: 'Boots', items: [
          { label: 'View all', filter: 'mens&style=Boots' },
          { label: 'Ankle', filter: 'mens&style=Ankle' },
          { label: 'Chelsa', filter: 'mens&style=Chelsea' },
          { label: 'Desert', filter: 'mens&style=Desert' },
          { label: 'Lace up', filter: 'mens&style=Lace' },
          { label: 'Leather', filter: 'mens&style=Leather' },
          { label: 'Pull on', filter: 'mens&style=Pull' }
        ]},
        { title: 'Slippers', items: [
          { label: 'View all', filter: 'mens&style=Slippers' },
          { label: 'Full', filter: 'mens&style=Slippers' },
          { label: 'Moccasin', filter: 'mens&style=Moccasin' },
          { label: 'Mule', filter: 'mens&style=Mule' }
        ]}
      ]
    },
    womens: {
      title: 'Womens',
      columns: [
        { title: 'New Arrivals', items: [{ label: 'View all', filter: 'womens' }] },
        { title: 'Sandals', items: [
          { label: 'View all', filter: 'womens&style=Sandals' },
          { label: 'Flat', filter: 'womens&style=Flat' },
          { label: 'Flip Flop', filter: 'womens&style=Flip' },
          { label: 'Slider', filter: 'womens&style=Slider' },
          { label: 'Strappy', filter: 'womens&style=Strappy' }
        ]},
        { title: 'Trainers', items: [
          { label: 'View all', filter: 'womens&style=Trainers' },
          { label: 'Chunky', filter: 'womens&style=Chunky' },
          { label: 'Lace Up', filter: 'womens&style=Lace' },
          { label: 'Slip On', filter: 'womens&style=Slip On' }
        ]},
        { title: 'Canvas', items: [
          { label: 'View all', filter: 'womens&style=Canvas' },
          { label: 'Lace Up', filter: 'womens&style=Canvas' },
          { label: 'Slip On', filter: 'womens&style=Canvas' }
        ]},
        { title: 'Shoes', items: [
          { label: 'View all', filter: 'womens' },
          { label: 'Ballerina', filter: 'womens&style=Ballerina' },
          { label: 'Brogue', filter: 'womens&style=Brogue' },
          { label: 'Flat', filter: 'womens&style=Flat' },
          { label: 'Heel', filter: 'womens&style=Heel' },
          { label: 'Leather', filter: 'womens&style=Leather' },
          { label: 'Party', filter: 'womens&style=Party' },
          { label: 'School', filter: 'womens&style=School' }
        ]},
        { title: 'Safety Footwear', items: [
          { label: 'View all', filter: 'womens&style=Safety' }
        ]},
        { title: 'Boots', items: [
          { label: 'View all', filter: 'womens&style=Boots' },
          { label: 'Ankle', filter: 'womens&style=Ankle' },
          { label: 'Biker', filter: 'womens&style=Biker' },
          { label: 'Heel', filter: 'womens&style=Heel' },
          { label: 'Knee', filter: 'womens&style=Knee' },
          { label: 'High', filter: 'womens&style=High' },
          { label: 'Lace up', filter: 'womens&style=Lace' },
          { label: 'Leather', filter: 'womens&style=Leather' }
        ]},
        { title: 'Slippers', items: [
          { label: 'View all', filter: 'womens&style=Slippers' },
          { label: 'Easy Fasten', filter: 'womens&style=Slippers' },
          { label: 'Full', filter: 'womens&style=Full' },
          { label: 'Moccasin', filter: 'womens&style=Moccasin' },
          { label: 'Mule', filter: 'womens&style=Mule' },
          { label: 'Slipper Boots', filter: 'womens&style=Boots' }
        ]}
      ]
    },
    kids: {
      title: 'Kids',
      columns: [
        { title: 'Girls', items: [
          { label: 'View all', filter: 'kids' },
          { label: 'Sandals', filter: 'kids&style=Sandals' },
          { label: 'Canvas', filter: 'kids&style=Canvas' },
          { label: 'Trainers', filter: 'kids&style=Trainers' },
          { label: 'Shoes', filter: 'kids&style=Shoes' },
          { label: 'Boots', filter: 'kids&style=Boots' },
          { label: 'Wellies', filter: 'kids&style=Wellies' },
          { label: 'Slippers', filter: 'kids&style=Slippers' }
        ]},
        { title: 'Girls Trending', items: [
          { label: 'Save', filter: 'kids&offer=true' },
          { label: 'New arrivals', filter: 'kids&new=true' },
          { label: 'Character footwear', filter: 'kids&style=Character' },
          { label: 'Online exclusive', filter: 'kids' },
          { label: 'Back to school', filter: 'kids&style=School' }
        ]},
        { title: 'Back to schools', items: [
          { label: 'View all', filter: 'kids&style=School' },
          { label: 'Girls school shoes', filter: 'kids&style=School' },
          { label: 'Boys school shoes', filter: 'kids&style=School' }
        ]},
        { title: 'Canvas', items: [
          { label: 'View all', filter: 'kids&style=Canvas' },
          { label: 'Lace Up', filter: 'kids&style=Canvas' },
          { label: 'Slip On', filter: 'kids&style=Canvas' }
        ]},
        { title: 'Boys', items: [
          { label: 'View all', filter: 'kids' },
          { label: 'Sandals', filter: 'kids&style=Sandals' },
          { label: 'Canvas', filter: 'kids&style=Canvas' },
          { label: 'Trainers', filter: 'kids&style=Trainers' },
          { label: 'Shoes', filter: 'kids&style=Shoes' },
          { label: 'Boots', filter: 'kids&style=Boots' },
          { label: 'Wellies', filter: 'kids&style=Wellies' },
          { label: 'Slippers', filter: 'kids&style=Slippers' }
        ]},
        { title: 'Safety Footwear', items: [
          { label: 'View all', filter: 'kids' }
        ]},
        { title: 'Boys Trending', items: [
          { label: 'SAVE', filter: 'kids&offer=true' },
          { label: 'New arrivals', filter: 'kids&new=true' },
          { label: 'Character exclusive', filter: 'kids&style=Character' },
          { label: 'Online exclusive', filter: 'kids' },
          { label: 'Back to school', filter: 'kids&style=School' }
        ]},
        { title: 'Slippers', items: [
          { label: 'Boys slippers', filter: 'kids&style=Slippers' },
          { label: 'Girls slippers', filter: 'kids&style=Slippers' }
        ]}
      ]
    },
    brands: {
      title: 'Brands',
      groups: [
        { letter: 'B', items: ['Barbie', 'Beckett', 'Bluey'] },
        { letter: 'C', items: ['Comfort Plus', 'Comfy steps', 'Crocs', 'Cushion Walk'] },
        { letter: 'D', items: ['Disney frozen', 'Disney stitch', 'Divaz', 'Dunlop'] },
        { letter: 'E', items: ['EarthWorks'] },
        { letter: 'G', items: ['Gabbys Dollhouse'] },
        { letter: 'H', items: ['Heart', 'Heavenly feet', 'Hobos', 'Hush puppies'] },
        { letter: 'J', items: ['Jo& Joe', 'JuJu'] },
        { letter: 'K', items: ['Kickers', 'Krush'] },
        { letter: 'L', items: ['Lambretta', 'Lilley', 'LoL', 'Lotus', 'Lunar'] },
        { letter: 'M', items: ['Marco', 'Lozzi', 'Marvel', 'Maya', 'grace'] },
        { letter: 'O', items: ['Original penguin', 'Osaga'] },
        { letter: 'P', items: ['Paw patrol', 'Pokemon'] },
        { letter: 'R', items: ['Red fish', 'Red level', 'Regatta', 'Rieker', 'Rocket Dog'] },
        { letter: 'S', items: ['Skechers', 'Soft line', 'Softlites', 'Spider-man', 'Stone creek', 'Super mario'] },
        { letter: 'T', items: ['Totes isotoner', 'Trespass', 'Truffle', 'Trux'] },
        { letter: 'U', items: ['Umbro'] },
        { letter: 'W', items: ['Walkright', 'Wednesday', 'Wrangler'] },
        { letter: 'X', items: ['XL'] }
      ]
    },
    offers: {
      title: 'Offers',
      items: [
        { label: 'SAVE', path: '/offers?type=save' },
        { label: 'Two pairs for thousand', path: '/offers?type=two-pairs' },
        { label: 'Clerance Outlet', path: '/offers?type=clearance' },
        { label: 'Boots Sale', path: '/offers?type=boots' },
        { label: 'View all offers', path: '/offers' }
      ]
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#ffffff' }}>
      {/* 1. Top Green Header Bar */}
      <div style={{ backgroundColor: '#1f4747', padding: '10px 0', color: '#ffffff' }}>
        <div className="container navbar-top-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/assets/stepup_logo.png" 
              alt="StepUp Logo" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain' }} 
            />
          </Link>

          {/* Search Bar */}
          <form 
            className="navbar-search"
            onSubmit={handleSearchSubmit} 
            style={{ 
              flex: '1', 
              maxWidth: '460px', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <div style={{ position: 'absolute', left: '16px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '14px',
                color: '#1e293b',
                backgroundColor: '#ffffff'
              }}
            />
          </form>

          {/* Top Right Navigation */}
          <nav className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: '500' }}>
            {!user?.is_staff && (
              <>
                <Link
                  to="/"
                  style={{
                    color: location.pathname === '/' ? '#f87171' : '#ffffff',
                    transition: 'color 0.2s'
                  }}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  style={{
                    color: location.pathname === '/about' ? '#f87171' : '#ffffff',
                    transition: 'color 0.2s'
                  }}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  style={{
                    color: location.pathname === '/contact' ? '#f87171' : '#ffffff',
                    transition: 'color 0.2s'
                  }}
                >
                  Contact Us
                </Link>
              </>
            )}
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {user.is_staff && (
                  <>
                    <Link
                      to="/admin"
                      style={{
                        color: location.pathname === '/admin' ? '#fde047' : '#ffffff',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/orders"
                      style={{
                        color: location.pathname === '/admin/orders' ? '#fde047' : '#ffffff',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      Manage Orders
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: location.pathname === '/profile' ? '#fde047' : '#fef08a',
                    fontWeight: '600', fontSize: '14px'
                  }}
                >
                  <User size={15} />
                  Hi, {user.name}
                </Link>
                
              </div>
            ) : (
              <Link 
                to="/login" 
                style={{ 
                  color: location.pathname === '/login' ? '#f87171' : '#ffffff',
                  transition: 'color 0.2s'
                }}
              >
                Log in
              </Link>
            )}

            {/* Cart Link with Badge */}
            {!user?.is_staff && (
              <Link
                to="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ffffff',
                  position: 'relative'
                }}
              >
                <span>Cart</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart size={20} color="#ffffff" />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-10px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {cartCount}
                  </span>
                </div>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* 2. Brand Name Title Header */}
      <div className="container" style={{ textAlign: 'center', position: 'relative', paddingTop: '18px', paddingBottom: '14px' }}>
        {!isHome && (
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              position: 'absolute', 
              left: '20px', 
              top: '22px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontWeight: '600', 
              fontSize: '15px', 
              color: '#0f172a' 
            }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        )}
        <h1 
          className="serif-font" 
          style={{ 
            fontSize: '36px', 
            fontWeight: '600', 
            letterSpacing: '0.5px',
            color: '#111827'
          }}
        >
          <Link to="/">StepUp.in</Link>
        </h1>
      </div>

      {!user?.is_staff && (
        <>
          <div className="container" style={{ borderBottom: '1px solid #1e293b' }}></div>

          {/* 3. Secondary Category Nav */}
          <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #1e293b', 
          position: 'relative' 
        }}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div 
          className="container navbar-category-links" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '50px', 
            padding: '12px 0', 
            fontSize: '15px', 
            fontWeight: '500' 
          }}
        >
          {['Womens', 'Mens', 'Kids', 'Brands', 'Offers'].map((cat) => {
            const key = cat.toLowerCase();
            return (
              <div 
                key={cat} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setActiveDropdown(key)}
              >
                <Link
                  to={key === 'brands' ? '/brands' : key === 'offers' ? '/offers' : `/products?category=${key}`}
                  style={{
                    color: activeDropdown === key ? '#1f4747' : '#0f172a',
                    fontWeight: activeDropdown === key ? '700' : '500',
                    padding: '8px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setActiveDropdown(null)}
                >
                  {cat}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mega Menu Overlay */}
        {activeDropdown && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              width: '100%', 
              backgroundColor: '#ffffff', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)', 
              borderBottom: '2px solid #e2e8f0',
              zIndex: 999,
              padding: '28px 0 36px 0',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="container">
              {/* Category Columns (Mens / Womens / Kids) */}
              {['mens', 'womens', 'kids'].includes(activeDropdown) && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${megaMenus[activeDropdown].columns.length}, 1fr)`, gap: '24px' }}>
                  {megaMenus[activeDropdown].columns.map((col, idx) => (
                    <div key={idx}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: '#0f172a' }}>
                        {col.title}
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {col.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link 
                              to={`/products?category=${item.filter}`}
                              onClick={() => setActiveDropdown(null)}
                              style={{ 
                                fontSize: '13.5px', 
                                color: '#475569', 
                                transition: 'color 0.15s',
                                display: 'inline-block'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#1f4747'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Brands Grid (Alphabetical) */}
              {activeDropdown === 'brands' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '20px' }}>
                  {megaMenus.brands.groups.map((group, idx) => (
                    <div key={idx}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                        {group.letter}
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {group.items.map((brandName, bIdx) => (
                          <li key={bIdx}>
                            <Link
                              to={`/products?brand=${encodeURIComponent(brandName)}`}
                              onClick={() => setActiveDropdown(null)}
                              style={{ fontSize: '13px', color: '#475569', transition: 'color 0.15s' }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#1f4747'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
                            >
                              {brandName}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Offers List */}
              {activeDropdown === 'offers' && (
                <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {megaMenus.offers.items.map((offer, idx) => (
                      <Link
                        key={idx}
                        to={offer.path}
                        onClick={() => setActiveDropdown(null)}
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          fontFamily: 'serif',
                          color: '#0f172a',
                          padding: '8px',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {offer.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </header>
  );
}
