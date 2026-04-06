import { useState, useEffect } from 'react';
import { Zap, Shield, Skull, Chrome, Mail, ArrowRight, UserPlus, LogIn, Volume2, VolumeX, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { play, muted, toggleMute } = useMusic();
  const [mode, setMode] = useState<'main' | 'login' | 'signup' | 'forgot'>('main');

  useEffect(() => {
    play('theme');
  }, [play]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    if (mode === 'forgot') {
      const { error: err } = await resetPassword(email);
      if (err) setError(err);
      else setResetSent(true);
    } else if (mode === 'signup') {
      const { error: err } = await signUpWithEmail(email, password, name);
      if (err) setError(err);
    } else {
      const { error: err } = await signInWithEmail(email, password);
      if (err) setError(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-red-500/20">
            <Skull className="w-3.5 h-3.5" />
            ALIEN INVASION IN PROGRESS
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">
            THE LAST
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              STANDUP
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-4 max-w-xs mx-auto leading-relaxed">
            A rogue CTO has allied with aliens to disrupt humanity.
            Your startup is the last line of defense.
          </p>
        </div>

        <div className="flex items-center gap-6 justify-center mb-8 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Turn-Based Combat
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
            Trivia Powers
          </div>
        </div>

        {mode === 'main' ? (
          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3.5 px-6 rounded-xl hover:bg-slate-100 transition-all duration-200 shadow-lg shadow-white/5"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <button
              onClick={() => setMode('login')}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 font-medium py-3.5 px-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
              Sign in with Email
            </button>
            <button
              onClick={() => setMode('signup')}
              className="w-full flex items-center justify-center gap-2 text-slate-500 text-sm py-2 hover:text-slate-300 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create an account
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div className="space-y-3">
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-white font-semibold text-lg">Check your email</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We sent a password reset link to <span className="text-white">{email}</span>. Click the link in that email to set a new password.
                </p>
                <button
                  onClick={() => { setMode('login'); setResetSent(false); setError(''); }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 font-medium py-3.5 px-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 mt-4"
                >
                  <ArrowRight className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <p className="text-slate-400 text-sm text-center mb-2">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="w-full text-slate-500 text-sm py-2 hover:text-slate-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); }}
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Forgot password?
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('main'); setError(''); }}
              className="w-full text-slate-500 text-sm py-2 hover:text-slate-300 transition-colors"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-slate-700 mt-8">
          THE LAST STANDUP v0.01 -- Earth's last startup standing
        </p>
      </div>

      <button
        onClick={toggleMute}
        className={`absolute top-6 right-6 p-2.5 rounded-lg border transition-all ${
          muted
            ? 'text-slate-600 border-slate-800 hover:text-slate-400 hover:bg-slate-800/50'
            : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
        }`}
        title={muted ? 'Unmute music' : 'Mute music'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
