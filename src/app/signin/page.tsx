import { signIn } from '@/auth';

export default async function SignInPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="bg-card border border-white/10 rounded-2xl p-8 w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-highlight))' }}>
                    Sign In
                </h1>
                <p className="text-muted text-center text-sm">Sign in to access your boards</p>
                <form action={async () => { 'use server'; await signIn('github', { redirectTo: '/' }); }}>
                    <button type="submit" className="w-full bg-card hover:bg-accent/40 border border-white/10 text-foreground px-4 py-2 rounded-xl transition-colors cursor-pointer font-medium">
                        Continue with GitHub
                    </button>
                </form>
                <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/' }); }}>
                    <button type="submit" className="w-full bg-card hover:bg-accent/40 border border-white/10 text-foreground px-4 py-2 rounded-xl transition-colors cursor-pointer font-medium">
                        Continue with Google
                    </button>
                </form>
            </div>
        </main>
    );
}
