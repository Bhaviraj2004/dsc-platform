'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerSchema, RegisterSchema } from '@/lib/validations/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CA',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      setLoading(true);
      setError('');
      const res = await authApi.register(data);
      // After register, token is returned but /auth/me requires token in header
      // Store token temporarily so the me() call can use it
      localStorage.setItem('access_token', res.access_token);
      const me = await authApi.me();
      setAuth(me, res.access_token);
      router.push(me.role === 'CA' ? '/ca/profile' : '/client');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-50 border-r border-zinc-100">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">DSC Platform</span>
        </div>

        {/* Center content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500 font-medium">Join 10,000+ CA firms</span>
          </div>

          <h1 className="text-4xl font-bold text-zinc-900 leading-tight tracking-tight mb-4">
            Start managing,<br />
            <span className="text-zinc-400">smarter today.</span>
          </h1>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mb-10">
            Create your account and get instant access to DSC tracking,
            filing management, and secure document signing.
          </p>

          <div className="space-y-4">
            {[
              { step: '01', title: 'Create your account', desc: 'Takes less than 2 minutes' },
              { step: '02', title: 'Add your clients', desc: 'Import or add manually' },
              { step: '03', title: 'Start managing', desc: 'Track DSC, filings & more' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-zinc-400">{s.step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{s.title}</p>
                  <p className="text-xs text-zinc-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-300">© 2026 DSC Platform. All rights reserved.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            {/* Show logo on mobile since left panel is hidden */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-zinc-900">DSC Platform</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1.5">
              Create account
            </h2>
            <p className="text-sm text-zinc-500">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm text-red-600 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-zinc-600">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-10 text-sm"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-zinc-600">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="h-10 text-sm pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Role Selection */}
            {/* Role Selection */}
            <div className="space-y-1.5">
              <input type="hidden" {...register('role')} />
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-500 leading-normal">
                <span className="font-semibold text-zinc-800 block mb-1">Registration is for CAs & Firms only</span>
                Client accounts are created automatically by their CA. If you are a client, please contact your CA for your login credentials.
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium mt-2"
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-zinc-100" />
            <span className="text-xs text-zinc-300">or</span>
            <span className="flex-1 h-px bg-zinc-100" />
          </div>

          <p className="text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <a href="/login" className="text-zinc-700 font-semibold hover:text-zinc-900 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}