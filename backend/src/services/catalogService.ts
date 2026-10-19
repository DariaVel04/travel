import { prisma } from '../config/prisma.js';
import type { AccommodationResponse, TransportResponse } from '../types/api.js';
import { toAccommodationResponse, toTransportResponse } from '../utils/mappers.js';

export async function listAccommodations(): Promise<AccommodationResponse[]> {
  const rows = await prisma.accommodation.findMany({ orderBy: { updatedAt: 'desc' } });
  return rows.map(toAccommodationResponse);
}

export async function listTransport(): Promise<TransportResponse[]> {
  const rows = await prisma.transport.findMany({ orderBy: { updatedAt: 'desc' } });
  return rows.map(toTransportResponse);
}
