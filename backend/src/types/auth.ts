import type { SubscriptionPlan, UserStatus } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
}
