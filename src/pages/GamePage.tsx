import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { verifyPremium } from '../lib/stripe';
import type { PlayerCharacter, GameScreen } from '../types/game';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import CharacterCreate from '../components/CharacterCreate';
import CharacterEdit from '../components/CharacterEdit';
import BattleArena from '../components/BattleArena';
import PremiumPage from '../components/PremiumPage';
import IntroCrawl from '../components/IntroCrawl';

export function GamePage() {
  const { profile, refreshProfile } = useAuth();
  const [screen, setScreen] = useState<GameScreen>('dashboard');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter | null>(null);
  const { play } = useMusic();
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('intro_seen'));

  useEffect(() => {
    if (screen !== 'battle') {
      play('command');
    }
  }, [screen, play]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setScreen('premium');

      let stopped = false;

      const verifyAndRefresh = async () => {
        try {
          const result = await verifyPremium();
          if (result.is_premium) {
            await refreshProfile();
            return true;
          }
        } catch { /* verification is best-effort */ }
        await refreshProfile();
        return false;
      };

      const pollUntilPremium = async () => {
        const success = await verifyAndRefresh();
        if (success || stopped) return;

        const interval = setInterval(async () => {
          if (stopped) { clearInterval(interval); return; }
          const done = await verifyAndRefresh();
          if (done) clearInterval(interval);
        }, 3000);

        setTimeout(() => { stopped = true; clearInterval(interval); }, 30000);
      };

      pollUntilPremium();
      return () => { stopped = true; };
    }
  }, [refreshProfile]);

  const isPremium = !!profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

  const handleNavigate = useCallback((s: GameScreen) => {
    setScreen(s);
  }, []);

  const handleSelectCharacter = useCallback((c: PlayerCharacter) => {
    setSelectedCharacter(c);
    setScreen('battle');
  }, []);

  const handleEditCharacter = useCallback((c: PlayerCharacter) => {
    setSelectedCharacter(c);
    setScreen('edit');
  }, []);

  if (showIntro) {
    return <IntroCrawl onComplete={() => { sessionStorage.setItem('intro_seen', '1'); setShowIntro(false); }} />;
  }

  return (
    <div className="min-h-screen bg-[#070b14]">
      <div className="mb-6">
        <SubscriptionStatus />
      </div>
      
      <Header currentScreen={screen} onNavigate={handleNavigate} />
      {screen === 'dashboard' && (
        <Dashboard
          onNavigate={handleNavigate}
          onSelectCharacter={handleSelectCharacter}
          onEditCharacter={handleEditCharacter}
        />
      )}
      {screen === 'create' && (
        <CharacterCreate
          onBack={() => setScreen('dashboard')}
          onCreated={() => setScreen('dashboard')}
        />
      )}
      {screen === 'edit' && selectedCharacter && (
        <CharacterEdit
          character={selectedCharacter}
          isPremium={isPremium}
          onBack={() => setScreen('dashboard')}
          onSaved={() => setScreen('dashboard')}
        />
      )}
      {screen === 'battle' && selectedCharacter && (
        <BattleArena
          character={selectedCharacter}
          isPremium={isPremium}
          onExit={() => setScreen('dashboard')}
        />
      )}
      {screen === 'premium' && (
        <PremiumPage onBack={() => setScreen('dashboard')} />
      )}
    </div>
  );
}