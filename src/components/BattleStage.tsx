import { useState, useEffect, useCallback } from 'react';
import type { CharacterClass, AlienSpriteKey, BattlePhase } from '../types/game';
import Avatar from './Avatar';

interface BattleStageProps {
  playerClass: CharacterClass;
  enemySpriteKey: AlienSpriteKey | 'boss';
  isPremium: boolean;
  phase: BattlePhase;
  lastDamage: { target: 'player' | 'enemy'; amount: number } | null;
}

interface FloatingDamage {
  id: number;
  amount: number;
  target: 'player' | 'enemy';
}

let dmgId = 0;

export default function BattleStage({
  playerClass,
  enemySpriteKey,
  isPremium,
  phase,
  lastDamage,
}: BattleStageProps) {
  const [playerAnim, setPlayerAnim] = useState('');
  const [enemyAnim, setEnemyAnim] = useState('');
  const [stageFlash, setStageFlash] = useState('');
  const [showSlash, setShowSlash] = useState<'player' | 'enemy' | null>(null);
  const [showShield, setShowShield] = useState<'player' | 'enemy' | null>(null);
  const [floatingDmg, setFloatingDmg] = useState<FloatingDamage[]>([]);

  const clearAnims = useCallback(() => {
    setPlayerAnim('');
    setEnemyAnim('');
    setStageFlash('');
    setShowSlash(null);
    setShowShield(null);
  }, []);

  useEffect(() => {
    if (!lastDamage) return;

    clearAnims();

    requestAnimationFrame(() => {
      const isPlayerAttacking = lastDamage.target === 'enemy';

      if (isPlayerAttacking) {
        setPlayerAnim('player-lunge');
        setStageFlash('stage-flash-green');
        setTimeout(() => {
          setEnemyAnim('hit-shake hit-flash');
          setShowSlash('enemy');
        }, 200);
      } else {
        setEnemyAnim('enemy-lunge');
        setStageFlash('stage-flash-red');
        setTimeout(() => {
          setPlayerAnim('hit-shake hit-flash');
          if (lastDamage.amount < 5) {
            setShowShield('player');
          } else {
            setShowSlash('player');
          }
        }, 200);
      }

      const newDmg: FloatingDamage = {
        id: ++dmgId,
        amount: lastDamage.amount,
        target: lastDamage.target === 'enemy' ? 'enemy' : 'player',
      };
      setFloatingDmg((prev) => [...prev, newDmg]);

      setTimeout(() => {
        setFloatingDmg((prev) => prev.filter((d) => d.id !== newDmg.id));
      }, 1000);

      setTimeout(clearAnims, 800);
    });
  }, [lastDamage, clearAnims]);

  const isDefendPhase = phase === 'enemy_incoming' || phase === 'trivia_defend';

  return (
    <div className={`relative h-44 sm:h-52 overflow-hidden rounded-t-2xl ${stageFlash}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/80" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(circle at 50% -20%, rgba(239,68,68,0.04) 0%, transparent 50%)',
      }} />

      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 80">
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(30,41,59,0.3)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.6)" />
            </linearGradient>
          </defs>
          <ellipse cx="200" cy="40" rx="220" ry="35" fill="url(#floorGrad)" />
          <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(100,116,139,0.08)" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative h-full flex items-end justify-between px-6 sm:px-12 pb-6 sm:pb-8">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            {floatingDmg
              .filter((d) => d.target === 'player')
              .map((d) => (
                <div
                  key={d.id}
                  className="damage-number absolute -top-4 left-1/2 -translate-x-1/2 z-30 text-red-400 font-black text-lg sm:text-xl whitespace-nowrap"
                  style={{ textShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                >
                  -{d.amount}
                </div>
              ))}

            {showShield === 'player' && (
              <div className="shield-pulse absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-cyan-400/60 bg-cyan-400/10" />
              </div>
            )}
            {showSlash === 'player' && (
              <div className="slash-effect absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 48 48" className="sm:w-14 sm:h-14">
                  <line x1="8" y1="40" x2="40" y2="8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="36" x2="36" y2="12" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
            )}

            <div className={`${playerAnim || 'battle-idle'} transition-transform`}>
              <Avatar
                characterClass={playerClass}
                size="lg"
                isPremium={isPremium}
                showCrown={isPremium}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          {isDefendPhase ? (
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Incoming</span>
            </div>
          ) : (
            <div className="text-slate-700 font-black text-2xl sm:text-3xl select-none" style={{ textShadow: '0 0 20px rgba(100,116,139,0.15)' }}>
              VS
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center">
          <div className="relative">
            {floatingDmg
              .filter((d) => d.target === 'enemy')
              .map((d) => (
                <div
                  key={d.id}
                  className="damage-number absolute -top-4 left-1/2 -translate-x-1/2 z-30 text-amber-400 font-black text-lg sm:text-xl whitespace-nowrap"
                  style={{ textShadow: '0 0 8px rgba(245,158,11,0.6)' }}
                >
                  -{d.amount}
                </div>
              ))}

            {showSlash === 'enemy' && (
              <div className="slash-effect absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 48 48" className="sm:w-14 sm:h-14">
                  <line x1="8" y1="40" x2="40" y2="8" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="36" x2="36" y2="12" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
            )}

            <div className={`${enemyAnim || 'battle-idle'} transition-transform`} style={{ animationDelay: '0.5s' }}>
              <Avatar characterClass={enemySpriteKey} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
