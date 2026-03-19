'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: Choose method, 1: Enter OTP, 2: Success
  const [resetMethod, setResetMethod] = useState<'email' | 'phone' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, portal: 'admin' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Login failed');
      
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSendOTP = async (method: 'email' | 'phone') => {
    setResetMethod(method);
    setError('');
    const target = method === 'email' ? 'jambopatrick456@gmail.com' : '0783314404';
    
    try {
      setLoading(true);
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResetStep(1);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const target = resetMethod === 'email' ? 'jambopatrick456@gmail.com' : '0783314404';
    
    try {
      setLoading(true);
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResetStep(2);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-[#181D2D] text-white overflow-hidden">
      {/* Left: Branding & Graphic */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-[#1B2234] to-[#121622] p-12">
        <div className="absolute inset-0 opacity-10 bg-[url('/honey-comb-pattern.svg')] bg-repeat" />
        <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          <Link href="/">
            <div className="w-56 h-56 md:w-64 md:h-64 mb-8 flex items-center justify-center bg-[#2B3448] rounded-full drop-shadow-2xl border-[6px] border-[#34415A] hover:scale-105 transition-transform duration-300 shadow-[0_0_50px_rgba(232,194,101,0.3)] p-6">
              <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain scale-[1.3]" />
            </div>
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif font-black text-[#E8C265] mb-6 tracking-wider drop-shadow-lg">Drone Bee</h1>
          <p className="text-gray-300 text-xl max-w-lg text-center leading-relaxed">Executive Control Center. Oversee enterprise operations, manage staff access, and control system integrity.</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative animate-fade-in">
        <div className="w-full max-w-md bg-[#232A3B] p-8 sm:p-10 rounded-2xl shadow-2xl border border-[#34415A] relative">
          
          {!isForgotPassword ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Super Admin</h2>
                <p className="text-gray-400">Sign in to Executive Portal</p>
              </div>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400 text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    className="block w-full rounded-xl border border-[#3A4662] bg-[#181D2D] px-4 py-3 placeholder-gray-500 shadow-inner focus:border-[#E8C265] focus:outline-none focus:ring-1 focus:ring-[#E8C265] text-white transition-colors"
                    placeholder="Admin identifier"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(true); setError(''); }}
                      className="text-sm text-[#E8C265] hover:text-[#D7A336] transition-colors font-medium focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      className="block w-full rounded-xl border border-[#3A4662] bg-[#181D2D] px-4 py-3 placeholder-gray-500 shadow-inner focus:border-[#E8C265] focus:outline-none focus:ring-1 focus:ring-[#E8C265] text-white transition-colors pr-12"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#E8C265] px-4 py-3.5 text-[#181D2D] hover:bg-[#D7A336] focus:outline-none focus:ring-2 focus:ring-[#E8C265] focus:ring-offset-2 focus:ring-offset-[#181D2D] font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-[#181D2D] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Authenticate"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Flow */
            <div className="animate-fade-in-right">
              <button 
                onClick={() => { setIsForgotPassword(false); setResetStep(0); setOtpSent(false); setError(''); }}
                className="mb-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </button>

              {resetStep === 0 && (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-gray-400 mb-8">Choose how you want to receive your security code to reset your password.</p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleSendOTP('email')}
                      className="w-full flex items-center p-4 rounded-xl border border-[#3A4662] hover:border-[#E8C265] bg-[#181D2D] transition-colors group text-left"
                    >
                      <div className="bg-[#2B3448] text-[#E8C265] p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                        <Mail size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Send to Email</p>
                        <p className="text-sm text-gray-500">jambopatrick456@gmail.com</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleSendOTP('phone')}
                      className="w-full flex items-center p-4 rounded-xl border border-[#3A4662] hover:border-[#E8C265] bg-[#181D2D] transition-colors group text-left"
                    >
                      <div className="bg-[#2B3448] text-[#E8C265] p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Send SMS to Number</p>
                        <p className="text-sm text-gray-500">0783314404</p>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {resetStep === 1 && (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">Enter OTP</h2>
                  <p className="text-gray-400 mb-8">
                    We sent a 6-digit code to {resetMethod === 'email' ? 'jambopatrick456@gmail.com' : '0783314404'}.
                  </p>

                  {error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400 text-center animate-shake">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        className="block w-full rounded-xl border border-[#3A4662] bg-[#181D2D] px-4 py-4 placeholder-gray-600 text-center text-3xl tracking-[0.5em] font-mono shadow-inner focus:border-[#E8C265] focus:outline-none focus:ring-1 focus:ring-[#E8C265] text-white"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#E8C265] px-4 py-3.5 text-[#181D2D] hover:bg-[#D7A336] focus:outline-none font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Verify Code
                    </button>
                  </form>
                  <p className="text-center text-sm text-gray-400 mt-6">
                    Didn't receive the code? <button type="button" onClick={() => handleSendOTP(resetMethod as 'email' | 'phone')} className="text-[#E8C265] hover:underline">Resend OTP</button>
                  </p>
                </>
              )}

              {resetStep === 2 && (
                <div className="text-center py-6 animate-fade-in-up">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verified Successfully!</h2>
                  <p className="text-gray-400 mb-8">You can now proceed to create a new password. (This demo ends here).</p>
                  <button
                    onClick={() => { setIsForgotPassword(false); setResetStep(0); setOtpSent(false); setOtp(''); }}
                    className="w-full rounded-xl bg-[#E8C265] px-4 py-3.5 text-[#181D2D] hover:bg-[#D7A336] focus:outline-none font-bold text-lg transition-all"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}} />
    </div>
  );
}