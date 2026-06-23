import { describe, it, expect } from 'vitest';
import { localFallbackParse } from '../lib/gifting-helpers';

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
    expect(res.extractedCriteria.recipient).toBe('Mother');
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
    expect(res.extractedCriteria.recipient).toBe('Father');
    expect(res.conversationalReply).toContain('තාත්තා');
    expect(res.conversationalReply).toContain('චොකලට්');
  });

  it('correctly parses Singlish queries for mother and cakes', () => {
    const res = localFallbackParse('send a cake to my ammata in Galle');
    expect(res.detectedIntent).toBe('search');
    expect(res.detectedCategory).toBe('cakes');
    expect(res.extractedCriteria.recipient).toBe('Mother');
    expect(res.extractedCriteria.city).toBe('Galle');
  });

  it('correctly parses Tanglish question for delivery rate', () => {
    const res = localFallbackParse('delivery negombo gana keeyada?');
    expect(res.detectedIntent).toBe('check_delivery');
    expect(res.extractedCriteria.city).toBe('Negombo');
    expect(res.conversationalReply).toContain('මීගමුව');
    expect(res.conversationalReply).toContain('බෙදා හැරීමේ ගාස්තු');
  });
});
