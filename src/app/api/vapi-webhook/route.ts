// app/api/vapi-webhook/route.ts
import { NextResponse } from 'next/server';
import { handleCallReport } from '@/actions/vapi';

export async function POST(request: Request) {
  try {
    const message = await request.json();

    switch (message.type) {
     

      case 'end-of-call-report':
        await handleCallReport(message);
        break;

      case 'tool-calls':
        return NextResponse.json({ result: "Function response" });

      case 'transcript':
        break;

      default:
        console.warn('Unhandled message type:', message.type);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
