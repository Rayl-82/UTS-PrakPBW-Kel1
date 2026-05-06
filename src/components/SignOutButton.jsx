'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton({ isMinimized }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={`transition-colors ${isMinimized ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-[#E8520A]'}`}
      aria-label="Sign Out"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
