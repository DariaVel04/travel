import type { AppFeature, PlanLimits, SubscriptionPlan, UserSubscription } from './types';

/**
 * Single source of truth for what each plan can do.
 * Values are placeholders until the commercial model is finalised.
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, readonly AppFeature[]> = {
  free: ['flight_search', 'vacation_planner', 'total_cost', 'saved_trips'],
  premium: [
    'flight_search',
    'vacation_planner',
    'total_cost',
    'saved_trips',
    'shared_trips',
    'price_alerts',
    'price_prediction',
    'advanced_climate',
    'unlimited_ai_plans',
  ],
};

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: { aiPlansPerMonth: 3, priceAlerts: 1, savedTrips: 5 },
  premium: { aiPlansPerMonth: null, priceAlerts: null, savedTrips: null },
};

/** Used for anonymous visitors and users without a paid plan. */
export const FREE_SUBSCRIPTION: UserSubscription = { plan: 'free', status: 'active' };

export function isSubscriptionActive(subscription: UserSubscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trial';
}

/** An inactive or cancelled Premium subscription falls back to Free. */
export function getEffectivePlan(subscription: UserSubscription): SubscriptionPlan {
  return isSubscriptionActive(subscription) ? subscription.plan : 'free';
}

export function hasFeatureAccess(subscription: UserSubscription, feature: AppFeature): boolean {
  return PLAN_FEATURES[getEffectivePlan(subscription)].includes(feature);
}
