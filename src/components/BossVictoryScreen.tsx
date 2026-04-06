import { useState, useEffect } from 'react';
import { Trophy, Swords, ArrowLeft, Star, Heart, Zap, Shield } from 'lucide-react';
import type { PlayerCharacter, CharacterClass } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import Avatar from './Avatar';

interface BossVictoryScreenProps {
  character: PlayerCharacter;
  isPremium: boolean;
  expGained: number;
  levelUpInfo: {
    levelsGained: number;
    hpGain: number;
    attackGain: number;
    defenseGain: number;
  } | null;
  onFightAlien: () => void;
  onFightBoss: () => void;
  onExit: () => void;
}

const HERO_CLASSES: CharacterClass[] = ['ceo', 'devops', 'fullstack', 'designer', 'qa', 'support', 'pm', 'sales', 'recruiter', 'intern'];

export default function BossVictoryScreen({
  character,
  isPremium,
  expGained,
  levelUpInfo,
  onFightAlien,
  onFightBoss,
  onExit,
}: BossVictoryScreenProps) {
  const [showHeroes, setShowHeroes] = useState(false);
  const [showBoss, setShowBoss] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTitle(true), 300);
    const t2 = setTimeout(() => setShowBoss(true), 800);
    const t3 = setTimeout(() => setShowHeroes(true), 1400);
    const t4 = setTimeout(() => setShowStats(true), 2000);
    const t5 = setTimeout(() => setShowButtons(true), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const classKey = character.character_key as CharacterClass;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-[#0c1020] border border-red-500/20 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

        <div className="relative z-10 px-6 py-8">
          <div className={`text-center transition-all duration-700 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border border-amber-500/30 rounded-2xl px-8 py-4 mb-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 tracking-wide">
                BOSS DEFEATED
              </span>
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-slate-500 text-sm mt-2">The alien invasion has been thwarted... for now.</p>
          </div>

          <div className={`mt-8 flex justify-center transition-all duration-700 ${showBoss ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-red-500/10 rounded-full blur-xl" />
              <div className="relative opacity-40 grayscale">
                <Avatar characterClass="boss" size="lg" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-red-500/60 -rotate-12 select-none" style={{ textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
                  KO
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-2 text-center transition-all duration-700 ${showBoss ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-red-400/60 text-xs italic">"This isn't... in my sprint backlog..."</p>
            <p className="text-slate-600 text-[10px] mt-1">-- Dr. Marcus Pivot, final words</p>
          </div>

          <div className={`mt-8 transition-all duration-700 ${showHeroes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-center text-slate-500 text-xs uppercase tracking-widest font-semibold mb-4">The Team That Saved Humanity</p>
            <div className="flex items-end justify-center gap-3 flex-wrap">
              {HERO_CLASSES.map((cls, i) => {
                const info = CHARACTER_CLASSES[cls];
                const isActive = cls === classKey;
                return (
                  <div
                    key={cls}
                    className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-60'}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <Avatar characterClass={cls} size="sm" isPremium={isActive && isPremium} showCrown={isActive && isPremium} />
                    <p className={`text-[9px] mt-1.5 font-semibold truncate max-w-[60px] text-center ${isActive ? 'text-white' : 'text-slate-600'}`}>
                      {info.name.split(' ')[0]}
                    </p>
                    <p className={`text-[8px] ${isActive ? 'text-amber-400' : 'text-slate-700'}`}>
                      {isActive ? 'MVP' : info.title.split(' ')[1] || info.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`mt-8 transition-all duration-700 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-bold text-sm mb-1">+{expGained} EXP earned</p>
              {levelUpInfo && levelUpInfo.levelsGained > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1 justify-center text-amber-400 text-xs font-semibold">
                    <Star className="w-3 h-3" />
                    Level Up! (+{levelUpInfo.levelsGained})
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[11px] font-medium">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3" />
                      +{levelUpInfo.hpGain} HP
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <Zap className="w-3 h-3" />
                      +{levelUpInfo.attackGain} ATK
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <Shield className="w-3 h-3" />
                      +{levelUpInfo.defenseGain} DEF
                    </span>
                  </div>
                </div>
              )}
              <p className="text-amber-400/80 text-xs mt-2 font-medium">
                Boss defeated {character.boss_defeats} time{character.boss_defeats !== 1 ? 's' : ''} by {character.name}
              </p>
              <p className="text-slate-600 text-[10px] mt-1">
                Dr. Marcus Pivot will return. He always pivots back.
              </p>
            </div>
          </div>

          <div className={`mt-6 flex items-center gap-2 justify-center transition-all duration-700 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={onFightAlien}
              className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-emerald-500 transition-all text-sm"
            >
              <Swords className="w-4 h-4" />
              Fight Aliens
            </button>
            <button
              onClick={onFightBoss}
              className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-red-500 transition-all text-sm"
            >
              <Swords className="w-4 h-4" />
              Rematch Boss
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-slate-500 hover:text-white py-2.5 px-5 rounded-xl hover:bg-slate-800 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
