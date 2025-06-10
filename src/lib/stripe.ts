
// Configuração do Stripe
export const STRIPE_PUBLIC_KEY = 'pk_test_51QvrlcPXpiLbJ63CdDOl4ar9noPpLD283UdtoDRDWovqlPV9ytOqTMJWD5TkzXgG48aZKPFPJHCj5r9Dle9ZOzjG00qsKa8lep';

// Produtos e preços do Stripe para as assinaturas BelezaSmart
export const STRIPE_PRICES = {
  AUTONOMO: {
    priceId: 'price_1RY6qLPXpiLbJ63CnoCv4uFr',
    productId: 'prod_ST2wd0ajLdSdQd',
    name: 'Autônomo',
    price: 55,
    currency: 'BRL'
  },
  BASICO: {
    priceId: 'price_1RY6qkPXpiLbJ63CKRaxvAkW',
    productId: 'prod_ST2w4cqgF3uzuh',
    name: 'Básico',
    price: 120,
    currency: 'BRL'
  },
  PREMIUM: {
    priceId: 'price_1RY6n5PXpiLbJ63Ccqpicdz9',
    productId: 'prod_ST2sKIC8byJruR',
    name: 'Premium',
    price: 250,
    currency: 'BRL'
  }
} as const;

export type StripePlanType = keyof typeof STRIPE_PRICES;
