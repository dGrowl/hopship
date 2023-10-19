import { NextRequest, NextResponse } from 'next/server'

const cookieOptions = {
  maxAge: 0,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV !== 'development',
} as const

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.clone()
  url.pathname = '/'
  url.search = ''
  const res = NextResponse.redirect(url)
  res.cookies.set('auth', '0', cookieOptions)
  res.cookies.set('csrf', '0', cookieOptions)
  return res
}
