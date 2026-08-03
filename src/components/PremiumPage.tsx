import { useState } from 'react';
import { ArrowLeft, Crown, Zap, Shield, Heart, Check, Sparkles, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { startCheckout, cancelSubscription, reactivateSubscription } from '../lib/stripe';
import Avatar from './Avatar';

interface PremiumPageProps {
  onBack: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: 'red' | 'amber';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const colors = {
    red: {
      icon: 'bg-red-500/15',
      iconText: 'text-red-400',
      btn: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
      spinner: 'border-red-400/30 border-t-red-400',
    },
    amber: {
      icon: 'bg-amber-500/15',
      iconText: 'text-amber-400',
      btn: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
      spinner: 'border-amber-400/30 border-t-amber-400',
    },
  }[confirmColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
        <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${colors.iconText}`} />
        </div>
        <h3 className="text-white font-bold text-lg text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Never mind
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${colors.btn}`}
          >
            {loading ? (
              <div className={`w-4 h-4 border-2 rounded-full animate-spin ${colors.spinner}`} />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPage({ onBack }: PremiumPageProps) {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);

  const isPremium = profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());
  const isCancelling = profile?.subscription_status === 'cancelling';

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const url = await startCheckout();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to payment service. Please try again later.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError('');

    try {
      await cancelSubscription();
      await refreshProfile();
      setShowCancelConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to payment service. Please try again later.');
    }

    setCancelling(false);
  };

  const handleReactivate = async () => {
    setReactivating(true);
    setError('');

    try {
      await reactivateSubscription();
      await refreshProfile();
      setShowResumeConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resume subscription. Please try again later.');
    }

    setReactivating(false);
  };

  if (isPremium) {
    return (
      <div className="max-w-lg mx-auto p-4">
        {showCancelConfirm && (
          <ConfirmDialog
            title="Cancel Subscription?"
            message="Your premium perks (3x stats, cosmetics) will stay active until the end of the current billing period. After that, everything goes back to normal."
            confirmLabel="Cancel it"
            confirmColor="red"
            loading={cancelling}
            onConfirm={handleCancel}
            onCancel={() => setShowCancelConfirm(false)}
          />
        )}
        {showResumeConfirm && (
          <ConfirmDialog
            title="Resume Subscription?"
            message="Your subscription will continue as normal and you'll be charged $9.99/month at the next billing date. Premium perks stay uninterrupted."
            confirmLabel="Resume"
            confirmColor="amber"
            loading={reactivating}
            onConfirm={handleReactivate}
            onCancel={() => setShowResumeConfirm(false)}
          />
        )}

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="text-center bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">You're Paying to Win!</h2>
          <p className="text-slate-400 text-sm mb-6">
            All your stats are tripled. You have the top hat. The monocle. The mustache.
            Fair and balanced.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            {isCancelling ? 'Cancels at Period End' : 'Premium Active'}
          </div>
          {profile?.premium_expires_at && (
            <p className="text-slate-600 text-xs mt-4">
              {isCancelling ? 'Premium until' : 'Renews'}:{' '}
              {new Date(profile.premium_expires_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-2">Manage Subscription</h3>
          {isCancelling ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-sm font-medium mb-1">Subscription cancelled</p>
              <p className="text-slate-500 text-xs mb-4">
                Your premium perks remain active until the end of the current billing period
                {profile?.premium_expires_at && (
                  <> ({new Date(profile.premium_expires_at).toLocaleDateString()})</>
                )}. After that, your stats will return to normal and the fancy cosmetics will be gone.
              </p>
              <button
                onClick={() => setShowResumeConfirm(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/10 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Resume Subscription
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-xs mb-4">
                If you cancel, your premium perks (3x stats, cosmetics) stay active until the end of the current billing period. After that, everything goes back to normal.
              </p>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-amber-500/20">
          <Crown className="w-3.5 h-3.5" />
          PREMIUM TIER
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Paying to Win</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Why grind when you can just... pay? Triple your stats and look
          absolutely ridiculous doing it. Totally fair. Definitely balanced.*
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 via-[#0f1629] to-amber-500/5 border border-amber-500/20 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">Free Player</p>
            <Avatar characterClass="ceo" size="lg" />
          </div>
          <div className="text-2xl text-slate-600">vs</div>
          <div className="text-center">
            <p className="text-amber-400 text-xs uppercase tracking-wider mb-1 font-semibold">P2W Chad</p>
            <Avatar characterClass="ceo" size="lg" isPremium showCrown />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Triple HP</p>
              <p className="text-slate-500 text-xs">50 HP becomes 150 HP. Math checks out.</p>
            </div>
            <span className="text-amber-400 text-xs font-bold">3x</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Triple Attack</p>
              <p className="text-slate-500 text-xs">Your motivational speeches now shatter reality.</p>
            </div>
            <span className="text-amber-400 text-xs font-bold">3x</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Triple Defense</p>
              <p className="text-slate-500 text-xs">Aliens can't even scratch your ego anymore.</p>
            </div>
            <span className="text-amber-400 text-xs font-bold">3x</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Premium Cosmetics</p>
              <p className="text-slate-500 text-xs">Top hat, monocle, and a fake mustache. Peak fashion.</p>
            </div>
            <span className="text-amber-400 text-xs font-bold">DRIP</span>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <span className="text-4xl font-black text-white">$9.99</span>
            <span className="text-slate-500 text-sm">/month</span>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all text-base shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Subscribe & Start Winning
              </>
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {[
          'Cancel anytime (but why would you)',
          'Stats triple instantly upon subscribing',
          'Cosmetics visible in all battles',
          'Works on all your agents',
          'Powered by Stripe -- secure payments',
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            {text}
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-700 mt-8">
        *"Totally fair" and "definitely balanced" are marketing claims and should not be taken literally.
        No aliens were harmed in the making of this premium tier.
      </p>
    </div>
  );
}
