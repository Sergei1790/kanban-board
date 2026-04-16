import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from '@/auth';
import Image from 'next/image';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Project management board",
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  const session = await auth();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <span className="font-semibold text-lg bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-highlight))' }}>
            Kanban Board
          </span>
          {session?.user && (
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2">
              {session.user.image && (
                <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
              )}
              <span className="text-muted text-sm">{session.user.name}</span>
              <form action={async () => { 'use server'; await signOut(); }}>
                <button type="submit" className="text-muted hover:text-foreground text-sm cursor-pointer transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
