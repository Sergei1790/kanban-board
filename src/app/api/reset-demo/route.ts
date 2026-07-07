import seedDemo from '@/lib/seedDemo';

export async function GET(request: Request){
    const secret = new URL(request.url).searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    const valid = 
        secret === process.env.CRON_SECRET ||
        authHeader === `Bearer ${process.env.CRON_SECRET}`;
    if(!valid) {
        return new Response('Unauthorized', {status: 401});
    }
    await seedDemo();
    return Response.json({ok: true, message: 'Demo reset'})
}