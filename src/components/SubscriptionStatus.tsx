import { Crown, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export function SubscriptionStatus() {
  const { profile } = useAuth();

  const isPremium =
    profile?.is_premium &&
    (!profile.premium_expires_at ||
      new Date(profile.premium_expires_at) > new Date());

  if (!isPremium) return null;

  const isCancelling = profile?.subscription_status === 'cancelling';

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="w-5 h-5 text-amber-400" />
        {isCancelling ? (
          <Clock className="w-4 h-4 text-amber-400" />
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
        <span className="font-semibold text-amber-400 text-sm">
          {isCancelling ? 'Premium -- Cancels at Period End' : 'Paying to Win - Premium Tier'}
        </span>
      </div>
      {profile.premium_expires_at && (
        <p className="text-xs text-slate-500">
          {isCancelling ? 'Active until' : 'Renews'}{' '}
          {new Date(profile.premium_expires_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}