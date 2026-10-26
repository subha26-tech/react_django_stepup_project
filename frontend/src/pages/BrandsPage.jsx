import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandsPage() {
  const brandGroups = [
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
  ];

  return (
    <div className="fade-in container" style={{ maxWidth: '1100px', marginTop: '40px', marginBottom: '80px' }}>
      <h1 className="serif-font" style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '40px' }}>
        All Brands A-Z
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '36px 30px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        {brandGroups.map((group, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1f4747', borderBottom: '2px solid #1f4747', paddingBottom: '4px', marginBottom: '12px' }}>
              {group.letter}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {group.items.map((bName, bIdx) => (
                <li key={bIdx}>
                  <Link
                    to={`/products?brand=${encodeURIComponent(bName)}`}
                    style={{ fontSize: '15px', color: '#334155', transition: 'color 0.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#1f4747'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#334155'}
                  >
                    {bName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
