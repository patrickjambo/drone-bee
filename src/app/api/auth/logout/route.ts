import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }
}
