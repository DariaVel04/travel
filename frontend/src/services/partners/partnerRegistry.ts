import { MOCK_PARTNERS } from '@/mocks/partners';
import type { Partner } from '@/types/partner';

/** Looks up partner config. Will load from the backend once partners are managed there. */
export function getPartner(partnerId: string): Partner | undefined {
  return MOCK_PARTNERS.find((partner) => partner.id === partnerId && partner.isActive);
}
