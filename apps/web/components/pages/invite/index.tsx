'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Lock, Sparkles, User } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth, type AuthResponse } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InviteDetails {
  email: string;
  name: string;
  role: string;
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { signIn } = useAuth();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<{ data: InviteDetails }>(`/auth/invites/${token}`)
      .then((res) => {
        setInvite(res.data);
        setName(res.data.name);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not open this invite.'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The two passwords don’t match.');
      return;
    }

    setIsSubmitting(true);
    try {
      signIn(await api.post<AuthResponse>(`/auth/invites/${token}/accept`, { name, password }));
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join d.Aesthetics</h1>
          {invite && (
            <p className="mt-1 text-sm text-muted-foreground">
              You’ve been invited as <span className="font-medium text-foreground">{invite.role}</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {loadError ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-left text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {loadError}
              </div>
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Go to sign in
              </Link>
            </div>
          ) : !invite ? (
            <p className="text-center text-sm text-muted-foreground">Checking your invite...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                <Input value={invite.email} disabled className="h-11" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Your name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Choose a password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Confirm password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Creating your account...' : 'Create account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
