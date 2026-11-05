'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiError } from '@/lib/api';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel — visible on lg+ only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary via-primary to-accent">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-primary-foreground w-full">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm ring-1 ring-primary-foreground/20">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">D.Aesthetics HRM</span>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-balance">
              Run your workforce like clockwork.
            </h2>
            <p className="text-primary-foreground/80 text-base max-w-md">
              One elegant workspace for people, payroll, and performance — built for modern HR teams.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                'Manage your workforce',
                'Track payroll & expenses',
                'Approve leave in seconds',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-primary-foreground/60">
            &copy; {new Date().getFullYear()} D.Aesthetics. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right column — login form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center sm:p-8">
        <div className="w-full sm:max-w-md">
          {/* Brand mark — mobile/tablet only */}
          <div className="mb-12 flex flex-col items-center text-center lg:hidden">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">D.Aesthetics HRM</h1>
            <p className="mt-2 text-sm text-muted-foreground">Human Resource Management System</p>
          </div>

          {/* Card styling only from sm+; plain and edge-to-edge on phones */}
          <div className="sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-8">
            <div className="mb-6 hidden lg:block">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
            <div className="mb-8 lg:hidden">
              <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 pl-10 text-base md:text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pl-10 pr-11 text-base md:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="mt-2 h-12 w-full text-base md:text-sm" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
