import React from 'react';

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ position: 'relative', overflowX: 'hidden', paddingBottom: '60px' }}>
      
      {/* Decorative Side Graphic on Right Edge */}
      <div 
        style={{
          position: 'absolute',
          right: '-50px',
          top: '20px',
          width: '380px',
          height: '740px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <img 
          src="/assets/about_side_banner.png" 
          alt="Decorative Sneaker Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'right' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', marginTop: '36px' }}>
        
        {/* About StepUp Section */}
        <section style={{ textAlign: 'center', marginBottom: '48px', paddingRight: '40px' }}>
          <h1 className="serif-font" style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '18px' }}>
            About StepUp
          </h1>
          <p style={{ fontSize: '15.5px', color: '#1e293b', lineHeight: '1.7', fontFamily: 'serif', maxWidth: '820px', margin: '0 auto' }}>
            StepUp is India's largest sports and athleisure footwear brand. Incorporated in 2006, StepUp Activewear is one of the leading players in organized sports & casual footwear sector in India. Since 2016, the flagship brand "StepUp", has been the largest sports and athleisure footwear brand in India, in both volume and value terms. The company's products are available via an expansive Pan-India network of over 15,000 geo-tagged multi-brand retail stores, 35+ company-owned exclusive outlets, large format stores such as Walmart, Vishal Retail and Reliance Smart among others and all the leading e-commerce portals.
          </p>
        </section>

        {/* Our Mission Section */}
        <section style={{ textAlign: 'center', marginBottom: '50px', paddingRight: '40px' }}>
          <h2 className="serif-font" style={{ fontSize: '30px', fontWeight: '700', color: '#0f172a', marginBottom: '18px' }}>
            Our Mission
          </h2>
          <p style={{ fontSize: '15.5px', color: '#1e293b', lineHeight: '1.7', fontFamily: 'serif', maxWidth: '800px', margin: '0 auto' }}>
            At StepUp we craft shoes with care for everyone- men, women and kids, with an equal attention to detail, letting each shoe speak for itself. The world-class quality, trendy designs and affordable prices have captured the imagination of millions of people, across the country- making StepUp, an aspirational brand especially for - young adults, everyday performers and fashionistas.
          </p>
        </section>

        {/* Center Circular Graphic */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
          <div 
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
              backgroundColor: '#ffffff'
            }}
          >
            <img 
              src="/assets/about_shoes_circle.png" 
              alt="Metallic Shoes" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/assets/image (3).png'; }}
            />
          </div>
        </div>

        {/* 3 Pillars Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}>
          
          {/* Pillar 1 */}
          <div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Simplicity In Design
            </h3>
            <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.6', fontFamily: 'serif' }}>
              No flashy logos,No senseless details, Just the world's most comfortable shoes,made naturally and designed practically,It's that simple.
            </p>
          </div>

          {/* Pillar 2 */}
          <div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Confidance in Comfort
            </h3>
            <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.6', fontFamily: 'serif' }}>
              Trying is believing.Give our shoes a shot for 30 days.and if you're not walking on cloud nine,we'll take them back-no questions asked.
            </p>
          </div>

          {/* Pillar 3 */}
          <div>
            <h3 className="serif-font" style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Made from Nature
            </h3>
            <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: '1.6', fontFamily: 'serif' }}>
              The footwear industry often overlooks mother Nature's materials in favor of cheaper,synthetic alternatives.We think it's time to change that.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}
