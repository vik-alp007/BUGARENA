import React, { useState } from 'react';
import { ShoppingCart, Tag, RefreshCw, Calculator, Check, AlertCircle } from 'lucide-react';

export const SimCartCalculator = ({ onLogEvent }) => {
  const [items, setItems] = useState([
    { id: 1, name: 'Cyberpunk Arena Hoodie', price: 50, qty: 1 },
    { id: 2, name: 'Hardware Bus Pirate Kit', price: 30, qty: 1 }
  ]);
  const [couponCode, setCouponCode] = useState('BUG20');
  const [couponApplied, setCouponApplied] = useState(false);
  const [useCorrectFormula, setUseCorrectFormula] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 10;
  const taxRate = 0.10; // 10%

  // Calculate pricing breakdown
  let discount = 0;
  let tax = 0;
  let finalTotal = 0;

  if (useCorrectFormula) {
    // CORRECT FORMULA:
    // 1. Discount = 20% of Subtotal
    discount = couponApplied ? subtotal * 0.20 : 0;
    // 2. Tax = 10% of discounted subtotal
    tax = (subtotal - discount) * taxRate;
    // 3. Total = (subtotal - discount) + tax + shipping
    finalTotal = (subtotal - discount) + tax + shipping;
  } else {
    // INTENTIONAL REPRODUCIBLE BUG:
    // 1. Discount is applied AFTER adding shipping: (Subtotal + Shipping) * 0.20
    discount = couponApplied ? (subtotal + shipping) * 0.20 : 0;
    // 2. Tax is calculated against the original unreduced subtotal ($80 * 0.10 = $8.00)
    tax = subtotal * taxRate;
    // 3. Final total computation adds double shipping or misordered terms
    finalTotal = (subtotal + shipping) - discount + tax;
  }

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'BUG20') {
      setCouponApplied(true);
      onLogEvent?.({
        type: 'COUPON_APPLIED',
        code: 'BUG20',
        formula: useCorrectFormula ? 'Standard eCommerce Spec' : 'Buggy Order of Operations Formula',
        computedDiscount: discount,
        computedTotal: finalTotal
      });
    } else {
      alert('Invalid code. Use "BUG20" for 20% off.');
    }
  };

  const handleReset = () => {
    setCouponApplied(false);
    setCouponCode('BUG20');
    setItems([
      { id: 1, name: 'Cyberpunk Arena Hoodie', price: 50, qty: 1 },
      { id: 2, name: 'Hardware Bus Pirate Kit', price: 30, qty: 1 }
    ]);
    onLogEvent?.({ type: 'RESET_STATE', message: 'Cart reinitialized.' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Formula Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid var(--border-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          <Calculator size={16} color="#00f0ff" />
          Checkout Formula: <strong style={{ color: useCorrectFormula ? '#10b981' : '#f43f5e' }}>
            {useCorrectFormula ? 'Standard Tax & Discount Formula (Fixed)' : 'Live Flawed Invoicing Engine (Buggy)'}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useCorrectFormula}
              onChange={(e) => setUseCorrectFormula(e.target.checked)}
            />
            Inspect with Corrected Math
          </label>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Reset Cart
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Cart Items */}
        <div style={{
          padding: '1.25rem',
          background: '#0a0f22',
          borderRadius: '10px',
          border: '1px solid var(--border-dim)'
        }}>
          <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} color="#00f0ff" />
            Hackathon Swag Cart
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: '#0d1326',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00f0ff' }}>
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tag size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Promo Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.2rem', textTransform: 'uppercase' }}
                disabled={couponApplied}
              />
            </div>
            <button
              onClick={applyCoupon}
              className="btn btn-primary btn-sm"
              disabled={couponApplied}
            >
              {couponApplied ? 'Applied ✓' : 'Apply (BUG20)'}
            </button>
          </div>
        </div>

        {/* Invoice Summary */}
        <div style={{
          padding: '1.25rem',
          background: '#0c1224',
          borderRadius: '10px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1rem' }}>Invoice Breakdown</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>${subtotal.toFixed(2)}</span>
              </div>

              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Promo Discount (BUG20)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Standard Shipping</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>${shipping.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Estimated Sales Tax (10%)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>${tax.toFixed(2)}</span>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Total Due</span>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#00f0ff'
                }}>
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            Check the math: Should a 20% coupon discount shipping fees too, and should tax be charged on the undiscounted total?
          </div>
        </div>
      </div>
    </div>
  );
};
