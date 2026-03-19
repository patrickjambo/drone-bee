import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, you would save this to your database via Prisma
    // or send an email notification to the sales team.
    // e.g. await prisma.wholesaleRequest.create({ data: body });
    
    console.log("Wholesale Request Received In Realtime:", body);
    
    // Simulating delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json(
      { success: true, message: 'Your wholesale request has been received successfully.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
