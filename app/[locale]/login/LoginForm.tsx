'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Mode = 'email' | 'magic_link' | 'phone'

export function LoginForm({ locale }: { locale: string }) {
  const [mode, setMode] = useState<Mode>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isRTL = locale !== 'en'
  const supabase = createClient()

  const t = {
    title: locale === 'en' ? 'Misgaran Payroll' : 'معاش میسگران',
    subtitle: locale === 'en' ? 'Sign in to your account' : 'وارد حساب کاربری خود شوید',
    email: locale === 'en' ? 'Email' : 'ایمیل',
    password: locale === 'en' ? 'Password' : 'رمز عبور',
    phone: locale === 'en' ? 'Phone Number' : 'شماره تلفن',
    signIn: locale === 'en' ? 'Sign In' : 'ورود',
    sendLink: locale === 'en' ? 'Send Magic Link' : 'ارسال لینک ورود',
    sendOTP: locale === 'en' ? 'Send OTP' : 'ارسال کد',
    verifyOTP: locale === 'en' ? 'Verify' : 'تأیید',
    enterOTP: locale === 'en' ? 'Enter OTP' : 'کد را وارد کنید',
    useEmail: locale === 'en' ? 'Sign in with Email' : 'ورود با ایمیل',
    useMagic: locale === 'en' ? 'Magic Link' : 'لینک جادویی',
    usePhone: locale === 'en' ? 'Phone / SMS' : 'تلفن / پیامک',
    contactAdmin: locale === 'en'
      ? 'Contact your administrator to get an account.'
      : 'برای دریافت حساب با مدیر تماس بگیرید.',
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setMessage(locale === 'en' ? 'Check your email for a sign-in link.' : 'لینک ورود به ایمیل شما ارسال شد.')
    setLoading(false)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) setError(error.message)
    else setOtpSent(true)
    setLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-slate-50 p-4',
        isRTL && 'font-[Vazirmatn]'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-xl mx-auto mb-3">
            م
          </div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Mode selector */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            {(['email', 'magic_link', 'phone'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className={cn(
                  'flex-1 py-1.5 text-xs rounded-md transition-colors font-medium',
                  mode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {m === 'email' ? t.useEmail : m === 'magic_link' ? t.useMagic : t.usePhone}
              </button>
            ))}
          </div>

          {/* Email + Password */}
          {mode === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.signIn}
              </Button>
            </form>
          )}

          {/* Magic Link */}
          {mode === 'magic_link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-magic">{t.email}</Label>
                <Input
                  id="email-magic"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.sendLink}
              </Button>
            </form>
          )}

          {/* Phone OTP */}
          {mode === 'phone' && (
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+93700000000"
                  required
                  disabled={otpSent}
                />
              </div>
              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">{t.enterOTP}</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="text-center tracking-widest text-lg"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {otpSent ? t.verifyOTP : t.sendOTP}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-slate-500">{t.contactAdmin}</p>
        </CardContent>
      </Card>
    </div>
  )
}
