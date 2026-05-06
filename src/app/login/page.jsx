'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const HarikuLogo = ({ width = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" 
    width={width} height={width * 1.45} 
    viewBox="23.5 14 19.5 29" fill="none">
    <path d="M40.0156 18C39.3887 18 38.7793 18.252 38.3047 18.7266L38.2344 18.7969L37.7656 18.3516L25.3906 30.7266L25.3438 30.9609L24.5234 35.0859L24.2891 36.1875L25.3906 35.9531L29.5156 35.1328L29.75 35.0859L42.125 22.7109L41.6797 22.2656L41.7266 22.2188L41.75 22.1719C42.6992 21.2227 42.6992 19.6758 41.75 18.7266C41.2754 18.252 40.6426 18 40.0156 18ZM40.0156 19.4766C40.25 19.4766 40.4961 19.582 40.6953 19.7812C41.0967 20.1826 41.0967 20.7158 40.6953 21.1172L40.625 21.1875L39.2891 19.8516L39.3594 19.7812C39.5586 19.582 39.7812 19.4766 40.0156 19.4766ZM37.7891 20.4609L40.0156 22.6875L38.9375 23.7891L36.6875 21.5391L37.7891 20.4609ZM35.6562 22.6172L37.8594 24.8203L30.0312 32.6719L29.7266 31.3125L29.6328 30.8438L29.1641 30.75L27.8047 30.4453L35.6562 22.6172ZM26.7266 31.7344L28.3672 32.1094L28.7422 33.75L27.2188 34.0547L26.4219 33.2578L26.7266 31.7344Z" 
      fill="#D74C0B"/>
    <path d="M24 36.9766C24 36.9766 38.3249 42.4342 38 36.9766C37.8857 35.0569 35.5 32.4766 35.5 32.4766" 
      stroke="#D74C0B"/>
    <path d="M28.5001 25C24.5884 20.9026 23.9704 16.271 33.5001 14.5" 
      stroke="#D74C0B"/>
    <path d="M29.9916 23.5C27.1952 20.2197 26.8041 19.3772 30.5002 17.5" 
      stroke="#D74C0B"/>
    <path d="M34 34C36.5726 36.8178 36.3656 38.1821 31 37" 
      stroke="#D74C0B"/>
  </svg>
)

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-md p-8">

        {/* Logo */}
        <div className="flex flex-row items-center justify-center gap-4 mb-8">
          <HarikuLogo width={36} />
          <span className="font-serif tracking-wide font-bold text-4xl text-[#E8520A] mt-1">Hariku</span>
        </div>

        {/* Registered success banner */}
        {justRegistered && (
          <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
            Account created! Please sign in.
          </div>
        )}

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-text-primary text-center mb-1">
          Welcome to Hariku!
        </h1>
        <p className="text-sm text-text-muted text-center mb-6">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier (email or username) */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-text-primary mb-1.5">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-color bg-surface text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border-color bg-surface text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-sm text-text-muted text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
