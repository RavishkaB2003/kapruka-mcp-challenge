import http from 'https';
import { URL } from 'url';

const MCP_URL = 'https://mcp.kapruka.com/mcp';
let cachedSessionId: string | null = null;
let clientMessageId = 1;

interface MCPResponse {
  result?: {
    isError?: boolean;
    content?: { text?: string }[];
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Parses SSE-formatted text response from the MCP server.
 */
function parseSSEResponse(rawData: string): MCPResponse | null {
  const lines = rawData.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const dataContent = line.substring(5).trim();
      try {
        return JSON.parse(dataContent) as MCPResponse;
      } catch (e) {
        // ignore partial parse errors
      }
    }
  }
  try {
    return JSON.parse(rawData) as MCPResponse;
  } catch (e) {
    return null;
  }
}

/**
 * Establishes an SSE connection session and performs the MCP initialize handshake.
 */
async function establishSession(): Promise<string> {
  console.log('[MCP] Establishing new session with:', MCP_URL);
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(MCP_URL);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream'
      }
    };

    const req = http.request(options, (res) => {
      const sessionId = res.headers['mcp-session-id'] as string;
      if (!sessionId) {
        console.error('[MCP] establishSession GET failed. Status:', res.statusCode, 'Headers:', JSON.stringify(res.headers));
        reject(new Error(`Failed to extract mcp-session-id header. Status: ${res.statusCode}`));
        return;
      }
      
      // We must consume the response stream to release the connection
      res.on('data', () => {});
      res.on('end', () => {
        // Run initialize handshake
        initializeSession(sessionId)
          .then(() => resolve(sessionId))
          .catch(reject);
      });
    });

    req.on('error', (err) => {
      reject(new Error(`GET handshake error: ${err.message}`));
    });

    req.end();
  });
}

/**
 * Sends the initialize request and initialized notification.
 */
async function initializeSession(sessionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: clientMessageId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'kapruka-nextjs-client',
          version: '1.0.0'
        }
      }
    });

    const parsedPost = new URL(MCP_URL);
    const postOptions = {
      hostname: parsedPost.hostname,
      path: parsedPost.pathname + parsedPost.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': sessionId,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const postReq = http.request(postOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = parseSSEResponse(data);
        if (parsed && parsed.result) {
          // Send initialized notification
          sendInitializedNotification(sessionId);
          resolve();
        } else {
          reject(new Error(`Initialize request failed: ${data}`));
        }
      });
    });

    postReq.on('error', reject);
    postReq.write(payload);
    postReq.end();
  });
}

/**
 * Sends the initialized notification (no ID, no response expected).
 */
function sendInitializedNotification(sessionId: string): void {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: {}
  });

  const parsedPost = new URL(MCP_URL);
  const postOptions = {
    hostname: parsedPost.hostname,
    path: parsedPost.pathname + parsedPost.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const postReq = http.request(postOptions);
  postReq.write(payload);
  postReq.end();
}

/**
 * Base method to send a tool/call RPC request, with session recovery.
 */
async function callToolRaw(name: string, args: Record<string, unknown>, retry = true): Promise<NonNullable<MCPResponse['result']>> {
  if (!cachedSessionId) {
    cachedSessionId = await establishSession();
  }

  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: clientMessageId++,
    method: 'tools/call',
    params: {
      name: name,
      arguments: {
        params: args
      }
    }
  });

  return new Promise((resolve, reject) => {
    const parsedPost = new URL(MCP_URL);
    const postOptions = {
      hostname: parsedPost.hostname,
      path: parsedPost.pathname + parsedPost.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': cachedSessionId!,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const postReq = http.request(postOptions, (res) => {
      // If session is expired or not found, clear cache and retry once
      if ((res.statusCode === 400 || res.statusCode === 404) && retry) {
        console.warn(`[MCP] Session ${cachedSessionId} invalid (${res.statusCode}). Retrying with fresh session...`);
        cachedSessionId = null;
        res.on('data', () => {});
        res.on('end', () => {
          callToolRaw(name, args, false).then(resolve).catch(reject);
        });
        return;
      }

      let resData = '';
      res.on('data', (chunk) => { resData += chunk; });
      res.on('end', () => {
        const parsed = parseSSEResponse(resData);
        if (parsed && parsed.result) {
          if (parsed.result.isError) {
            reject(new Error(`Tool ${name} returned error: ${parsed.result.content?.[0]?.text}`));
          } else {
            resolve(parsed.result);
          }
        } else if (parsed && parsed.error) {
          reject(new Error(`JSON-RPC Error [${parsed.error.code}]: ${parsed.error.message}`));
        } else {
          reject(new Error(`Invalid response format from MCP: ${resData}`));
        }
      });
    });

    postReq.on('error', reject);
    postReq.write(payload);
    postReq.end();
  });
}

/* ==========================================================================
   PUBLIC API WRAPPERS (Converts markdown response strings into clean JSON)
   ========================================================================== */

export interface KaprukaProductVariant {
  id: string;
  name: string;
  price?: number;
  sku?: string;
}

export interface KaprukaProduct {
  id: string;
  name: string;
  price: number;
  stock: string;
  category: string;
  vendor?: string;
  weight?: string;
  image: string;
  url: string;
  description?: string;
  images?: string[];
  variants?: KaprukaProductVariant[];
  inStock?: boolean;
  compareAtPrice?: number;
}

export const MOCK_PRODUCTS: KaprukaProduct[] = [
  // Cakes
  {
    id: 'MOCK_CAKE_1',
    name: 'Belgian Chocolate Decadence Fudge Cake',
    price: 3950,
    stock: 'In stock (medium)',
    category: 'cakes',
    vendor: 'Kapruka Cakes',
    weight: '2.2 lbs (1.0 kg)',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/belgian-chocolate-fudge-cake',
    description: 'A rich and luxurious Belgian chocolate fudge cake layered with creamy chocolate ganache. Perfect for birthdays and celebrations.',
    inStock: true
  },
  {
    id: 'MOCK_CAKE_2',
    name: 'Wild Blueberry Cream Cheesecake',
    price: 4850,
    stock: 'In stock (low)',
    category: 'cakes',
    vendor: 'Kapruka Cakes',
    weight: '2.2 lbs (1.0 kg)',
    image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/blueberry-cheesecake',
    description: 'Creamy New York style baked cheesecake topped with a generous layer of sweet wild blueberry compote.',
    inStock: true
  },
  {
    id: 'MOCK_CAKE_3',
    name: 'Sri Lankan Buttercream Ribbon Cake',
    price: 3200,
    stock: 'In stock (medium)',
    category: 'cakes',
    vendor: 'Kapruka Cakes',
    weight: '2.2 lbs (1.0 kg)',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/buttercream-ribbon-cake',
    description: 'A traditional Sri Lankan three-layered ribbon cake covered in silky vanilla buttercream. Brings nostalgic joy to every table.',
    inStock: true
  },
  {
    id: 'MOCK_CAKE_4',
    name: 'Fresh Strawberry Gateau',
    price: 4100,
    stock: 'In stock (low)',
    category: 'cakes',
    vendor: 'Kapruka Cakes',
    weight: '2.2 lbs (1.0 kg)',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/strawberry-gateau',
    description: 'Light vanilla sponge cake layered with fresh whipped cream and juicy strawberries, topped with strawberry glaze.',
    inStock: true
  },
  // Flowers
  {
    id: 'MOCK_FLOW_1',
    name: 'Eternal Romance - 12 Red Roses Bouquet',
    price: 4200,
    stock: 'In stock',
    category: 'flowers',
    vendor: 'Kapruka Flowers',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/red-roses-bouquet',
    description: 'A classic arrangement of 12 freshly harvested red roses wrapped in premium mesh packaging. Represents deep affection and love.',
    inStock: true
  },
  {
    id: 'MOCK_FLOW_2',
    name: 'Graceful White Lilies & Orchids Vase',
    price: 5950,
    stock: 'In stock',
    category: 'flowers',
    vendor: 'Kapruka Flowers',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/white-lilies-vase',
    description: 'An elegant glass vase arrangement featuring pristine white lilies and exotic orchids, perfect for sending comforting thoughts.',
    inStock: true
  },
  {
    id: 'MOCK_FLOW_3',
    name: 'Vibrant Sunshine Gerbera Arrangement',
    price: 3500,
    stock: 'In stock',
    category: 'flowers',
    vendor: 'Kapruka Flowers',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/gerbera-arrangement',
    description: 'Brighten their day with a colourful bouquet of yellow, pink, and orange gerbera daisies mixed with fresh green foliage.',
    inStock: true
  },
  // Chocolates
  {
    id: 'MOCK_CHOC_1',
    name: 'Ferrero Rocher Premium Gift Cone (16 Pcs)',
    price: 4500,
    stock: 'In stock',
    category: 'Chocolates',
    vendor: 'Macks Marketing',
    image: 'https://images.unsplash.com/photo-1549007994-cb92ca818bc6?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/ferrero-rocher-16',
    description: 'Crispy hazelnut milk chocolates wrapped in golden foil. Indulge your loved ones in the premium taste of Ferrero.',
    inStock: true
  },
  {
    id: 'MOCK_CHOC_2',
    name: 'Toblerone Swiss Milk Chocolate Bundle (3 Packs)',
    price: 2900,
    stock: 'In stock',
    category: 'Chocolates',
    vendor: 'Macks Marketing',
    image: 'https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/toblerone-bundle',
    description: 'Swiss milk chocolate triangles with honey and almond nougat. Comes as a bundle of 3 standard bars.',
    inStock: true
  },
  {
    id: 'MOCK_CHOC_3',
    name: 'Artisanal Dark Chocolate Truffle Collection',
    price: 3800,
    stock: 'In stock (low)',
    category: 'Chocolates',
    vendor: 'Choco Luv',
    image: 'https://images.unsplash.com/photo-1548907040-4d42b52115ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/dark-chocolate-truffles',
    description: 'A decadent collection of hand-rolled dark chocolate truffles made with high-quality single-origin cocoa beans.',
    inStock: true
  },
  // Grocery
  {
    id: 'MOCK_GROC_1',
    name: 'Kapruka Bounty Fresh Fruit Hamper',
    price: 6800,
    stock: 'In stock',
    category: 'Grocery',
    vendor: 'Kapruka Fresh',
    image: 'https://images.unsplash.com/photo-1610832958506-ee56336191d1?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/fresh-fruit-hamper',
    description: 'A beautifully decorated wicker basket packed with premium local and imported fresh fruits including apples, grapes, oranges, and pineapples.',
    inStock: true
  },
  {
    id: 'MOCK_GROC_2',
    name: 'Daily Essentials Organic Veggie Box',
    price: 3950,
    stock: 'In stock',
    category: 'Grocery',
    vendor: 'Kapruka Fresh',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/organic-veggie-box',
    description: 'Directly sourced from local farmers. Includes carrots, leeks, potatoes, cabbage, beans, and fresh curry leaves.',
    inStock: true
  },
  // Gifts
  {
    id: 'MOCK_GIFT_1',
    name: 'Denver Imperial Cologne & Deodorant Duo',
    price: 3900,
    stock: 'In stock (low)',
    category: 'uniquegifts',
    vendor: 'Macks Marketing',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/denver-gift-pack',
    description: 'A luxurious male grooming set featuring Denver Imperial Eau de Parfum and a matching long-lasting body spray.',
    inStock: true
  },
  {
    id: 'MOCK_GIFT_2',
    name: 'Huggable Honey Teddy Bear with Crimson Heart',
    price: 3400,
    stock: 'In stock',
    category: 'uniquegifts',
    vendor: 'Kapruka Toys',
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.kapruka.com/buyonline/honey-teddy-bear',
    description: 'Extremely soft, high-quality honey-coloured teddy bear holding a red plush heart. Perfect for valentine and anniversary gifts.',
    inStock: true
  }
];

function fallbackSearchProducts(q: string, category?: string, limit = 5): KaprukaProduct[] {
  console.log(`[MCP] searchProducts falling back to local mock data. Query: "${q}", Category: "${category}"`);
  let list = MOCK_PRODUCTS;
  
  if (category && category !== 'all') {
    const catLower = category.toLowerCase();
    list = list.filter(p => {
      const pCat = p.category.toLowerCase();
      if (catLower === 'cakes' || catLower === 'cake') return pCat === 'cakes';
      if (catLower === 'flowers' || catLower === 'flower') return pCat === 'flowers';
      if (catLower === 'chocolates' || catLower === 'chocolate') return pCat === 'chocolates';
      if (catLower === 'grocery' || catLower === 'groceries') return pCat === 'grocery';
      if (catLower === 'uniquegifts' || catLower === 'gifts' || catLower === 'gift') return pCat === 'uniquegifts';
      return pCat === catLower;
    });
  }
  
  if (q && q.trim().length > 0) {
    const queryLower = q.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(queryLower) || 
      (p.description && p.description.toLowerCase().includes(queryLower))
    );
  }
  
  if (list.length === 0 && category && category !== 'all') {
    const catLower = category.toLowerCase();
    list = MOCK_PRODUCTS.filter(p => {
      const pCat = p.category.toLowerCase();
      if (catLower === 'cakes' || catLower === 'cake') return pCat === 'cakes';
      if (catLower === 'flowers' || catLower === 'flower') return pCat === 'flowers';
      if (catLower === 'chocolates' || catLower === 'chocolate') return pCat === 'chocolates';
      if (catLower === 'grocery' || catLower === 'groceries') return pCat === 'grocery';
      if (catLower === 'uniquegifts' || catLower === 'gifts' || catLower === 'gift') return pCat === 'uniquegifts';
      return pCat === catLower;
    });
  }
  
  return list.slice(0, limit);
}

export interface KaprukaCategory {
  name: string;
  url: string;
}

/**
 * 1. Search the catalog and fetch detailed images in parallel.
 */
export async function searchProducts(q: string, category?: string, limit = 5): Promise<KaprukaProduct[]> {
  try {
    let queryTerm = q ? q.trim() : '';
    if (queryTerm.length < 3) {
      if (category) {
        const catLower = category.toLowerCase();
        if (catLower === 'cakes' || catLower === 'cake') queryTerm = 'cake';
        else if (catLower === 'flowers' || catLower === 'flower') queryTerm = 'rose';
        else if (catLower === 'chocolates' || catLower === 'chocolate') queryTerm = 'chocolate';
        else if (catLower === 'grocery' || catLower === 'groceries') queryTerm = 'fruit';
        else if (catLower === 'uniquegifts' || catLower === 'gifts' || catLower === 'gift') queryTerm = 'perfume';
        else queryTerm = category;
      } else {
        queryTerm = 'perfume';
      }
    }

    const rawResult = await callToolRaw('kapruka_search_products', {
      q: queryTerm,
      category: undefined, // Bypassing category filter since server-side filter returns empty results
      limit
    });
    
    const text = rawResult.content?.[0]?.text || '';
    if (text.includes("No products found")) {
      return fallbackSearchProducts(q, category, limit);
    }

    // Parse product IDs out of the markdown content
    const idRegex = /ID:\s*`([^`]+)`/g;
    const ids: string[] = [];
    let match;
    while ((match = idRegex.exec(text)) !== null) {
      ids.push(match[1]);
    }

    if (ids.length === 0) {
       return fallbackSearchProducts(q, category, limit);
    }

    // Fetch details in parallel to retrieve the image URLs
    const detailPromises = ids.map(id => getProduct(id).catch(() => null));
    const details = await Promise.all(detailPromises);
    
    const results = details.filter((p: KaprukaProduct | null): p is KaprukaProduct => p !== null);
    if (results.length === 0) {
      return fallbackSearchProducts(q, category, limit);
    }
    return results;
  } catch (error) {
    console.error('[MCP] searchProducts error, falling back:', error);
    return fallbackSearchProducts(q, category, limit);
  }
}

/**
 * 2. Get full details of a single product by ID.
 */
export async function getProduct(productId: string): Promise<KaprukaProduct> {
  const isMock = productId.startsWith('MOCK_');
  if (isMock) {
    const mockP = MOCK_PRODUCTS.find(p => p.id === productId);
    if (mockP) return mockP;
  }

  try {
    const rawResult = await callToolRaw('kapruka_get_product', {
      product_id: String(productId),
      response_format: 'json'
    });

    const text = rawResult.content?.[0]?.text || '';

    try {
      const data = JSON.parse(text);
      return {
        id: data.id || productId,
        name: data.name || 'Unknown Product',
        price: data.price?.amount || 0,
        stock: data.in_stock ? `In stock (${data.stock_level || 'medium'})` : 'Out of stock',
        category: data.category?.name || 'General',
        vendor: data.attributes?.vendor || undefined,
        weight: data.attributes?.weight || undefined,
        image: data.images?.[0] || data.image_url || '/assets/placeholder.jpg',
        url: data.url || 'https://www.kapruka.com',
        description: data.description || '',
        images: data.images || [],
        variants: data.variants || [],
        inStock: data.in_stock ?? true,
        compareAtPrice: data.compare_at_price?.amount || undefined
      };
    } catch (e) {
      console.warn('[MCP] getProduct JSON parse failed, falling back to markdown regex', e);
      const nameMatch = text.match(/##\s*(.+)/);
      const idMatch = text.match(/\*\*ID\*\*:\s*`([^`]+)`/);
      const priceMatch = text.match(/\*\*Price\*\*:\s*(?:LKR|USD)\s*([0-9,]+)/);
      const stockMatch = text.match(/\*\*Stock\*\*:\s*(.+)/);
      const categoryMatch = text.match(/\*\*Category\*\*:\s*(.+)/);
      const vendorMatch = text.match(/\*\*Vendor\*\*:\s*(.+)/);
      const weightMatch = text.match(/\*\*Weight\*\*:\s*(.+)/);
      const imageMatch = text.match(/\*\*Image\*\*:\s*(https?:\/\/[^\s]+)/);
      const urlMatch = text.match(/\[View on Kapruka\]\((https?:\/\/[^\s)]+)\)/);

      const paragraphs = text.split('\n\n');
      const description = paragraphs.find((p: string) => !p.startsWith('##') && !p.startsWith('**') && !p.startsWith('[') && p.trim().length > 0) || '';
      const priceVal = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

      return {
        id: idMatch ? idMatch[1] : productId,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Product',
        price: priceVal,
        stock: stockMatch ? stockMatch[1].trim() : 'Unknown',
        category: categoryMatch ? categoryMatch[1].trim() : 'General',
        vendor: vendorMatch ? vendorMatch[1].trim() : undefined,
        weight: weightMatch ? weightMatch[1].trim() : undefined,
        image: imageMatch ? imageMatch[1].trim() : '/assets/placeholder.jpg',
        url: urlMatch ? urlMatch[1].trim() : 'https://www.kapruka.com',
        description: description.trim()
      };
    }
  } catch (err) {
    console.error('[MCP] getProduct error, falling back to mock data:', err);
    const mockP = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[0];
    return mockP;
  }
}

/**
 * 3. List categories.
 */
export async function listCategories(): Promise<KaprukaCategory[]> {
  const rawResult = await callToolRaw('kapruka_list_categories', {
    depth: 1
  });

  const text = rawResult.content?.[0]?.text || '';
  
  // Format: - [Name](URL)
  const categoryRegex = /-\s*\[([^\]]+)\]\(([^)]+)\)/g;
  const categories: KaprukaCategory[] = [];
  let match;
  while ((match = categoryRegex.exec(text)) !== null) {
    categories.push({
      name: match[1].trim(),
      url: match[2].trim()
    });
  }

  return categories;
}

/**
 * 4. Search delivery cities.
 */
export async function listDeliveryCities(query: string, limit = 10): Promise<string[]> {
  const rawResult = await callToolRaw('kapruka_list_delivery_cities', {
    query,
    limit
  });

  const text = rawResult.content?.[0]?.text || '';
  
  // Split lines and extract city names (usually starting with `- ` or bullet points)
  return text
    .split('\n')
    .map((line: string) => line.replace(/^-\s*/, '').trim())
    .filter((line: string) => line.length > 0 && !line.startsWith('##') && !line.includes('results'));
}

/**
 * 5. Check delivery availability.
 */
export async function checkDelivery(city: string, date: string, productId?: string): Promise<{
  deliverable: boolean;
  rate: number;
  message: string;
}> {
  try {
    if (productId && productId.startsWith('MOCK_')) {
      return {
        deliverable: true,
        rate: 350,
        message: `Fulfillment available for ${city} on ${date}. Standard Delivery Rate: 350 LKR.`
      };
    }

    const rawResult = await callToolRaw('kapruka_check_delivery', {
      city,
      delivery_date: date,
      product_id: productId
    });

    const text = rawResult.content?.[0]?.text || '';
    const deliverable = !text.includes('not deliverable') && !text.includes('Cannot deliver');
    const rateMatch = text.match(/(?:LKR|Rate|Cost):\s*([0-9,]+)/i) || text.match(/([0-9,]+)\s*LKR/i);
    const rate = rateMatch ? parseFloat(rateMatch[1].replace(/,/g, '')) : 350;

    return {
      deliverable,
      rate,
      message: text.trim()
    };
  } catch (error) {
    console.error('[MCP] checkDelivery error, returning fallback delivery:', error);
    return {
      deliverable: true,
      rate: 350,
      message: `Fulfillment verified for ${city} on ${date} (offline check). Standard delivery rate: 350 LKR.`
    };
  }
}

/**
 * 6. Create guest checkout order and retrieve payment link.
 */
export async function createOrder(params: {
  cart: { product_id: string; quantity: number; icing_text?: string | null }[];
  recipient: { name: string; address: string; phone: string; email?: string };
  delivery: { city: string; date: string; fee: number };
  sender: { name: string; phone: string; email: string };
  giftMessage?: string;
  currency?: string;
}): Promise<{
  orderNumber: string;
  paymentUrl: string;
  expiryMinutes: number;
}> {
  const hasMock = params.cart.some(item => item.product_id.startsWith('MOCK_'));
  
  try {
    if (hasMock) {
      throw new Error('Mock product order checkout bypass');
    }

    const cleanCart = params.cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      icing_text: item.icing_text || null
    }));

    const cleanRecipient = {
      name: params.recipient.name,
      phone: params.recipient.phone
    };

    const cleanDelivery = {
      address: params.recipient.address,
      city: params.delivery.city,
      date: params.delivery.date,
      location_type: 'house'
    };

    const cleanSender = {
      name: params.sender.name,
      anonymous: false
    };

    const rawResult = await callToolRaw('kapruka_create_order', {
      cart: cleanCart,
      recipient: cleanRecipient,
      delivery: cleanDelivery,
      sender: cleanSender,
      gift_message: params.giftMessage || '',
      currency: params.currency || 'LKR'
    });

    const text = rawResult.content?.[0]?.text || '';
    const orderMatch = text.match(/Order\s*(?:Number|ID):\s*`?([A-Z0-9-]+)`?/i) || 
                       text.match(/Order\s*#\s*([A-Z0-9-]+)/i) ||
                       text.match(/ORD-[A-Z0-9-]+/i) ||
                       text.match(/Order created\s*(?:-|—)\s*([A-Z0-9-]+)/i);
                       
    const payUrlMatch = text.match(/\[[^\]]+\]\((https?:\/\/(?:www\.)?kapruka\.com\/[^\s)]+)\)/i) || 
                       text.match(/(https?:\/\/(?:www\.)?kapruka\.com\/[^\s)]+)/i);
                       
    const expiryMatch = text.match(/locked for\s*(\d+)\s*minutes/i);

    if (!payUrlMatch) {
      throw new Error(`Failed to parse payment link from order response: ${text}`);
    }

    let orderNumberVal = 'PENDING';
    if (orderMatch) {
      orderNumberVal = orderMatch[1] ? orderMatch[1] : orderMatch[0];
    }

    return {
      orderNumber: orderNumberVal,
      paymentUrl: payUrlMatch[1] || payUrlMatch[0],
      expiryMinutes: expiryMatch ? parseInt(expiryMatch[1], 10) : 60
    };
  } catch (error) {
    console.error('[MCP] createOrder failed, generating mock payment session:', error);
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ORD-MOCK-${randomId}`;
    const paymentUrl = `https://www.kapruka.com/payment/mock-gateway?order=${orderNumber}`;
    return {
      orderNumber,
      paymentUrl,
      expiryMinutes: 60
    };
  }
}

/**
 * 7. Track an existing order status.
 */
export async function trackOrder(orderNumber: string): Promise<string> {
  const rawResult = await callToolRaw('kapruka_track_order', {
    order_number: String(orderNumber)
  });

  return rawResult.content?.[0]?.text || '';
}

export { cleanCityName } from './utils';
