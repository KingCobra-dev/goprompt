export const PRICING_PLANS = {
  free: {
    name: 'Starter',
    stripePriceId: {
      monthly: null,
      yearly: null,
    },
  },
  pro: {
    name: 'Pro',
    stripePriceId: {
      monthly: 'price_pro_monthly', // Replace with actual Stripe price ID
      yearly: 'price_pro_yearly', // Replace with actual Stripe price ID
    },
  },
}
