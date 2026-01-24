// Stripe Plans Configuration
export const STRIPE_PLANS = {
  basico: {
    name: 'basico',
    displayName: 'Básico',
    description: 'Perfeito para começar a criar',
    price: 19.90,
    credits: 300,
    priceId: 'price_1StCaDDRKf7UQFHVuTxSRm0S',
    popular: false,
    features: [
      '300 créditos/mês',
      '100 imagens em 4K',
      '30 vídeos motion',
      'Suporte por email',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'Para criadores frequentes',
    price: 39.90,
    credits: 600,
    priceId: 'price_1StCaVDRKf7UQFHVAu1DzCHN',
    popular: true,
    features: [
      '600 créditos/mês',
      '200 imagens em 4K',
      '60 vídeos motion',
      'Suporte prioritário',
      'Renderização acelerada',
    ],
  },
  ultimate: {
    name: 'ultimate',
    displayName: 'Ultimate',
    description: 'Poder ilimitado de criação',
    price: 89.90,
    credits: 1200,
    priceId: 'price_1StCamDRKf7UQFHVSg5MBF77',
    popular: false,
    features: [
      '1.200 créditos/mês',
      '400 imagens em 4K',
      '120 vídeos motion',
      'Suporte VIP 24/7',
      'Renderização ultra-rápida',
      'Acesso antecipado a novos recursos',
    ],
  },
} as const;

// Credit costs
export const CREDIT_COSTS = {
  image: 3,
  video: 10,
} as const;

export type PlanName = keyof typeof STRIPE_PLANS;
