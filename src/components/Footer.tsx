'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">
            DevFlow
          </Link>
          <div className="text-sm text-gray-400 flex items-center">
            <span className="ml-2">Based in Vancouver. Current temp: 17°C</span>
            <span className="ml-2">🌤️</span>
          </div>
        </div>
        
        <div className="flex gap-8 mt-4 md:mt-0 text-sm">
          <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of service
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
} 