export const TRANSPORT_MODES = ['public_transport', 'taxi', 'rental_car'] as const;

export const PUBLIC_TRANSPORT_TYPES = ['metro', 'bus', 'tram', 'train', 'ferry'] as const;

export const TRANSPORT_MODE_ICONS: Record<(typeof TRANSPORT_MODES)[number], string> = {
  public_transport: '🚇',
  taxi: '🚕',
  rental_car: '🚗',
};
