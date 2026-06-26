import { describe, it, expect } from 'vitest';
import { localFallbackParse, extractCustomMemories, parseRelativeDate } from '../lib/gifting-helpers';

describe('localFallbackParse intent parsing', () => {
  it('correctly maps compose_greeting intent patterns', () => {
    const res1 = localFallbackParse('compose a greeting card message');
    expect(res1.detectedIntent).toBe('compose_greeting');

    const res2 = localFallbackParse('write a birthday note for my dad');
    expect(res2.detectedIntent).toBe('compose_greeting');
  });

  it('correctly maps check_delivery intent patterns', () => {
    const res1 = localFallbackParse('can we deliver to Galle tomorrow?');
    expect(res1.detectedIntent).toBe('check_delivery');
    expect(res1.extractedCriteria.city).toBe('Galle');

    const res2 = localFallbackParse('what is the delivery rate to Kandy?');
    expect(res2.detectedIntent).toBe('check_delivery');
    expect(res2.extractedCriteria.city).toBe('Kandy');
  });

  it('correctly maps track_order intent patterns', () => {
    const res = localFallbackParse('where is my order ORD-12345?');
    expect(res.detectedIntent).toBe('track_order');
    expect(res.widgetData.orderNumber).toBe('ORD-12345');
  });

  it('correctly maps add_to_cart intent patterns', () => {
    const res = localFallbackParse('add Belgian Chocolate Decadence Fudge Cake to my cart');
    expect(res.detectedIntent).toBe('add_to_cart');
    expect(res.widgetData.productName?.toLowerCase()).toContain('belgian chocolate decadence fudge cake');
  });

  it('extracts recipient and relationship details', () => {
    const res = localFallbackParse('send a cake to my mother in Negombo');
    expect(res.extractedCriteria.recipient).toBe('Mom');
    expect(res.extractedCriteria.city).toBe('Negombo');
    expect(res.widgetData.relationship).toBe('mother');
  });

  it('extracts recipient name, phone and address details from text for prefilling', () => {
    const query = 'recipient details: Amal Perera, 45 Galle Road Colombo, 0777123456';
    const res = localFallbackParse(query);
    expect(res.widgetData.recipientDetails).not.toBeNull();
    expect(res.widgetData.recipientDetails?.name).toBe('Amal Perera');
    expect(res.widgetData.recipientDetails?.address).toBe('45 Galle Road Colombo');
    expect(res.widgetData.recipientDetails?.phone).toBe('0777123456');
  });

  it('returns general intent for vague questions', () => {
    const res = localFallbackParse('hello concierge');
    expect(res.detectedIntent).toBe('general');
  });

  it('correctly parses Sinhala queries for father and chocolates', () => {
    const res = localFallbackParse('මට මගේ තාත්තට චොකලට් එකක් ඕන.');
    expect(res.detectedIntent).toBe('search');
    expect(res.detectedCategory).toBe('Chocolates');
    expect(res.extractedCriteria.recipient).toBe('Dad');
    expect(res.conversationalReply).toContain('තාත්තා');
    expect(res.conversationalReply).toContain('චොකලට්');
  });

  it('correctly parses Singlish queries for mother and cakes', () => {
    const res = localFallbackParse('send a cake to my ammata in Galle');
    expect(res.detectedIntent).toBe('search');
    expect(res.detectedCategory).toBe('cakes');
    expect(res.extractedCriteria.recipient).toBe('Mom');
    expect(res.extractedCriteria.city).toBe('Galle');
  });

  it('correctly parses Tanglish question for delivery rate', () => {
    const res = localFallbackParse('delivery negombo gana keeyada?');
    expect(res.detectedIntent).toBe('check_delivery');
    expect(res.extractedCriteria.city).toBe('Negombo');
    expect(res.conversationalReply).toContain('මීගමුව');
    expect(res.conversationalReply).toContain('බෙදා හැරීමේ ගාස්තු');
  });

  it('correctly parses girlfriend/boyfirend with typos and resolves to Lover', () => {
    const res = localFallbackParse('i forgot my girlfirends birthday and i want flowers');
    expect(res.extractedCriteria.recipient).toBe('Lover');
    expect(res.widgetData.relationship).toBe('lover');
    expect(res.conversationalReply).toContain("Don't panic"); // empathetic persona
  });

  it('correctly parses Tanglish recommend query for friend cake to Colombo', () => {
    const res = localFallbackParse('mge yaluwata upandinayakata chocolate cake ekak yawanna colombo walata');
    expect(res.detectedIntent).toBe('recommend');
    expect(res.extractedCriteria.recipient).toBe('Friend');
    expect(res.extractedCriteria.city).toBe('Colombo');
  });

  it('extractCustomMemories returns null when no anecdote is present, even with name/nickname and shopping details', () => {
    const query = 'i want a cake and a greeting card for my dads birthday. his name is hasitha and we call him Hasiya recommend me a cake';
    const memory = extractCustomMemories(query, 'father', 'birthday', 'Hasiya');
    expect(memory).toBeNull();
  });

  it('extractCustomMemories extracts clean anecdote when present, filtering out name/nickname and shopping phrases', () => {
    const query = 'i want a cake and a greeting card for my dads birthday. his name is hasitha. we always went fishing together when I was young. recommend me a cake';
    const memory = extractCustomMemories(query, 'father', 'birthday', 'hasitha');
    expect(memory).toBe('we always went fishing together when I was young');
  });

  it('localFallbackParse extracts recipientName and passes it to customMemory extraction', () => {
    const query = 'write a card for my dad birthday his name is hasitha and we call him Hasiya';
    const res = localFallbackParse(query);
    expect(res.widgetData.recipientName).toBe('Hasiya');
    expect(res.widgetData.customMemory).toBeNull(); // name/nickname details should not leak into customMemory
  });

  describe('parseRelativeDate and localFallbackParse date resolution', () => {
    const baseDate = '2026-06-25'; // Thursday

    it('resolves tomorrow correctly', () => {
      const date = parseRelativeDate('check delivery for tomorrow', baseDate);
      expect(date).toBe('2026-06-26');
    });

    it('resolves today correctly', () => {
      const date = parseRelativeDate('check delivery for today', baseDate);
      expect(date).toBe('2026-06-25');
    });

    it('resolves upcoming Sunday correctly', () => {
      // 2026-06-25 is Thursday. Sunday of the same week is 2026-06-28.
      const date = parseRelativeDate('check delivery for Sunday', baseDate);
      expect(date).toBe('2026-06-28');
    });

    it('resolves next Sunday correctly', () => {
      // "next Sunday" is Sunday of the following week: 2026-07-05.
      const date = parseRelativeDate('check delivery for next Sunday', baseDate);
      expect(date).toBe('2026-07-05');
    });

    it('resolves Sinhala tomorrow (heta) correctly', () => {
      const date = parseRelativeDate('heta delivery puluwanda', baseDate);
      expect(date).toBe('2026-06-26');
    });

    it('resolves Sinhala next Sunday (labana irida) correctly', () => {
      const date = parseRelativeDate('labana irida cake ekak ganna puluwanda', baseDate);
      expect(date).toBe('2026-07-05');
    });

    it('localFallbackParse integrates relative date resolution', () => {
      const res = localFallbackParse('recommend a cake for Galle next Sunday', false, baseDate);
      expect(res.extractedCriteria.date).toBe('2026-07-05');
      expect(res.widgetData.date).toBe('2026-07-05');
    });
  });

  describe('bereavement and condolences logic', () => {
    it('correctly maps bereavement query in English to flowers category and respectful reply', () => {
      const res = localFallbackParse('i just lost my dad and i m feeling sad.');
      expect(res.detectedCategory).toBe('flowers');
      expect(res.extractedCriteria.giftType).toBe('Flowers');
      expect(res.extractedCriteria.recipient).toBe('Dad');
      expect(res.conversationalReply).toContain('sorry for your loss');
      expect(res.conversationalReply).not.toContain('cake');
    });

    it('correctly maps bereavement query in Sinhala to flowers category and respectful reply', () => {
      const res = localFallbackParse('මගේ අම්මා මියගියා මල් බූකේ එකක් ඕන');
      expect(res.detectedCategory).toBe('flowers');
      expect(res.extractedCriteria.giftType).toBe('Flowers');
      expect(res.extractedCriteria.recipient).toBe('Mom');
      expect(res.conversationalReply).toContain('වියෝව පිළිබඳව මගේ බලවත් කණගාටුව');
    });

    it('correctly maps bereavement query in Tanglish to flowers category and respectful reply', () => {
      const res = localFallbackParse('mage yaluwage thaththa නැතිවුණා malthiyenawada');
      expect(res.detectedCategory).toBe('flowers');
      expect(res.extractedCriteria.giftType).toBe('Flowers');
      expect(res.conversationalReply).toContain('වියෝව පිළිබඳව මගේ බලවත් කණගාටුව');
    });
  });

  describe('situation detection and fallback recommendations', () => {
    it('detects party situation and recommends appropriate categories and mock products', () => {
      const res = localFallbackParse('im going to have a party and i need things');
      expect(res.situation).toBe('party');
      expect(res.recommendedProductIds).toContain('MOCK_CAKE_1');
      expect(res.recommendedProductIds).toContain('MOCK_CHOC_1');
      expect(res.fallbackCategories).toContain('cakes');
      expect(res.fallbackCategories).toContain('Chocolates');
      expect(res.conversationalReply).toContain('party');
      expect(res.conversationalReply).toContain('cakes and chocolates');
    });

    it('detects home situation and recommends appropriate categories and mock products in Sinhala', () => {
      const res = localFallbackParse('මම අලුත් ගෙදරකට තෑග්ගක් යවන්න ඕන');
      expect(res.situation).toBe('home');
      expect(res.recommendedProductIds).toContain('MOCK_GROC_1');
      expect(res.fallbackCategories).toContain('Grocery');
      expect(res.conversationalReply).toContain('නිවසකට');
      expect(res.conversationalReply).toContain('පලතුරු');
    });

    it('detects get_well situation and recommends appropriate categories and mock products in English', () => {
      const res = localFallbackParse('my friend is in the hospital and i want to send some things');
      expect(res.situation).toBe('get_well');
      expect(res.recommendedProductIds).toContain('MOCK_GROC_1');
      expect(res.recommendedProductIds).toContain('MOCK_FLOW_3');
      expect(res.fallbackCategories).toContain('Grocery');
      expect(res.fallbackCategories).toContain('flowers');
      expect(res.conversationalReply).toContain('feeling well');
      expect(res.conversationalReply).toContain('fresh fruits');
    });

    it('detects romance situation and recommends appropriate categories and mock products in Tanglish', () => {
      const res = localFallbackParse('baba deepu love ekata deepu sweet cake ekak rose bouquet ekak oni');
      expect(res.situation).toBe('romance');
      expect(res.recommendedProductIds).toContain('MOCK_FLOW_1');
      expect(res.recommendedProductIds).toContain('MOCK_CHOC_1');
      expect(res.fallbackCategories).toContain('flowers');
      expect(res.fallbackCategories).toContain('Chocolates');
      expect(res.conversationalReply).toContain('රෝස මල්');
    });
  });
});
