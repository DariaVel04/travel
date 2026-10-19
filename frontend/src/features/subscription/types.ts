import type { ISODateTime } from '@/types/common';

export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled';

export type BillingInterval = 'month' | 'year';

/** Which payment provider manages the subscription. None is connected yet. */
export type PaymentProvider = 'stripe' | 'paddle' | 'app_store' | 'google_play';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt?: ISODateTime;
  currentPeriodEnd?: ISODateTime;
  billingInterval?: BillingInterval;
  provider?: PaymentProvider;
  /** ID of the subscription inside the payment provider. */
  providerSubscriptionId?: string;
}

/** Features that can be limited by plan. Add Premium-only features here. */
export type AppFeature =
  | 'flight_search'
  | 'vacation_planner'
  | 'total_cost'
  | 'saved_trips'
  | 'shared_trips'
  | 'price_alerts'
  | 'price_prediction'
  | 'advanced_climate'
  | 'unlimited_ai_plans';

/** Numeric usage limits per plan. `null` means unlimited. */
export interface PlanLimits {
  aiPlansPerMonth: number | null;
  priceAlerts: number | null;
  savedTrips: number | null;
}
