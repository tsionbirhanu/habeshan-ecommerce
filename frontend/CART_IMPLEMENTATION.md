# Cart Page Implementation Guide

## Overview

This is a fully-functional e-commerce cart page with:

- **Multi-language support** (German, English, Amharic)
- **2-column responsive layout** (65% items, 35% summary on desktop)
- **Real-time price calculations** with VAT and shipping
- **Coupon validation** with discount support
- **Free shipping progress bar**
- **Cart validation** on page load
- **Optimistic updates** for better UX

## File Structure

```
frontend/
├── app/(shop)/cart/page.tsx                 # Main cart page
├── components/cart/
│   ├── CartItem.tsx                         # Individual cart item component
│   ├── CouponSection.tsx                    # Coupon application UI
│   ├── OrderSummary.tsx                     # Order summary sidebar
│   └── index.ts                             # Barrel export
├── lib/cart/
│   └── cartUtils.ts                         # Utility functions & constants
└── lib/stores/
    └── cart.store.ts                        # Zustand cart store
```

## Key Features

### 1. Cart Item Component (CartItem.tsx)

- Displays product image (80px, maroon border on hover)
- Shows product name and category label
- Quantity selector with +/- buttons
- Line total calculation
- Remove button (×)
- Fully responsive

### 2. Coupon Section (CouponSection.tsx)

- Input field for coupon code
- Apply/Remove buttons
- Error/success messages
- Support for percentage and fixed discounts
- Validates coupon before applying

### 3. Order Summary (OrderSummary.tsx)

- Price breakdown:
  - Subtotal
  - Estimated shipping (free over €50)
  - VAT (19% for Germany)
  - Discount from coupon
  - **Total**
- Free shipping progress bar
- Checkout button (links to /checkout)
- Payment method icons (Stripe, PayPal, Klarna)
- SSL secure badge

### 4. Cart Utilities (cartUtils.ts)

Constants:

- FREE_SHIPPING_THRESHOLD = €50
- SHIPPING_COST = €5.99
- TAX_RATE = 0.19 (19% VAT)

Functions:

- `calculateShipping()` - Determines shipping cost
- `calculateTax()` - Calculates VAT
- `calculatePriceBreakdown()` - Complete price calculation
- `formatPrice()` - Currency formatting (€)
- `calculateShippingProgress()` - Progress bar percentage
- `formatDiscount()` - Discount amount calculation

## API Endpoints Used

### Cart Operations

- **GET /api/cart** - Fetch current cart
- **POST /api/cart/add** - Add item to cart
- **PUT /api/cart/items/:id** - Update item quantity
- **DELETE /api/cart/items/:id** - Remove item from cart
- **POST /api/cart/validate** - Validate cart items availability
- **DELETE /api/cart** - Clear entire cart

### Coupon Validation

- **POST /api/coupons/validate** - Validate coupon code

## Language Support

All text is localized in German (primary) with English and Amharic fallbacks:

```
German (de):
- "Dein Warenkorb" (Your Cart)
- "Bestellübersicht" (Order Summary)
- "Zur Kasse" (Proceed to Checkout)
- etc.

English (en):
- "Your Cart"
- "Order Summary"
- "Proceed to Checkout"
- etc.
```

## Mobile Responsiveness

### Desktop (≥1024px)

- 2-column layout with proper spacing
- Sticky order summary sidebar
- Full product images

### Mobile (<1024px)

- Single column stacked layout
- Order summary below items
- Touch-friendly buttons and inputs
- Quantity selector optimized for mobile

## User Experience Features

### Optimistic Updates

- Cart updates immediately on user action
- Quantity changes reflected without wait
- Item removal instant
- API call happens in background

### Validation

- Cart validated on page load
- Shows warning if items unavailable
- Coupon validation before applying
- Minimum order checks for coupons

### Error Handling

- User-friendly error messages
- Graceful fallbacks if API fails
- Toast notifications for actions
- Page reload on critical errors

### Trust Signals

- 🔒 SSL secure badge
- Payment method icons
- Clear pricing breakdown
- Free shipping indicator

## Testing Checklist

### Basic Functionality

- [ ] Add items to cart
- [ ] View cart page
- [ ] Update item quantities
- [ ] Remove items
- [ ] Apply valid coupon
- [ ] Remove coupon
- [ ] Empty cart state
- [ ] Continue shopping link

### Calculations

- [ ] Subtotal correct
- [ ] Shipping cost correct (€5.99 or free)
- [ ] Tax calculated correctly (19%)
- [ ] Discount applied correctly
- [ ] Total = Subtotal + Shipping + Tax - Discount

### Mobile

- [ ] Layout stacks on mobile
- [ ] Buttons are touch-friendly
- [ ] Images load properly
- [ ] Quantity selector works
- [ ] Order summary readable

### Localization

- [ ] German text displays correctly
- [ ] English text displays correctly
- [ ] Numbers format correctly (€X.XX)
- [ ] Language switching works

### Edge Cases

- [ ] Empty cart message shows
- [ ] Zero quantity handled correctly
- [ ] Expired coupons rejected
- [ ] Out of stock items warning
- [ ] Network errors handled gracefully

## Performance Considerations

- **Lazy loading**: Images use Next.js Image component
- **Memoization**: Components use React.memo where appropriate
- **Debouncing**: Quantity changes debounced to API
- **Caching**: Cart store persisted to localStorage
- **Code splitting**: Cart components loaded on demand

## Future Enhancements

- [ ] Bulk discount tiers
- [ ] Gift wrapping options
- [ ] Saved cart from previous sessions
- [ ] Quick reorder from order history
- [ ] Cart sharing via link
- [ ] Abandoned cart recovery
- [ ] Cart notes/special instructions
- [ ] Product recommendations based on cart

## Troubleshooting

### Cart not loading

- Check API endpoints are correct
- Verify authentication if required
- Check browser console for errors

### Coupon not applying

- Verify coupon code is valid
- Check minimum order requirement
- Ensure coupon hasn't expired
- Check coupon is for this store

### Price calculations wrong

- Verify TAX_RATE constant (19% for Germany)
- Check SHIPPING_COST and FREE_SHIPPING_THRESHOLD
- Ensure discount is calculated for correct subtotal

### Mobile layout broken

- Clear browser cache
- Check Tailwind config for breakpoints
- Verify grid classes are correct
- Test in actual mobile device
