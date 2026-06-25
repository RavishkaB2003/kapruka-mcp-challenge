import { vi, describe, it, expect, beforeEach } from 'vitest';
import http from 'https';
import { EventEmitter } from 'events';

vi.mock('https', () => {
  const mockReq = {
    on: vi.fn().mockReturnThis(),
    write: vi.fn(),
    end: vi.fn()
  };
  return {
    default: {
      request: vi.fn().mockReturnValue(mockReq)
    },
    request: vi.fn().mockReturnValue(mockReq)
  };
});

describe('checkDelivery rate parsing regex', () => {
  let checkDelivery: any;

  beforeEach(async () => {
    vi.resetModules();
    // Re-import so that cachedSessionId is reset
    const mod = await import('../lib/kapruka');
    checkDelivery = mod.checkDelivery;
  });

  const setupMockSessionAndResponse = (responseText: string) => {
    const mockRequestSpy = http.request as any;

    const createMockReq = (responseHeaders: any, responseBody: string) => {
      const req = new EventEmitter() as any;
      req.write = vi.fn();
      req.end = vi.fn(() => {
        const res = new EventEmitter() as any;
        res.statusCode = 200;
        res.headers = responseHeaders;
        
        if (req.callback) {
          req.callback(res);
        }
        
        process.nextTick(() => {
          res.emit('data', responseBody);
          res.emit('end');
        });
      });
      return req;
    };

    const req1 = createMockReq({ 'mcp-session-id': 'session-123' }, '');
    const req2 = createMockReq({}, JSON.stringify({ result: { protocolVersion: '2024-11-05' } }));
    const req3 = new EventEmitter() as any;
    req3.write = vi.fn();
    req3.end = vi.fn();
    const req4 = createMockReq({}, JSON.stringify({
      result: {
        content: [{ text: responseText }]
      }
    }));

    let callCount = 0;
    mockRequestSpy.mockImplementation((options: any, callback: any) => {
      callCount++;
      let req;
      if (callCount === 1) req = req1;
      else if (callCount === 2) req = req2;
      else if (callCount === 3) req = req3;
      else req = req4;
      
      req.callback = callback;
      return req;
    });
  };

  it('parses rates correctly when formatted as "LKR 1,090" without colon', async () => {
    setupMockSessionAndResponse('## Delivery to Galle on 2026-07-05 Available — flat rate LKR 1,090');
    const result = await checkDelivery('Galle', '2026-07-05', 'REAL_PRODUCT_1');
    expect(result.deliverable).toBe(true);
    expect(result.rate).toBe(1090);
  });

  it('parses rates correctly when formatted as "LKR: 350"', async () => {
    setupMockSessionAndResponse('Fulfillment available. Delivery rate: LKR: 350');
    const result = await checkDelivery('Colombo', '2026-07-05', 'REAL_PRODUCT_1');
    expect(result.deliverable).toBe(true);
    expect(result.rate).toBe(350);
  });

  it('parses rates correctly when formatted as "Rate: 450"', async () => {
    setupMockSessionAndResponse('Fulfillment available. Rate: 450 LKR');
    const result = await checkDelivery('Kandy', '2026-07-05', 'REAL_PRODUCT_1');
    expect(result.deliverable).toBe(true);
    expect(result.rate).toBe(450);
  });

  it('parses rates correctly when formatted as "Cost: 1,200"', async () => {
    setupMockSessionAndResponse('Fulfillment available. Cost: 1,200 LKR');
    const result = await checkDelivery('Negombo', '2026-07-05', 'REAL_PRODUCT_1');
    expect(result.deliverable).toBe(true);
    expect(result.rate).toBe(1200);
  });
});
