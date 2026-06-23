import { describe, it, expect } from 'vitest';
import { generateGreetings } from '../lib/gifting-helpers';

describe('generateGreetings helper', () => {
  it('generates three personalized birthday messages for a Father', () => {
    const greetings = generateGreetings('Father', 'birthday', 'warm', 'our fishing trip');
    expect(greetings).toHaveLength(3);
    
    expect(greetings[0]).toContain('Happy Birthday, Father!');
    expect(greetings[0]).toContain('our fishing trip');
    expect(greetings[1]).toContain('To the best Father in the world');
    expect(greetings[1]).toContain('our fishing trip');
  });

  it('generates customized messages for a partner / spouse', () => {
    const greetings = generateGreetings('Partner', 'birthday', 'romantic', 'our trip to Galle');
    expect(greetings).toHaveLength(3);
    
    expect(greetings[0]).toContain('Happy Birthday, my love!');
    expect(greetings[0]).toContain('our trip to Galle');
  });

  it('generates custom wedding anniversary messages', () => {
    const greetings = generateGreetings('Wife', 'anniversary', 'romantic', 'our wedding day');
    expect(greetings).toHaveLength(3);
    
    expect(greetings[0]).toContain('Happy Anniversary, Wife!');
    expect(greetings[0]).toContain('our wedding day');
  });

  it('generates general fallback messages when occasion is vague', () => {
    const greetings = generateGreetings('Friend', null, 'warm', null);
    expect(greetings).toHaveLength(3);
    expect(greetings[0]).toContain('Sending you this special gift, Friend');
  });
});
