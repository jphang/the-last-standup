import { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { startCheckout } from '../lib/stripe';

interface PremiumUpgradeProps {
  className?: string;
}

export function PremiumUpgrade({ className = '' }: PremiumUpgradeProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const url = await startCheckout();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-8 h-8 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Paying to Win - Premium Tier</h3>
      </div>

      <p className="text-gray-700 mb-4">Triple all agent stats. Top hat, monocle, and fake mustache included.</p>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">
          $9.99
          <span className="text-sm font-normal text-gray-600">/month</span>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Upgrade Now'
          )}
        </button>
      </div>
    </div>
  );
}
