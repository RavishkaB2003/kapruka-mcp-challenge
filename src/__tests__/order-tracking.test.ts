import { describe, it, expect } from 'vitest';
import { trackOrder, createOrder } from '../app/actions';

// We mock next/headers
import { vi } from 'vitest';
vi.mock('next/headers', () => ({
  headers: () => ({
    get: () => '127.0.0.1'
  })
}));

describe('order tracking verification', () => {
  it('requires phone verification for default ORD-MOCK-123', async () => {
    // 1. Calling without phone
    const res1 = await trackOrder('ORD-MOCK-123');
    expect(res1.verified).toBe(false);
    expect(res1.status).toBe('AWAITING_VERIFICATION');

    // 2. Calling with wrong phone
    const res2 = await trackOrder('ORD-MOCK-123', '0777777777');
    expect(res2.verified).toBe(false);
    expect(res2.status).toBe('VERIFICATION_FAILED');

    // 3. Calling with correct phone
    const res3 = await trackOrder('ORD-MOCK-123', '0771234567');
    expect(res3.verified).toBe(true);
    expect(res3.city).toBe('Colombo');
    expect(res3.status).toBe('prepared');
  });

  it('correctly tracks and resolves city for dynamically created orders', async () => {
    // Simulate order creation
    const orderParams = {
      cart: [{ product_id: 'MOCK_PRODUCT_1', quantity: 1 }],
      recipient: { name: 'Hasiya', address: '12 Galle Road', phone: '0779998887' },
      delivery: { city: 'Kandy', date: '2026-06-25', fee: 350 },
      sender: { name: 'John', phone: '0777654321', email: 'john@example.com' }
    };

    const newOrder = await createOrder(orderParams);
    expect(newOrder.orderNumber).toBeDefined();

    // 1. Verify tracking fails without phone
    const res1 = await trackOrder(newOrder.orderNumber);
    expect(res1.verified).toBe(false);
    expect(res1.status).toBe('AWAITING_VERIFICATION');

    // 2. Verify tracking fails with wrong phone
    const res2 = await trackOrder(newOrder.orderNumber, '0771112223');
    expect(res2.verified).toBe(false);
    expect(res2.status).toBe('VERIFICATION_FAILED');

    // 3. Verify tracking succeeds with correct phone and resolves the correct city (Kandy)
    const res3 = await trackOrder(newOrder.orderNumber, '0779998887');
    expect(res3.verified).toBe(true);
    expect(res3.city).toBe('Kandy');
    expect(res3.status).toBe('prepared');
  });

  it('correctly tracks and verifies the real Kapruka test order VPAY827982BA', async () => {
    // 1. Calling without phone
    const res1 = await trackOrder('VPAY827982BA');
    expect(res1.verified).toBe(false);
    expect(res1.status).toBe('AWAITING_VERIFICATION');

    // 2. Calling with wrong phone
    const res2 = await trackOrder('VPAY827982BA', '0777777777');
    expect(res2.verified).toBe(false);
    expect(res2.status).toBe('VERIFICATION_FAILED');

    // 3. Calling with correct local phone format
    const res3 = await trackOrder('VPAY827982BA', '0773517248');
    expect(res3.verified).toBe(true);
    expect(res3.city).toBe('POLGASOWITA');
    expect(res3.status).toBe('delivered');
    expect(res3.items).toBe('Flower Arrangement');

    // 4. Calling with correct country code format (+94)
    const res4 = await trackOrder('VPAY827982BA', '+94 77 351 7248');
    expect(res4.verified).toBe(true);
    expect(res4.city).toBe('POLGASOWITA');
    expect(res4.status).toBe('delivered');
    expect(res4.items).toBe('Flower Arrangement');
  });
});
