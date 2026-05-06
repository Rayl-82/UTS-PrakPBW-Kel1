'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckSquare, BookOpen, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import SignOutButton from './SignOutButton';
import { TomatoIcon } from './PomodoroPage';

const HarikuLogo = ({ width = 24, color = "#D74C0B" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" 
    width={width} height={width * 1.45} 
    viewBox="23.5 14 19.5 29" fill="none">
    <path d="M40.0156 18C39.3887 18 38.7793 18.252 38.3047 18.7266L38.2344 18.7969L37.7656 18.3516L25.3906 30.7266L25.3438 30.9609L24.5234 35.0859L24.2891 36.1875L25.3906 35.9531L29.5156 35.1328L29.75 35.0859L42.125 22.7109L41.6797 22.2656L41.7266 22.2188L41.75 22.1719C42.6992 21.2227 42.6992 19.6758 41.75 18.7266C41.2754 18.252 40.6426 18 40.0156 18ZM40.0156 19.4766C40.25 19.4766 40.4961 19.582 40.6953 19.7812C41.0967 20.1826 41.0967 20.7158 40.6953 21.1172L40.625 21.1875L39.2891 19.8516L39.3594 19.7812C39.5586 19.582 39.7812 19.4766 40.0156 19.4766ZM37.7891 20.4609L40.0156 22.6875L38.9375 23.7891L36.6875 21.5391L37.7891 20.4609ZM35.6562 22.6172L37.8594 24.8203L30.0312 32.6719L29.7266 31.3125L29.6328 30.8438L29.1641 30.75L27.8047 30.4453L35.6562 22.6172ZM26.7266 31.7344L28.3672 32.1094L28.7422 33.75L27.2188 34.0547L26.4219 33.2578L26.7266 31.7344Z" 
      fill={color}/>
    <path d="M24 36.9766C24 36.9766 38.3249 42.4342 38 36.9766C37.8857 35.0569 35.5 32.4766 35.5 32.4766" 
      stroke={color}/>
    <path d="M28.5001 25C24.5884 20.9026 23.9704 16.271 33.5001 14.5" 
      stroke={color}/>
    <path d="M29.9916 23.5C27.1952 20.2197 26.8041 19.3772 30.5002 17.5" 
      stroke={color}/>
    <path d="M34 34C36.5726 36.8178 36.3656 38.1821 31 37" 
      stroke={color}/>
  </svg>
)

export default function SidebarWrapper({ defaultMinimized = false, serverUser = null }) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const pathname = usePathname();
  const { data: session } = useSession();
  // Use serverUser for instant render; fall back to live session once loaded
  const user = session?.user ?? serverUser;

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    // Store in cookie so server can read it on next navigation
    document.cookie = `sidebarMinimized=${next}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const navItems = [
    { href: '/', label: 'Tasks', icon: CheckSquare },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/expenses', label: 'Expenses', icon: Wallet },
    { href: '/timer', label: 'Pomodoro', icon: TomatoIcon },
  ];

  return (
    <div className={`hidden md:flex flex-col h-full border-r relative z-40 transition-all duration-300 ${
      isMinimized ? 'w-20 bg-[#E8520A] border-[#E8520A]' : 'w-60 bg-surface border-border-color'
    }`}>
      {/* Brand */}
      <div className="h-20 flex items-center relative overflow-hidden flex-shrink-0">
        <div className="absolute left-[31px] transition-opacity duration-300 flex items-center justify-center">
          <HarikuLogo width={18} color={isMinimized ? "white" : "#D74C0B"} />
        </div>
        <span className={`absolute left-[54px] font-serif tracking-wide font-semibold text-2xl text-[#D74C0B] whitespace-nowrap transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          Hariku
        </span>
      </div>

      {/* Minimize Toggle — folder tab sticking out */}
      <button
        onClick={toggleMinimize}
        className={`absolute top-0 w-10 h-16 flex items-center justify-center transition-all duration-300 z-50 rounded-br-lg border-b border-r focus:outline-none ${
          isMinimized
            ? 'bg-[#E8520A] border-[#E8520A] text-white hover:bg-[#D74C0B] hover:border-[#D74C0B]'
            : 'bg-surface border-border-color text-gray-400 hover:text-primary hover:bg-gray-50'
        }`}
        style={{ right: '-39px' }}
        title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
      >
        {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation — Icons are absolutely positioned to stay perfectly still */}
      <nav className="flex-1 py-2 space-y-1 px-2 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={`h-10 relative rounded-lg transition-colors flex items-center overflow-hidden border-l-2 ${
              isActive(href)
                ? (isMinimized
                    ? 'bg-white/20 text-white border-transparent'
                    : 'bg-[#FDF0EA] text-[#E8520A] border-[#E8520A]')
                : (isMinimized
                    ? 'text-white/70 hover:bg-white/10 hover:text-white border-transparent'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent')
            }`}
            title={isMinimized ? label : undefined}
          >
            <div className="absolute left-[20px] flex items-center justify-center">
              <Icon className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className={`absolute left-[52px] font-medium whitespace-nowrap transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {label}
            </span>
          </a>
        ))}
      </nav>

      {/* User info + Sign Out */}
      <div className={`p-4 border-t ${isMinimized ? 'border-white/20 flex flex-col items-center gap-4' : 'border-border-color'}`}>
        {user ? (
          isMinimized ? (
            <>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-white" title={user.name}>
                <span className="text-white font-semibold text-sm">{initial}</span>
              </div>
              <SignOutButton isMinimized={true} />
            </>
          ) : (
            <div className="flex flex-row items-center">
              <div className="flex items-center gap-3 px-2 py-1 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{initial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
              </div>
              <SignOutButton isMinimized={false} />
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
