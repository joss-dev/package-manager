import { Response } from 'express';

interface AuthCookiesOptions {
  accessToken: string;
  refreshToken: string;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}

export function setAuthCookies(
  res: Response,
  {
    accessToken,
    refreshToken,
    secure = false,
    sameSite = 'lax',
  }: AuthCookiesOptions,
) {
  const baseOptions = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };

  res.cookie('access_token', accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}
