import { LogOut, Crown, User, Zap, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useMusic } from '../context/useMusic';
import type { GameScreen } from '../types/game';

interface HeaderProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export default function Header({ currentScreen, onNavigate }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { muted, toggleMute } = useMusic();
  const isPremium = profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

  return (
    <header className="bg-[#0c1020]/90 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide group-hover:text-emerald-400 transition-colors">
              THE LAST STANDUP
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <button
              onClick={() => onNavigate('premium')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${currentScreen === 'premium'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Paying to Win
            </button>
          )}
          {isPremium && (
            <button
              onClick={() => onNavigate('premium')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              P2W Active
            </button>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50">
            <User className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-2">
              <span className="max-w-[120px] truncate">{profile?.display_name || 'Player'}</span>
              {isPremium && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-600 text-amber-900 text-[10px] font-bold rounded-full">
                  <Crown className="w-2.5 h-2.5 mr-0.5" />
                  P2W
                </span>
              )}
            </div>
          </div>
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-all ${muted
                ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            title={muted ? 'Unmute music' : 'Mute music'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={signOut}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
