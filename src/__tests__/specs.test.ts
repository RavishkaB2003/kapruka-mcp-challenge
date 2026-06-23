import { describe, it, expect } from 'vitest';
import { getIngredientsForProduct, getAllergensForProduct } from '../lib/gifting-helpers';

describe('product specifications helpers', () => {
  describe('getIngredientsForProduct', () => {
    it('returns correct cake ingredients', () => {
      const ingredients = getIngredientsForProduct('Chocolate Fudge Cake', 'cakes');
      expect(ingredients).toContain('Premium Flour');
      expect(ingredients).toContain('Organic Sugar');
      expect(ingredients).toContain('Farm Eggs');
    });

    it('returns correct chocolate ingredients', () => {
      const ingredients = getIngredientsForProduct('Ferrero Rocher Box', 'Chocolates');
      expect(ingredients).toContain('Cocoa Butter');
      expect(ingredients).toContain('Roasted Hazelnuts');
    });

    it('returns correct flower specifications', () => {
      const ingredients = getIngredientsForProduct('Eternal Romance Bouquet', 'flowers');
      expect(ingredients).toContain('Fresh Local Roses');
      expect(ingredients).toContain('Baby\'s Breath');
    });

    it('returns default ingredients for unknown categories', () => {
      const ingredients = getIngredientsForProduct('Generic Item', 'others');
      expect(ingredients).toContain('Premium Ingredients');
    });
  });

  describe('getAllergensForProduct', () => {
    it('identifies cake allergens', () => {
      const allergens = getAllergensForProduct('Ribbon Cake', 'cakes');
      expect(allergens).toContain('Gluten');
      expect(allergens).toContain('Dairy');
      expect(allergens).toContain('Eggs');
    });

    it('identifies chocolate allergens', () => {
      const allergens = getAllergensForProduct('Dark Chocolate Truffles', 'Chocolates');
      expect(allergens).toContain('Dairy');
      expect(allergens).toContain('Soy');
      expect(allergens).toContain('Nuts');
    });

    it('identifies pollen allergen for flowers', () => {
      const allergens = getAllergensForProduct('White Lilies Vase', 'flowers');
      expect(allergens).toContain('Pollen');
    });

    it('returns empty list for grocery items', () => {
      const allergens = getAllergensForProduct('Fruit Hamper', 'Grocery');
      expect(allergens).toHaveLength(0);
    });
  });
});
