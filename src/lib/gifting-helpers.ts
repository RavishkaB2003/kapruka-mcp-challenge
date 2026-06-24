/**
 * Resolves placeholder ingredients for products when structured ingredients are unavailable.
 * Used to present custom specifications inside the product detail conversational widgets.
 * 
 * @param name The name of the product.
 * @param category The product category (e.g. cakes, Chocolates).
 * @returns An array of string ingredient lists.
 */
export const getIngredientsForProduct = (name: string, category: string): string[] => {
  const n = name.toLowerCase();
  if (category === 'cakes' || n.includes('cake')) {
    return ['Premium Flour', 'Organic Sugar', 'Farm Eggs', 'Pure Butter', 'Baking Powder', 'Cocoa Powder', 'Vanilla Extract'];
  }
  if (category === 'Chocolates' || n.includes('chocolate')) {
    return ['Cocoa Butter', 'Milk Solids', 'Organic Cane Sugar', 'Soy Lecithin', 'Roasted Hazelnuts'];
  }
  if (category === 'flowers' || n.includes('bouquet') || n.includes('flower')) {
    return ['Fresh Local Roses', 'Eucalyptus Leaves', 'Baby\'s Breath', 'Decorative Kraft Wrap', 'Water Retention Gel'];
  }
  if (category === 'Grocery' || n.includes('basket') || n.includes('fruit')) {
    return ['Fresh Red Apples', 'Organic Bananas', 'Ripe Papaya', 'Seasonal Grapes', 'Handcrafted Cane Basket'];
  }
  return ['Premium Ingredients', 'Natural Spices', 'Artisanal Prep'];
};

/**
 * Resolves allergen alerts for products based on category mappings.
 * Displays warning labels inside product specification panels.
 * 
 * @param name The name of the product.
 * @param category The product category.
 * @returns An array of allergen strings.
 */
export const getAllergensForProduct = (name: string, category: string): string[] => {
  const n = name.toLowerCase();
  if (category === 'cakes' || n.includes('cake')) {
    return ['Gluten', 'Dairy', 'Eggs'];
  }
  if (category === 'Chocolates' || n.includes('chocolate')) {
    return ['Dairy', 'Soy', 'Nuts'];
  }
  if (category === 'flowers' || n.includes('bouquet') || n.includes('flower')) {
    return ['Pollen'];
  }
  return [];
};

/**
 * Generates three intimate personalized greeting note variations.
 * Combines relationship context, specific occasion, tone guidelines, and custom memories.
 * 
 * @param relationship The connection type (e.g., father, mom, partner).
 * @param occasion The event celebrated (e.g., birthday, anniversary).
 * @param tone The desired emotional mood (e.g., romantic, funny, warm).
 * @param memories Optional custom message snippet of personal memories.
 * @returns An array containing 3 distinct note variants.
 */
export const generateGreetings = (
  relationship: string | null,
  occasion: string | null,
  tone: string | null,
  memories?: string | null,
  isSinhala: boolean = false
): string[] => {
  const rel = relationship?.trim() || 'someone special';
  const relLower = rel.toLowerCase();
  const occ = occasion?.toLowerCase() || 'special day';
  
  if (isSinhala) {
    let relNameSi = 'ආදරණීයයා';
    if (relLower.includes('father') || relLower.includes('dad') || relLower.includes('thaththa')) {
      relNameSi = 'තාත්තා';
    } else if (relLower.includes('mother') || relLower.includes('mom') || relLower.includes('amma')) {
      relNameSi = 'අම්මා';
    } else if (relLower.includes('brother') || relLower.includes('malli') || relLower.includes('ayiya')) {
      relNameSi = 'මල්ලි/අයියා';
    } else if (relLower.includes('sister') || relLower.includes('nangi') || relLower.includes('akka')) {
      relNameSi = 'නංගි/අක්කා';
    } else if (relLower.includes('friend') || relLower.includes('yaluwa')) {
      relNameSi = 'මිතුරා';
    } else if (relLower.includes('partner') || relLower.includes('love') || relLower.includes('husband') || relLower.includes('wife')) {
      relNameSi = 'ආදරණීයයා';
    } else {
      relNameSi = rel;
    }

    const memorySuffix = memories ? ` ${memories} මට තවමත් මතක් වෙනවා.` : '';

    if (occ.includes('birthday')) {
      if (relLower.includes('father') || relLower.includes('dad') || relLower.includes('thaththa')) {
        return [
          `ආදරණීය තාත්තා වෙත, ඔබට සුබ උපන්දිනයක් වේවා! සැමදා මගේ ශක්තිය වූවාට ඔබට ස්තුතියි. දීර්ඝායුෂ ලැබේවා!${memorySuffix}`,
          `ලොව හොඳම තාත්තාට සුබ උපන්දිනයක්! ඔබ අප වෙනුවෙන් කල සියලු දේට අප සදා ණයගැතියි. ආදරණීය තාත්තාට නිදුක් නිරෝගී සුවය පතමි!${memorySuffix ? ` (${memories})` : ''}`,
          `මගේ ආදරණීය තාත්තාට සුබම සුබ උපන්දිනයක් වේවා!${memorySuffix} ඔබ වැනි පියෙකු ලැබීම මගේ වාසනාවක්.`
        ];
      }
      if (relLower.includes('mother') || relLower.includes('mom') || relLower.includes('amma')) {
        return [
          `ආදරණීය අම්මා වෙත, ඔබට සුබ උපන්දිනයක් වේවා! ඔබේ අපිරිමිත සෙනෙහසට සහ ඉවසීමට ස්තුතියි. දීර්ඝායුෂ ලැබේවා!${memorySuffix}`,
          `ලොව උතුම්ම අම්මාට සුබ උපන්දිනයක්! ඔබේ ආදරය හා රැකවරණය අපේ ජීවිත ආලෝකවත් කලා. ඔබට නිදුක් නිරෝගී සුවය පතමි!${memorySuffix ? ` (${memories})` : ''}`,
          `මගේ ආදරණීය අම්මාට සුබම සුබ උපන්දිනයක් වේවා!${memorySuffix} මතු මතුත් අම්මාගේම දරුවෙකු වන්නට පතමි.`
        ];
      }
      if (relLower.includes('partner') || relLower.includes('love') || relLower.includes('boyfriend') || relLower.includes('girlfriend') || relLower.includes('husband') || relLower.includes('wife')) {
        return [
          `මගේ ආදරණීයයා වෙත, ඔබට සුබ උපන්දිනයක් වේවා! මගේ ජීවිතය ලස්සන කලාට ස්තුතියි. ආදරෙයි සැමදා!${memorySuffix}`,
          `සුබ උපන්දිනයක් මගේ පණ! ඔබ මගේ ළඟින් සිටීම මට ලොකුම සතුටක්. සදාකල් මා සමඟ රැඳෙන්න!${memorySuffix ? ` (${memories})` : ''}`,
          `සුබ උපන්දිනයක්!${memorySuffix} මගේ මුළු ජීවිතයම ඔබයි.`
        ];
      }
      return [
        `${relNameSi} වෙත, ඔබට සුබ උපන්දිනයක් වේවා! මේ විශේෂ දිනයේ ඔබ පතන සියලුම පැතුම් ඉටුවේවා කියා පතමි!${memorySuffix}`,
        `සුබ උපන්දිනයක් වේවා! ලැබුවා වූ නව වසර සතුට, සෞභාග්‍යය පිරි සුභ වසරක් වේවා!${memorySuffix}`,
        `උපන්දිනයට උණුසුම් සුබපැතුම්! මෙම සුවිශේෂී තෑග්ග ඔබව සිනහවෙන් තබනු ඇතැයි සිතමි.${memorySuffix}`
      ];
    }

    if (occ.includes('anniversary')) {
      const partnerRel = relLower.includes('partner') || relLower.includes('love') || relLower.includes('boyfriend') || relLower.includes('girlfriend') || relLower.includes('husband') || relLower.includes('wife');
      if (partnerRel) {
        return [
          `සුබ විවාහ සංවත්සරයක් වේවා, මගේ ආදරණීයයා! තවත් සුන්දර වසරක් මා සමඟ ගත කලාට ස්තුතියි.${memorySuffix}`,
          `සුබ සංවත්සරයක් වේවා! අපේ ආදරය තව තවත් ශක්තිමත් වේවා කියා පතමි.${memorySuffix ? ` (${memories})` : ''}`,
          `අපේ විවාහ සංවත්සරයට උණුසුම් සුබපැතුම්! ඔබ මා අසල සිටින තාක් මා ලොව වාසනාවන්තම පුද්ගලයායි.${memorySuffix}`
        ];
      }
      return [
        `ඔබ දෙදෙනාට සුබ විවාහ සංවත්සරයක් වේවා! ඉදිරි ජීවිතය ආදරයෙන් හා සතුටෙන් පිරේවා කියා පතමු!${memorySuffix}`,
        `සුබ සංවත්සරයක් වේවා! තව තවත් ආදරයෙන් බැඳෙන්නට ඔබට ශක්තිය ලැබේවා.${memorySuffix ? ` (${memories})` : ''}`,
        `විවාහ සංවත්සරයට හදපිරි සුබපැතුම්! ඔබ දෙදෙනාගේ බැඳීම සදාකල් පවතීවා!${memorySuffix}`
      ];
    }

    return [
      `මෙම සුවිශේෂී තෑග්ග සමඟ මගේ ආදරය සහ උණුසුම් සුබපැතුම් ඔබ වෙත එවමි. සැමදා සතුටින් සිටින්න!${memorySuffix}`,
      `අද දවසේ ඔබ ගැන සිතමින්, දුර සිට වුවද මගේ හදපිරි සුබපැතුම් එවමි. තෑග්ග සතුටින් භාරගන්න!${memorySuffix ? ` (${memories})` : ''}`,
      `ඔබගේ දිනය සතුටින් හා ලස්සන මතකයන්ගෙන් පිරේවා කියා පතමි! මෙම පුදුමය භුක්ති විඳින්න!${memorySuffix}`
    ];
  }

  let relName = rel;
  if (relLower === 'partner' || relLower === 'love') relName = 'my love';
  
  const memorySuffix = memories ? ` I still cherish ${memories} and look forward to more special times.` : '';
  const memoryInject = (defaultText: string, specificText: string) => {
    return memories ? specificText : defaultText;
  };

  if (occ.includes('birthday')) {
    if (relLower.includes('father') || relLower.includes('dad') || relLower.includes('thaththa')) {
      return [
        `Happy Birthday, ${relName}! Thank you for always being my pillar of strength and support.${memorySuffix} Have a wonderful day!`,
        memoryInject(
          `To the best ${relName} in the world, wishing you a birthday filled with love, joy, and all your favorite things!`,
          `To the best ${relName} in the world, wishing you a birthday filled with love. I still remember ${memories} and feel so lucky!`
        ),
        `Happy Birthday! Sending you love and warm wishes today. So grateful for everything you do, especially when I think of ${memories || 'all our shared moments'}.`
      ];
    }
    if (relLower.includes('mother') || relLower.includes('mom') || relLower.includes('amma')) {
      return [
        `Happy Birthday, ${relName}! Thank you for your endless love, patience, and guidance.${memorySuffix} You are my guiding light.`,
        memoryInject(
          `Wishing the most wonderful ${relName} a very Happy Birthday! May your day be as beautiful and loving as you are.`,
          `Wishing the most wonderful ${relName} a very Happy Birthday! Thinking of ${memories} brings a smile to my face today.`
        ),
        `Happy Birthday! So grateful for your warm hugs and everything you do for our family. Love you so much!${memorySuffix}`
      ];
    }
    if (relLower.includes('partner') || relLower.includes('love') || relLower.includes('boyfriend') || relLower.includes('girlfriend') || relLower.includes('husband') || relLower.includes('wife')) {
      const displayRel = relLower.includes('partner') || relLower.includes('love') ? 'my love' : relName;
      return [
        `Happy Birthday, ${displayRel}! You make my world so much brighter.${memorySuffix} Can't wait to celebrate many more with you.`,
        memoryInject(
          `Wishing the happiest of birthdays to the one who holds my heart. I love you more every day!`,
          `Wishing the happiest of birthdays to the one who holds my heart. I love you more every day, especially when I think of ${memories}!`
        ),
        `Happy Birthday! You're my favorite person and I hope your day is as beautiful and special as you are. So glad we share the memory of ${memories || 'our journey together'}.`
      ];
    }
    return [
      `Happy Birthday, ${relName}! Wishing you a day as wonderful as you are.${memorySuffix} Enjoy your special gift!`,
      `To a dear ${relName}, wishing you a year ahead filled with happiness, health, and success.${memorySuffix} Happy Birthday!`,
      `Warmest birthday wishes! Hoping this year brings you countless reasons to smile. Enjoy the celebration!${memorySuffix}`
    ];
  }

  if (occ.includes('anniversary')) {
    const partnerRel = relLower.includes('partner') || relLower.includes('love') || relLower.includes('boyfriend') || relLower.includes('girlfriend') || relLower.includes('husband') || relLower.includes('wife');
    if (partnerRel) {
      return [
        `Happy Anniversary, ${relName === 'someone special' ? 'my love' : relName}! Thank you for another beautiful year together.${memorySuffix}`,
        `Happy Anniversary! Thinking of ${memories || 'our wedding day'} and wishing us many more years of love and happiness.`,
        `To my wonderful partner, Happy Anniversary! ${memories ? `I will never forget ${memories} and how we grew together.` : 'Thank you for showing me what true love looks like.'}`
      ];
    }
    return [
      `Happy Anniversary! Wishing you both a lifetime of love, laughter, and beautiful memories together.${memorySuffix}`,
      `To my favorite couple, happy anniversary! Thinking of ${memories || 'your beautiful journey'} and wishing your bond grows stronger with each passing year.`,
      `Happy Anniversary! Thank you for showing us what true love looks like. Cheers to many more years!${memorySuffix}`
    ];
  }

  return [
    `Sending you this special gift, ${relName}, with all my love and warmest wishes.${memorySuffix} Hope it brings a big smile to your face!`,
    `Thinking of you today, ${relName}, and sending warm hugs from afar.${memorySuffix} Hope you enjoy this little token of love!`,
    `May your day be filled with unexpected joys and beautiful moments, ${relName}. Enjoy your special surprise!${memorySuffix}`
  ];
};

/**
 * Parses user input locally as a fallback when the main AI LLM is unavailable or offline.
 * Extracts intent, category, search term, recipient details, and occasion parameters.
 * 
 * @param query The raw user message string.
 * @param isSinhalaMode Flag indicating if the interface is in Sinhala mode.
 * @returns The structured intent extraction result.
 */
export function localFallbackParse(query: string, isSinhalaMode: boolean = false): {
  detectedIntent: 'search' | 'check_delivery' | 'track_order' | 'get_product_info' | 'general' | 'add_to_cart' | 'recommend' | 'compose_greeting';
  detectedIntents: ('search' | 'check_delivery' | 'track_order' | 'get_product_info' | 'general' | 'add_to_cart' | 'recommend' | 'compose_greeting')[];
  detectedCategory: string;
  cleanSearchTerm: string;
  requiresClarification: boolean;
  clarificationPrompt: string | null;
  extractedCriteria: {
    giftType: string;
    recipient: string;
    city: string | null;
    date: string | null;
  };
  widgetData: {
    city: string | null;
    date: string | null;
    orderNumber: string | null;
    verificationPhone: string | null;
    productQuery: string | null;
    productName: string | null;
    quantity: number | null;
    recipientDetails: {
      name: string | null;
      address: string | null;
      phone: string | null;
    } | null;
    occasion: string | null;
    tone: string | null;
    relationship: string | null;
  };
  conversationalReply: string;
} {
  const q = query.toLowerCase();
  
  // Multiple intent detection for local parser
  const intents: ('search' | 'check_delivery' | 'track_order' | 'get_product_info' | 'general' | 'add_to_cart' | 'recommend' | 'compose_greeting')[] = [];
  const isGreetingQuery = q.includes('write') || q.includes('compose') || q.includes('message') || q.includes('note') || q.includes('greeting') || q.includes('card') || q.includes('text') || q.includes('wachana') || q.includes('wording');
  
  if (isGreetingQuery) {
    intents.push('compose_greeting');
  }
  if (q.includes('add') && (q.includes('cart') || q.includes('basket'))) {
    intents.push('add_to_cart');
  }
  if (q.includes('recommend') || q.includes('suggest') || q.includes('gift idea') || q.includes('birthday') || q.includes('anniversary') || q.includes('occasion')) {
    intents.push('recommend');
  }
  if (q.includes('track') || q.includes('where is') || q.includes('ord-') || q.includes('taththata yawwa')) {
    intents.push('track_order');
  }
  if (q.includes('deliver') || q.includes('rate') || q.includes('open da') || q.includes('fee')) {
    intents.push('check_delivery');
  }
  if (q.includes('eggless') || q.includes('ingredient') || q.includes('allergen') || q.includes('size') || q.includes('weight')) {
    intents.push('get_product_info');
  }

  if (intents.length === 0) {
    const hasCategory = q.includes('cake') || q.includes('කේක්') || q.includes('keik') || q.includes('kake') || q.includes('kek') ||
                        q.includes('flower') || q.includes('මල්') || q.includes('mal') || q.includes('rose') || q.includes('roja') || q.includes('mal-wattiya') ||
                        q.includes('chocolate') || q.includes('චොකලට්') || q.includes('choc') || q.includes('chocalate') || q.includes('choclet') ||
                        q.includes('grocer') || q.includes('එළවළු') || q.includes('කෑම') || q.includes('fruit') || q.includes('vege') || q.includes('elavalu') || q.includes('palathuru') || q.includes('basket') ||
                        q.includes('gift') || q.includes('තෑගි') || q.includes('toy') || q.includes('teddy') || q.includes('perfume') || q.includes('thagi') ||
                        q.includes('search') || q.includes('find') || q.includes('show') || q.includes('list') || q.includes('get') || q.includes('buy') || q.includes('order');
    if (hasCategory) {
      intents.push('search');
    } else {
      intents.push('general');
    }
  }

  const detectedIntent = intents[0];
  const detectedIntents = intents;
  let detectedCategory = 'all';
  let cleanSearchTerm = 'gift';
  let giftType = 'Gifts';

  // Category mapping
  if (q.includes('cake') || q.includes('කේක්') || q.includes('keik') || q.includes('kake') || q.includes('kek')) {
    detectedCategory = 'cakes';
    cleanSearchTerm = 'cake';
    giftType = 'Cakes';
  } else if (q.includes('flower') || q.includes('මල්') || q.includes('mal') || q.includes('rose') || q.includes('roja') || q.includes('mal-wattiya')) {
    detectedCategory = 'flowers';
    cleanSearchTerm = 'flower bouquet';
    giftType = 'Flowers';
  } else if (q.includes('chocolate') || q.includes('චොකලට්') || q.includes('චොක්ලට්') || q.includes('choc') || q.includes('chocalate') || q.includes('choclet')) {
    detectedCategory = 'Chocolates';
    cleanSearchTerm = 'chocolate';
    giftType = 'Chocolates';
  } else if (q.includes('grocer') || q.includes('එළවළු') || q.includes('කෑම') || q.includes('fruit') || q.includes('vege') || q.includes('elavalu') || q.includes('palathuru') || q.includes('basket')) {
    detectedCategory = 'Grocery';
    cleanSearchTerm = 'fruit basket';
    giftType = 'Grocery';
  } else if (q.includes('gift') || q.includes('තෑගි') || q.includes('තෑග්ග') || q.includes('toy') || q.includes('teddy') || q.includes('perfume') || q.includes('thagi') || q.includes('සෙල්ලම් බඩු') || q.includes('ටෙඩි')) {
    detectedCategory = 'uniquegifts';
    cleanSearchTerm = 'gift';
    giftType = 'Gifts';
  }

  // Basic city extraction
  let city = null;
  if (q.includes('colombo') || q.includes('කොළඹ') || q.includes('kolombo')) city = 'Colombo';
  else if (q.includes('kandy') || q.includes('මහනුවර') || q.includes('nuwara') || q.includes('kandiy')) city = 'Kandy';
  else if (q.includes('galle') || q.includes('ගාල්ල') || q.includes('galla')) city = 'Galle';
  else if (q.includes('negombo') || q.includes('මීගමුව') || q.includes('migamuwa')) city = 'Negombo';
  else if (q.includes('jaffna') || q.includes('යාපනය') || q.includes('yapanaya')) city = 'Jaffna';

  // Basic recipient extraction
  let recipient = 'Someone Special';
  let relationship = null;
  if (q.includes('mom') || q.includes('mother') || q.includes('amma') || q.includes('ammata') || q.includes('ammatath') || q.includes('අම්මා') || q.includes('අම්මට') || q.includes('මව') || q.includes('මවට')) {
    recipient = 'Mother';
    relationship = 'mother';
  } else if (q.includes('dad') || q.includes('father') || q.includes('thaththa') || q.includes('thaththata') || q.includes('තාත්තා') || q.includes('තාත්තට') || q.includes('පියා') || q.includes('පියට') || q.includes('පියාණන්') || q.includes('පියාණන්ට')) {
    recipient = 'Father';
    relationship = 'father';
  } else if (q.includes('malli') || q.includes('brother') || q.includes('bro') || q.includes('mallita') || q.includes('ayiya') || q.includes('ayyata') || q.includes('මල්ලි') || q.includes('මල්ලිට') || q.includes('අයියා') || q.includes('අයියට') || q.includes('සහෝදරයා') || q.includes('සහෝදරයට')) {
    recipient = 'Brother';
    relationship = 'brother';
  } else if (q.includes('nangi') || q.includes('sister') || q.includes('sis') || q.includes('nangita') || q.includes('akka') || q.includes('akkata') || q.includes('නංගි') || q.includes('නංගිට') || q.includes('අක්කා') || q.includes('අක්කට') || q.includes('සහෝදරිය') || q.includes('සහෝදරියට')) {
    recipient = 'Sister';
    relationship = 'sister';
  } else if (q.includes('friend') || q.includes('yaluwa') || q.includes('yaluwata') || q.includes('fit-eka') || q.includes('යාලුවා') || q.includes('යාලුවට') || q.includes('මිතුරා') || q.includes('මිතුරට') || q.includes('හිතවතා') || q.includes('හිතවතෙක්') || q.includes('ෆිට්') || q.includes('මචං')) {
    recipient = 'Friend';
    relationship = 'friend';
  } else if (q.includes('gf') || q.includes('bf') || q.includes('wife') || q.includes('husband') || q.includes('baba') || q.includes('sudoo') || q.includes('love') || q.includes('boyfriend') || q.includes('girlfriend') || q.includes('බිරිඳ') || q.includes('බිරිඳට') || q.includes('සැමියා') || q.includes('සැමියට') || q.includes('ආදරවන්තයා') || q.includes('ආදරවන්තී') || q.includes('සුදූ') || q.includes('වයිෆ්') || q.includes('හස්බන්ඩ්')) {
    recipient = 'Partner';
    relationship = 'partner';
  }

  // Basic occasion extraction (English, Sinhala Unicode, and Tanglish)
  let occasion = null;
  if (q.includes('birthday') || q.includes('bday') || q.includes('upandinaya') || q.includes('updandinaya') || q.includes('upadinaya') || q.includes('upandina') || q.includes('උපන්දිනය') || q.includes('උපන්දින') || q.includes('updandinayata') || q.includes('upandinayata') || q.includes('upadinayata')) occasion = 'Birthday';
  else if (q.includes('anniversary') || q.includes('wedding') || q.includes('සංවත්සරය') || q.includes('anniversariya')) occasion = 'Anniversary';
  else if (q.includes('retirement') || q.includes('විශ්‍රාම') || q.includes('visrama')) occasion = 'Retirement';
  else if (q.includes('graduation') || q.includes('උපාධි') || q.includes('upadhi')) occasion = 'Graduation';

  // Parse order number
  const orderMatch = query.match(/ORD-[A-Z0-9-]+/i);
  const orderNumber = orderMatch ? orderMatch[0].toUpperCase() : null;

  // Parse phone verification
  const phoneMatch = query.match(/\b\d{9,10}\b/);
  const verificationPhone = phoneMatch ? phoneMatch[0] : null;

  // Extract productName for add_to_cart
  let productName = null;
  if (detectedIntent === 'add_to_cart') {
    const addMatch = query.match(/(?:add|put)\s+(.+?)\s+to\s+(?:my\s+|the\s+)?cart/i);
    productName = addMatch ? addMatch[1] : cleanSearchTerm;
  }

  // Extract delivery date
  let date = null;
  const dateMatch = query.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i);
  if (dateMatch) {
    const day = dateMatch[1];
    const monthStr = dateMatch[2].toLowerCase();
    const year = dateMatch[3] || '2026';
    const monthMap: Record<string, string> = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
    date = `${year}-${monthMap[monthStr]}-${day.padStart(2, '0')}`;
  }

  // Recipient details extraction for prefill
  let extractedName: string | null = null;
  let extractedAddress: string | null = null;
  let extractedPhone: string | null = null;

  const phoneRegex = /(?:\+94|0)?7[0-9]{8}\b/;
  const phoneM = query.match(phoneRegex);
  if (phoneM) {
    extractedPhone = phoneM[0];
  }

  const addressRegex = /(?:address is|address:|deliver to|delivery address:)\s+([^,.\n]+)/i;
  const addressM = query.match(addressRegex);
  if (addressM) {
    extractedAddress = addressM[1].trim();
  } else {
    const roadM = query.match(/(\d+\s+[^,.\n]+(?:road|street|lane|ward|ave|avenue|garden|gardens)[^,.\n]*)/i);
    if (roadM) {
      extractedAddress = roadM[1].trim();
    }
  }

  const nameRegex = /(?:name is|name:|recipient is|recipient name is|recipient details:|for)\s+([a-z]+(?:\s+[a-z]+)?)/i;
  const nameM = query.match(nameRegex);
  if (nameM) {
    const relationWords = ['boyfriend', 'girlfriend', 'husband', 'wife', 'dad', 'mom', 'father', 'mother', 'friend', 'someone', 'partner'];
    const matchedName = nameM[1].trim();
    if (!relationWords.includes(matchedName.toLowerCase())) {
      extractedName = matchedName;
    }
  }

  const recipientDetails = (extractedName || extractedAddress || extractedPhone) ? {
    name: extractedName,
    address: extractedAddress,
    phone: extractedPhone
  } : null;

  const isSinhala = isSinhalaMode || /[\u0D80-\u0DFF]/.test(query) || /\b(thaththa|thaththata|amma|ammata|malli|mallita|nangi|nangita|yaluwa|yaluwata|upandinaya|updandinaya|upandinayata|updandinayata|upadinaya|upadinayata|subha|suba|wachana|wording|one|wewa|wishes|mata|mage|oyata|oyage|keeyada|kiyada|keeyak|kiyak|gana|ganan|ganada|tiyenawada|thiyenawada|tiyeda|thiyeda|puluwanda|puluwada|yawanna|yavanna|denna|nadda|mokakda|mokadda)\b/i.test(query);

  // Clarification checks
  let requiresClarification = false;
  let clarificationPrompt: string | null = null;

  if (detectedIntent === 'recommend' && detectedCategory === 'all') {
    requiresClarification = true;
    clarificationPrompt = isSinhala 
      ? "ඔබ සොයන්නේ කුමන ආකාරයේ නිෂ්පාදනයක්ද? කේක්, මල් බූකේ, චොකලට්, ග්‍රොසරි හෝ තෑගි පැකේජ්?" 
      : "What type of product are you looking to send? Cakes, Flowers, Chocolates, Groceries, or Gift Packs?";
  } else if (detectedIntent === 'compose_greeting') {
    const hasRecipient = relationship !== null;
    const hasOccasion = occasion !== null;

    if (!hasRecipient || !hasOccasion) {
      requiresClarification = true;
      if (!hasRecipient && !hasOccasion) {
        clarificationPrompt = isSinhala
          ? "කාඩ්පත කා වෙනුවෙන්ද සහ අවස්ථාව කුමක්ද? ඔබට පෞද්ගලික මතකයන් හෝ සුරතල් නාමයන් ඇතුළත් කිරීමට අවශ්‍ය නම් ඒවාද සඳහන් කරන්න."
          : "Who is this note for, and what is the occasion? You can also share any nicknames, inside jokes, or memories to make it personal.";
      } else if (!hasRecipient) {
        const occDisplay = occasion === 'Birthday' ? (isSinhala ? 'උපන්දින' : 'birthday') : (occasion === 'Anniversary' ? (isSinhala ? 'සංවත්සර' : 'anniversary') : (isSinhala ? 'විශේෂ අවස්ථා' : 'celebration'));
        clarificationPrompt = isSinhala
          ? `මෙම ${occDisplay} කාඩ්පත කා වෙනුවෙන්ද? ඔබට පෞද්ගලික මතකයන් හෝ සුරතල් නාමයන් ඇතුළත් කිරීමට අවශ්‍ය නම් ඒවාද සඳහන් කරන්න.`
          : `Who is this ${occDisplay} card for? Feel free to share any nicknames, inside jokes, or memories to make it personal.`;
      } else {
        const relDisplay = relationship ? relationship : 'someone special';
        const relSinhalaMap: Record<string, string> = {
          'mother': 'අම්මා',
          'father': 'තාත්තා',
          'brother': 'මල්ලි/අයියා',
          'sister': 'නංගි/අක්කා',
          'friend': 'මිතුරා',
          'partner': 'ආදරණීයයා'
        };
        const relSinhala = relSinhalaMap[relDisplay] || relDisplay;
        clarificationPrompt = isSinhala
          ? `ඔබගේ ${relSinhala} ගේ කාඩ්පත සඳහා අවස්ථාව කුමක්ද? ඔබට පෞද්ගලික මතකයන් හෝ සුරතල් නාමයන් ඇතුළත් කිරීමට අවශ්‍ය නම් ඒවාද සඳහන් කරන්න.`
          : `What is the occasion for your ${relDisplay}'s card? Feel free to share any nicknames, inside jokes, or memories to make it personal.`;
      }
    }
  }

  let conversationalReply = city
    ? `Found some premium options deliverable to ${city} for ${recipient}. Renders are loaded on the visual layout.`
    : `Found some premium options for ${recipient}. Renders are loaded on the visual layout. Please select a delivery city and date on the right to verify availability.`;

  if (isSinhala) {
    const recipientSinhala: Record<string, string> = {
      'Mother': 'අම්මා',
      'Father': 'තාත්තා',
      'Brother': 'මල්ලි/අයියා',
      'Sister': 'නංගි/අක්කා',
      'Friend': 'මිතුරා',
      'Partner': 'ආදරණීයයා',
      'Someone Special': 'විශේෂ කෙනෙකු'
    };
    const citySinhala: Record<string, string> = {
      'Colombo': 'කොළඹ',
      'Kandy': 'මහනුවර',
      'Galle': 'ගාල්ල',
      'Negombo': 'මීගමුව',
      'Jaffna': 'යාපනය'
    };
    const categorySinhala: Record<string, string> = {
      'cakes': 'කේක්',
      'flowers': 'මල් බූකේ',
      'Chocolates': 'චොකලට්',
      'Grocery': 'ග්‍රොසරි (බඩු) පැකේජ්',
      'uniquegifts': 'විශේෂ තෑගි',
      'all': 'තෑගි'
    };

    const recDisplay = recipientSinhala[recipient] || recipient;
    const cityDisplay = city ? (citySinhala[city] || city) : null;
    const catDisplay = categorySinhala[detectedCategory] || 'තෑගි';

    conversationalReply = cityDisplay
      ? `${recDisplay} සඳහා ${cityDisplay} වෙත බෙදා හැරිය හැකි ප්‍රිමියම් ${catDisplay} වර්ග කිහිපයක් මෙන්න. විස්තර පහතින් බලාගත හැක.`
      : `${recDisplay} සඳහා ප්‍රිමියම් ${catDisplay} වර්ග කිහිපයක් මෙන්න. බෙදා හැරීමේ හැකියාව බැලීමට කරුණාකර දකුණු පසින් නගරය සහ දිනය තෝරන්න.`;

    if (detectedIntent === 'track_order') {
      conversationalReply = orderNumber 
        ? `ඇණවුම් අංක ${orderNumber} සඳහා තත්ත්වය පරීක්ෂා කරමින් පවතී. තහවුරු කිරීම සඳහා කරුණාකර ඔබගේ දුරකථන අංකය ලබා දෙන්න.`
        : `ඔබගේ ඇණවුම සොයා ගැනීමට කරුණාකර ඇණවුම් අංකය ලබා දෙන්න (උදා: ORD-12345).`;
    } else if (detectedIntent === 'check_delivery') {
      conversationalReply = `${cityDisplay} සඳහා බෙදා හැරීමේ ගාස්තු සහ ලැබීමේ හැකියාව පරීක්ෂා කරමින් පවතී.`;
    } else if (detectedIntent === 'get_product_info') {
      conversationalReply = `භාණ්ඩයේ විස්තර ඔබ වෙනුවෙන් පරීක්ෂා කරමින් පවතී.`;
    } else if (detectedIntent === 'add_to_cart') {
      const prodNameDisplay = productName || catDisplay;
      conversationalReply = `${prodNameDisplay} ඔබගේ කාර්ට් එකට එකතු කරමින් පවතී...`;
    } else if (detectedIntent === 'recommend') {
      const relDisplay = relationship ? (recipientSinhala[relationship] || relationship) : 'ආදරණීයයා';
      const occDisplay = occasion === 'Birthday' ? 'උපන්දිනය' : (occasion === 'Anniversary' ? 'විවාහ සංවත්සරය' : 'විශේෂ අවස්ථාව');
      conversationalReply = `ඔබගේ ${relDisplay} ගේ ${occDisplay} සඳහා නිර්දේශ කිහිපයක් මෙන්න.`;
    } else if (detectedIntent === 'compose_greeting') {
      conversationalReply = `ඔබ වෙනුවෙන් සුබපැතුම් පතක් සූදානම් කරමින් පවතී...`;
    } else if (detectedIntent === 'general') {
      conversationalReply = "කප්රුක Gifting Concierge වෙත සාදරයෙන් පිළිගනිමු! 🌸 ඔබගේ ආදරණීයයන්ට තෑගි යැවීමට, ඩිලිවරි ගාස්තු පරීක්ෂා කිරීමට හෝ ඇණවුම් සොයා ගැනීමට මට උදව් කළ හැක. ඔබට කුමක් කිරීමටද අවශ්‍ය?";
    }
  } else {
    if (detectedIntent === 'track_order') {
      conversationalReply = orderNumber 
        ? `Checking tracking status for order ${orderNumber}. Please provide your phone number for verification if you haven't already.`
        : `To track your order, please provide your order reference number (e.g. ORD-12345).`;
    } else if (detectedIntent === 'check_delivery') {
      conversationalReply = `Checking delivery rate and availability to ${city}.`;
    } else if (detectedIntent === 'get_product_info') {
      conversationalReply = `Checking product details for you.`;
    } else if (detectedIntent === 'add_to_cart') {
      conversationalReply = `Adding ${productName || 'product'} to your cart...`;
    } else if (detectedIntent === 'recommend') {
      conversationalReply = `Here are some recommendations for your ${relationship || 'recipient'}'s ${occasion || 'birthday'}.`;
    } else if (detectedIntent === 'compose_greeting') {
      conversationalReply = `Generating gift note options for you...`;
    } else if (detectedIntent === 'general') {
      conversationalReply = "Welcome to the Kapruka Gifting Concierge! 🌸 I am here to help you find the perfect gift, check delivery rates, compose greeting notes, or track your order. What would you like to do? You can try asking: \"Recommend a cake for my Father's birthday\" or \"Compose a greeting note\".";
    }
  }

  return {
    detectedIntent,
    detectedIntents,
    detectedCategory,
    cleanSearchTerm,
    requiresClarification,
    clarificationPrompt,
    extractedCriteria: {
      giftType,
      recipient,
      city,
      date
    },
    widgetData: {
      city: city,
      date,
      orderNumber,
      verificationPhone,
      productQuery: cleanSearchTerm,
      productName,
      quantity: 1,
      recipientDetails,
      occasion: occasion || (detectedIntent === 'recommend' ? 'Birthday' : null),
      tone: 'warm',
      relationship
    },
    conversationalReply
  };
}

export function isNegativeResponse(text: string): boolean {
  const clean = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "");
  
  // Direct exact matches of common negations
  const exactNegations = [
    'no', 'nothing', 'none', 'na', 'nah', 'no thanks', 'no thank you', 'not really', 'n/a', 'naa', 'no memories', 'no nicknames', 'no inside jokes', 'no special names', 'no memory', 'dont have', "don't have", 'nothing special',
    'නැහැ', 'නෑ', 'නැත', 'කිසිවක් නැත', 'පෞද්ගලික මතක නැත', 'මතක නැත', 'නෑ නැහැ', 'නෑනැහැ', 'නැහැනැහැ', 'නැති',
    'naha', 'nathi', 'naki', 'neh', 'nehe', 'ne', 'mukuth na', 'mukuth naha', 'kisith na', 'kisith naha', 'epa'
  ];

  if (exactNegations.includes(clean)) {
    return true;
  }

  // Regex patterns for negation phrases
  const patterns = [
    /\b(dont|don't|do not) have\b/i,
    /\bno (memories|memory|nickname|nicknames|inside jokes|special details|names|details)\b/i,
    /\bnothing (special|to add)\b/i,
    /\b(නැහැ|නෑ|නැත)\b/i,
    /\b(naha|nathi|nehe|epaa?)\b/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(clean)) {
      if (clean.length < 50) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Cleans user message to extract only actual personal memories/anecdotes,
 * removing relationship words, occasion names, action verbs, and structural phrasing.
 * Returns null if no custom memory/anecdote is found.
 */
export function extractCustomMemories(query: string, relationship?: string | null, occasion?: string | null): string | null {
  if (isNegativeResponse(query)) {
    return null;
  }

  let cleaned = query.toLowerCase();

  // Pattern of words to remove:
  // - Gifting/writing actions:
  cleaned = cleaned.replace(/(?:compose|write|generate|create|send|get|want|need|wording|words|message|note|card|text for the card|text for card|card text|greeting|wachana|one|yawanna|danna|hදන්න|ලියන්න)/gi, '');
  // - Relationship terms (English, Tanglish, Sinhala):
  cleaned = cleaned.replace(/(?:father|dad|thaththa|thaththata|පියා|තාත්තා|තාත්තට|mother|mom|amma|ammata|අම්මා|අම්මට|පියාණන්|පියාණන්ට|brother|malli|ayiya|mallita|ayyata|මල්ලි|අයියා|sister|nangi|akka|nangita|akkata|නංගි|අක්කා|friend|yaluwa|yaluwata|මිතුරා|යාලුවා|partner|love|husband|wife|gf|bf|sudoo|බිරිඳ|සැමියා|ආදරණීයයා)/gi, '');
  // - Occasion terms (English, Tanglish, Sinhala):
  cleaned = cleaned.replace(/(?:birthday|bday|upandinaya|updandinaya|upadinaya|updandinayata|upandinayata|upadinayata|උපන්දිනය|උපන්දින|anniversary|wedding|සංවත්සරය|anniversariya|retirement|විශ්‍රාම|graduation|උපාධි|valentines|valentine|christmas)/gi, '');
  // - Pronominal/prepositional noise:
  cleaned = cleaned.replace(/(?:for my|for|to my|to|my|it is for|on our|for our|on my|for my|his|her|our|we|our memory is|memory of|memories are|memories of|මට|මගේ|ඔබට|ඔයාට|සුබ|සුභ|wewa|වේවා)/gi, '');

  // Remove punctuation and extra whitespace
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If the remaining string is very short or empty, there is no custom memory.
  if (cleaned.length < 4) {
    return null;
  }

  // Bilingual filter: Strip shopping/product/action terms and common stop words to check if any actual anecdote remains
  let checkMemory = cleaned.replace(/(?:cake|keik|කේක්|flower|mal|මල්|rose|rosa|රෝස|chocolate|චොකලට්|recommend|suggest|නිර්දේශ|search|find|සොයන්න|order|ඇණවුම්|buy|මිලදී|show|පෙන්වන්න|add|cart|කාර්ට්|delivery|බෙදාහැරීමේ|rate|price|cost|මිල|ගාස්තු|how\s*much|keeyada|kiyada)/gi, '');
  const stopWordsPattern = /\b(?:i|a|an|the|and|or|but|if|then|else|me|you|we|he|she|it|they|us|him|her|them|my|your|his|her|its|our|their|mine|yours|ours|theirs|to|for|in|on|at|with|about|against|between|into|through|during|before|after|above|below|from|up|down|in|out|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|s|t|can|will|just|don|should|now|is|am|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|please|would|could|should|shall|must|may|might|mama|mage|mata|oba|obage|obata|oya|oyage|oyata|apa|ape|apata|eya|saha|ho|sadhaha|wetha|karunakara|puluwan|one|oni|atha|natha|na|naha|මම|මගේ|මට|ඔබ|ඔබේ|ඔබට|ඔයා|ඔයාගේ|ඔයාට|අප|අපේ|අපට|එය|එහි|සහ|හෝ|සඳහා|වෙත|කරුණාකර|පුළුවන්|ඕනෑ|ඇත|නැත)\b/gi;
  checkMemory = checkMemory.replace(stopWordsPattern, '');
  checkMemory = checkMemory.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '');
  checkMemory = checkMemory.replace(/\s+/g, ' ').trim();

  if (checkMemory.length < 4) {
    return null;
  }

  // Otherwise, return the original text but clean up some greeting commands from it so it reads as a memory
  let originalCleaned = query;
  const commandPattern = /(?:compose|write|generate|greeting|message|note|card|text for the card|text for card|card text|wording|words|wachana\s+one|wachana\s+oni)/gi;
  originalCleaned = originalCleaned.replace(commandPattern, '');
  
  // Clean relationship & occasion context
  const contextPattern = /(?:for my|for|to my|to|my)\s+(?:boyfriend's|girlfriend's|mother's|father's|mom's|dad's|brother's|sister's|husband's|wife's|boyfriend|girlfriend|mother|father|mom|dad|brother|sister|husband|wife|partner|friend|love)\s+(?:birthday|anniversary|wedding|retirement|special day)?/gi;
  originalCleaned = originalCleaned.replace(contextPattern, '');
  originalCleaned = originalCleaned.replace(/(?:it is for|on our|for our|on my|for my)\s+(?:birthday|anniversary|wedding|retirement)/gi, '');
  
  originalCleaned = originalCleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ').replace(/\s+/g, ' ').trim();

  return originalCleaned || null;
}
