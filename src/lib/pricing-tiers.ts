// Hardcoded pricing tiers for coaching services

export const INITIAL_CONSULTATION_PRICE = 200;

export const PRICING_TIERS = [
  {
    id: 'basic',
    title: 'Basic Plan',
    description: 'Perfect for beginners who need occasional guidance',
    price_per_month: 50,
    sessions_per_month: 1,
    features: [
      '1 coaching session per month',
      '60-minute sessions',
      '1-on-1 personalized coaching',
      'Email support between sessions'
    ]
  },
  {
    id: 'standard',
    title: 'Standard Plan',
    description: 'Our most popular plan for consistent progress',
    price_per_month: 80,
    sessions_per_month: 2,
    features: [
      '2 coaching sessions per month',
      '60-minute sessions',
      '1-on-1 personalized coaching',
      'Email support between sessions',
      'Priority scheduling'
    ],
    isPopular: true
  },
  {
    id: 'premium',
    title: 'Premium Plan',
    description: 'Intensive coaching for rapid skill development',
    price_per_month: 120,
    sessions_per_month: 4,
    features: [
      '4 coaching sessions per month',
      '60-minute sessions',
      '1-on-1 personalized coaching',
      'Email support between sessions',
      'Priority scheduling',
      'Access to exclusive resources'
    ]
  }
]; 