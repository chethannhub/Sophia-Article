import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import logo from '/logo.svg'; 

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black-900 text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image src={logo} alt="Logo" width={40} height={40} />
              <span className="hidden font-bold sm:inline-block text-xs">Sophia</span>
            </Link>
            <nav className="flex items-center space-x-6 text-xs font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
              <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About & Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2023 AI News Hub. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-4">
              <Link href="/terms" className="text-sm hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
