import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useMusic } from '../context/useMusic';

export function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const { muted, toggleMute } = useMusic();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    await signOut();
    navigate('/auth');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <KeyRound className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Choose a new password for your account.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold text-lg">Password updated</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your password has been changed. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900/80 text-white placeholder-slate-600 border border-slate-700/50 rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
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
                  Update Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-slate-700 mt-8">
          THE LAST STANDUP v0.01 -- Earth's last startup standing
        </p>
      </div>

      <button
        onClick={toggleMute}
        className={`absolute top-6 right-6 p-2.5 rounded-lg border transition-all ${muted
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
