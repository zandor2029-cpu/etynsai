// Stripe Plans Configuration
export const STRIPE_PLANS = {
  basico: {
    name: 'basico',
    displayName: 'Básico',
    description: 'Perfeito para começar a criar',
    price: 29.90,
    credits: 300,
    priceId: 'price_1StEtHDRKf7UQFHVmH1l2ZT7',
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
    price: 59.90,
    credits: 600,
    priceId: 'price_1StEuaDRKf7UQFHVv2M4bBUI',
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
    price: 119.90,
    credits: 1200,
    priceId: 'price_1StEveDRKf7UQFHVzVIO4NEC',
    popular: false,
    features: [
      '🔥 IMAGENS ILIMITADAS',
      '1.200 créditos/mês',
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
