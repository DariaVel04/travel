import { createHash, randomBytes } from 'node:crypto';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { CookieOptions, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import type { ChangePasswordInput, LoginInput, RegisterInput, UpdateProfileInput } from '../schemas/auth.js';
import type { PublicUser } from '../types/auth.js';
import { HttpError } from '../utils/httpError.js';

export const SESSION_COOKIE = 'atp_sid';
const SESSION_DAYS = 14;
const BCRYPT_ROUNDS = 10;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  signed: true,
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    subscriptionPlan: user.subscriptionPlan,
    createdAt: user.createdAt.toISOString(),
  };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, cookieOptions);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    signed: true,
  });
}

async function createSession(userId: string, res: Response): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  setSessionCookie(res, token);
}

export async function register(input: RegisterInput, res: Response): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    },
  });

  await createSession(user.id, res);
  return toPublicUser(user);
}

export async function login(input: LoginInput, res: Response): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordOk = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

  if (!user || !passwordOk || user.status !== 'ACTIVE') {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  await createSession(user.id, res);
  return toPublicUser(user);
}

export async function logout(token: string | undefined, res: Response): Promise<void> {
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  clearSessionCookie(res);
}

export async function userFromSessionToken(token: string | undefined): Promise<PublicUser | undefined> {
  if (!token) return undefined;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return undefined;
  }

  if (session.user.status !== 'ACTIVE') return undefined;
  return toPublicUser(session.user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
  if (input.email) {
    const taken = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
    },
  });

  return toPublicUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found');

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS) },
  });
}
