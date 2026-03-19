import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const url = new URL('/', req.url);
  const response = NextResponse.redirect(url);
  
  response.cookies.delete('token');
  
  return response;
}
