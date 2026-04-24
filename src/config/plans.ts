// Stripe Plans Configuration — posicionamento PREMIUM (criadores pro/agências)
// TODO: criar os 3 novos preços no Stripe (R$ 49 / R$ 99 / R$ 199) e atualizar
// os priceIds abaixo. Os IDs atuais ainda apontam para os preços antigos.
export const STRIPE_PLANS = {
  basico: {
    name: 'basico',
    displayName: 'Básico',
    description: 'Para criadores começando',
    price: 49.90,
    credits: 300,
    priceId: 'price_1StEtHDRKf7UQFHVmH1l2ZT7', // TODO: substituir pelo novo price_id de R$ 49
    popular: false,
    features: [
      '300 créditos por mês',
      '~75 imagens em alta qualidade',
      '~16 vídeos Kling padrão',
      '~8 vídeos Motion Control 2.6 Std',
      'Suporte por email',
    ],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'Para criadores frequentes',
    price: 99.90,
    credits: 700,
    priceId: 'price_1StEuaDRKf7UQFHVv2M4bBUI', // TODO: substituir pelo novo price_id de R$ 99
    popular: true,
    features: [
      '700 créditos por mês',
      '~175 imagens em alta qualidade',
      '~38 vídeos Kling padrão',
      '~20 vídeos Motion Control 2.6 Std',
      'Renderização prioritária',
      'Suporte prioritário',
    ],
  },
  ultimate: {
    name: 'ultimate',
    displayName: 'Ultimate',
    description: 'Para profissionais e agências',
    price: 199.90,
    credits: 1500,
    priceId: 'price_1StEveDRKf7UQFHVzVIO4NEC', // TODO: substituir pelo novo price_id de R$ 199
    popular: false,
    features: [
      '1.500 créditos por mês',
      '~375 imagens em alta qualidade',
      '~83 vídeos Kling padrão',
      '~42 vídeos Motion Control 2.6 Std',
      '~7 vídeos Motion Control 3.0 Pro',
      'Renderização ultra-rápida',
      'Suporte VIP dedicado',
      'Acesso antecipado a novos recursos',
    ],
  },
} as const;

// Credit costs (calibrados pra cobrir custo real + margem ~80%)
// Imagem: $0.039 ≈ R$ 0,20 → cobramos 4 cr (R$ 0,56) → margem +180%
// Vídeo Kling 2.1 5s: $0.28 ≈ R$ 1,40 → cobramos 18 cr (R$ 2,52) → margem +80%
export const CREDIT_COSTS = {
  image: 4,
  video: 18,
} as const;

export type PlanName = keyof typeof STRIPE_PLANS;
