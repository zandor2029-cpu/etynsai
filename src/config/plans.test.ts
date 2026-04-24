import { describe, it, expect } from 'vitest';
import {
  STRIPE_PLANS,
  EXPECTED_PLAN_VALUES,
  validatePlans,
  type PlanName,
} from './plans';

describe('STRIPE_PLANS sync with EXPECTED_PLAN_VALUES', () => {
  it('validatePlans() retorna zero erros', () => {
    const errors = validatePlans();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  (Object.keys(EXPECTED_PLAN_VALUES) as PlanName[]).forEach((key) => {
    const expected = EXPECTED_PLAN_VALUES[key];

    describe(`plano "${key}"`, () => {
      it(`preço deve ser R$ ${expected.price.toFixed(2)}`, () => {
        expect(STRIPE_PLANS[key].price).toBe(expected.price);
      });

      it(`créditos devem ser ${expected.credits}`, () => {
        expect(STRIPE_PLANS[key].credits).toBe(expected.credits);
      });

      it('possui priceId configurado', () => {
        expect(STRIPE_PLANS[key].priceId).toMatch(/^price_/);
      });
    });
  });

  it('possui exatamente os 3 planos esperados', () => {
    expect(Object.keys(STRIPE_PLANS).sort()).toEqual(
      ['basico', 'pro', 'ultimate'],
    );
  });

  it('apenas um plano marcado como popular', () => {
    const populars = Object.values(STRIPE_PLANS).filter((p) => p.popular);
    expect(populars).toHaveLength(1);
  });
});