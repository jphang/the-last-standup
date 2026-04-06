import { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Zap, Shield, ArrowLeft, Trophy, Skull as SkullIcon, Star, TrendingUp, Heart, Bot } from 'lucide-react';
import type { PlayerCharacter, CharacterClass, BattleState, BattlePhase } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import { generateEnemy, isBossEligible } from '../lib/enemies';
import { calculateDamage, calculateExpGain, processLevelUp, getEffectiveStats } from '../lib/gameLogic';
import { getCSQuestion, getMathQuestion, prefetchQuestions } from '../lib/trivia';
import { supabase } from '../lib/supabase';
import { useMusic } from '../context/MusicContext';
import Avatar from './Avatar';
import HealthBar from './HealthBar';
import TriviaModal from './TriviaModal';
import BossVictoryScreen from './BossVictoryScreen';
import BattleStage from './BattleStage';

interface BattleArenaProps {
  character: PlayerCharacter;
  isPremium: boolean;
  onExit: () => void;
}

export default function BattleArena({ character, isPremium, onExit }: BattleArenaProps) {
  const { play } = useMusic();
  const [localChar, setLocalChar] = useState<PlayerCharacter>({ ...character });
  const stats = getEffectiveStats(localChar, isPremium);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [showTrivia, setShowTrivia] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{
    levelsGained: number;
    hpGain: number;
    attackGain: number;
    defenseGain: number;
  } | null>(null);
  const [isBossFight, setIsBossFight] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const localCharRef = useRef(localChar);
  localCharRef.current = localChar;

  const startBattle = useCallback((boss: boolean) => {
    const current = localCharRef.current;
    const currentStats = getEffectiveStats(current, isPremium);
    const enemy = generateEnemy(current.level, boss);
    setBattle({
      playerHp: currentStats.hp,
      playerMaxHp: currentStats.hp,
      enemy,
      phase: 'player_choose',
      currentQuestion: null,
      battleLog: [
        `${enemy.name} appears!`,
        `"${enemy.description}"`,
      ],
      expGained: 0,
      lastDamage: null,
    });
    setIsBossFight(boss);
    setLevelUpInfo(null);
    prefetchQuestions();
    play(boss ? 'battle_boss' : 'battle_alien');
  }, [isPremium, play]);

  const [choosing, setChoosing] = useState(() => isBossEligible(character.level));
  const [showBossVictory, setShowBossVictory] = useState(false);

  const beginBattle = useCallback((boss: boolean) => {
    setChoosing(false);
    setShowBossVictory(false);
    startBattle(boss);
  }, [startBattle]);

  useEffect(() => {
    if (!isBossEligible(character.level)) {
      startBattle(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle?.battleLog]);

  useEffect(() => {
    if (!autopilot || !battle || animating) return;
    if (battle.phase === 'player_choose') {
      const t = setTimeout(() => handleAttack(), 600);
      return () => clearTimeout(t);
    }
    if (battle.phase === 'enemy_incoming') {
      const t = setTimeout(() => handleDefend(), 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopilot, battle?.phase, animating]);

  const addLog = (msg: string) => {
    setBattle((prev) => prev ? { ...prev, battleLog: [...prev.battleLog, msg] } : null);
  };

  const setPhase = (phase: BattlePhase) => {
    setBattle((prev) => prev ? { ...prev, phase } : null);
  };

  const handleAttack = async () => {
    if (!battle || animating) return;

    if (autopilot) {
      executePlayerAttack(1);
      return;
    }

    const q = await getCSQuestion();
    if (q) {
      setBattle((prev) => prev ? { ...prev, currentQuestion: q, phase: 'trivia_attack' } : null);
      setShowTrivia(true);
      return;
    }
    addLog('No trivia available -- attacking normally.');
    executePlayerAttack(1);
  };

  const executePlayerAttack = (multiplier: number) => {
    if (!battle) return;
    setAnimating(true);
    setShowTrivia(false);

    const dmg = calculateDamage(stats.attack, battle.enemy.defense, multiplier);
    const newEnemyHp = Math.max(0, battle.enemy.hp - dmg);

    const label = multiplier > 1 ? 'CRITICAL Knowledge Strike' : 'Attack';
    addLog(`You use ${label}! ${dmg} damage to ${battle.enemy.name}!`);

    setBattle((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        enemy: { ...prev.enemy, hp: newEnemyHp },
        lastDamage: { target: 'enemy', amount: dmg },
        phase: newEnemyHp <= 0 ? 'battle_won' : 'enemy_incoming',
      };
    });

    if (newEnemyHp <= 0) {
      handleVictory();
    } else {
      setTimeout(() => {
        setAnimating(false);
        setPhase('enemy_incoming');
      }, 800);
    }
  };

  const handleDefend = async () => {
    if (!battle || animating) return;

    if (autopilot) {
      executeEnemyAttack(1);
      return;
    }

    const q = await getMathQuestion();
    if (q) {
      setBattle((prev) => prev ? { ...prev, currentQuestion: q, phase: 'trivia_defend' } : null);
      setShowTrivia(true);
      return;
    }
    addLog('No trivia available -- bracing normally.');
    executeEnemyAttack(1);
  };

  const executeEnemyAttack = (damageMultiplier: number) => {
    if (!battle) return;
    setAnimating(true);
    setShowTrivia(false);

    const dmg = calculateDamage(battle.enemy.attack, stats.defense, damageMultiplier);
    const newPlayerHp = Math.max(0, battle.playerHp - dmg);

    const label = damageMultiplier < 1 ? 'Brain Shield absorbs the blow' : `${battle.enemy.name} attacks`;
    addLog(`${label}! ${dmg} damage to you!`);

    setBattle((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        playerHp: newPlayerHp,
        lastDamage: { target: 'player', amount: dmg },
        phase: newPlayerHp <= 0 ? 'battle_lost' : 'player_choose',
      };
    });

    if (newPlayerHp <= 0) {
      handleDefeat();
    }

    setTimeout(() => setAnimating(false), 800);
  };

  const handleTriviaAnswer = (correct: boolean) => {
    if (!battle) return;
    if (battle.phase === 'trivia_attack') {
      if (correct) {
        addLog('Correct! Double damage incoming!');
        executePlayerAttack(2);
      } else {
        addLog('Wrong answer. Normal attack.');
        executePlayerAttack(1);
      }
    } else if (battle.phase === 'trivia_defend') {
      if (correct) {
        addLog('Correct! Damage halved!');
        executeEnemyAttack(0.5);
      } else {
        addLog('Wrong answer. Full damage incoming.');
        executeEnemyAttack(1);
      }
    }
  };

  const handleTriviaTimeout = () => {
    if (!battle) return;
    addLog('Time\'s up! Normal damage.');
    if (battle.phase === 'trivia_attack') {
      executePlayerAttack(1);
    } else {
      executeEnemyAttack(1);
    }
  };

  const handleVictory = async () => {
    if (!battle) return;
    play('victory');
    const exp = calculateExpGain(localChar.level, battle.enemy.level, battle.enemy.isBoss);
    const result = processLevelUp(localChar, exp);

    addLog(`Victory! Gained ${exp} EXP!`);
    if (result.levelsGained > 0) {
      addLog(`LEVEL UP! Now level ${result.newLevel}!`);
      setLevelUpInfo({
        levelsGained: result.levelsGained,
        hpGain: result.hpGain,
        attackGain: result.attackGain,
        defenseGain: result.defenseGain,
      });
    }

    setBattle((prev) => prev ? { ...prev, expGained: exp } : null);

    if (battle.enemy.isBoss) {
      setShowBossVictory(true);
    }

    const updatedChar: PlayerCharacter = {
      ...localChar,
      level: result.newLevel,
      exp: result.newExp,
      max_hp: localChar.max_hp + result.hpGain,
      current_hp: localChar.max_hp + result.hpGain,
      attack: localChar.attack + result.attackGain,
      defense: localChar.defense + result.defenseGain,
      battles_won: localChar.battles_won + 1,
      boss_defeats: localChar.boss_defeats + (battle.enemy.isBoss ? 1 : 0),
    };
    setLocalChar(updatedChar);

    await supabase
      .from('player_characters')
      .update({
        level: updatedChar.level,
        exp: updatedChar.exp,
        max_hp: updatedChar.max_hp,
        current_hp: updatedChar.current_hp,
        attack: updatedChar.attack,
        defense: updatedChar.defense,
        battles_won: updatedChar.battles_won,
        boss_defeats: updatedChar.boss_defeats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', localChar.id);

    setAnimating(false);
  };

  const handleDefeat = async () => {
    play('defeat');
    addLog('You have been defeated...');
    const updatedChar = { ...localChar, battles_lost: localChar.battles_lost + 1 };
    setLocalChar(updatedChar);

    await supabase
      .from('player_characters')
      .update({
        battles_lost: updatedChar.battles_lost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', localChar.id);
    setAnimating(false);
  };

  const classInfo = CHARACTER_CLASSES[localChar.character_key as CharacterClass];

  if (showBossVictory && battle) {
    return (
      <BossVictoryScreen
        character={localChar}
        isPremium={isPremium}
        expGained={battle.expGained}
        levelUpInfo={levelUpInfo}
        onFightAlien={() => beginBattle(false)}
        onFightBoss={() => beginBattle(true)}
        onExit={onExit}
      />
    );
  }

  if (choosing) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </button>
        <div className="bg-[#0c1020] border border-slate-800/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Avatar
                characterClass={localChar.character_key as CharacterClass}
                size="md"
                isPremium={isPremium}
                showCrown={isPremium}
              />
            </div>
            <h2 className="text-white font-bold text-xl mt-3">{localChar.name}</h2>
            <p className="text-slate-500 text-sm">Choose your opponent</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => beginBattle(false)}
              className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-emerald-500/40 rounded-2xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar characterClass="alien" size="sm" />
                <div>
                  <p className="text-white font-bold">Alien Grunt</p>
                  <p className="text-slate-500 text-xs">Random encounter</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs">Fight a random alien soldier to train and gain EXP.</p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Swords className="w-3 h-3" />
                Start Training
              </div>
            </button>
            <button
              onClick={() => beginBattle(true)}
              className="group bg-gradient-to-br from-red-500/10 to-red-900/10 border border-red-500/20 hover:border-red-500/50 rounded-2xl p-6 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar characterClass="boss" size="sm" />
                <div>
                  <p className="text-red-400 font-bold">Dr. Marcus Pivot</p>
                  <p className="text-red-400/50 text-xs">The Traitor CTO</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs">Challenge the boss. Higher risk, higher reward.</p>
              <div className="mt-4 flex items-center gap-2 text-red-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <SkullIcon className="w-3 h-3" />
                Challenge Boss
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isPlayerTurn = battle.phase === 'player_choose';
  const isDefendPhase = battle.phase === 'enemy_incoming';
  const isOver = battle.phase === 'battle_won' || battle.phase === 'battle_lost';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retreat
        </button>
        <button
          onClick={() => setAutopilot((p) => !p)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
            autopilot
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Autopilot {autopilot ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="bg-[#0c1020] border border-slate-800/50 rounded-2xl overflow-hidden">
        <BattleStage
          playerClass={localChar.character_key as CharacterClass}
          enemySpriteKey={battle.enemy.isBoss ? 'boss' : battle.enemy.spriteKey}
          isPremium={isPremium}
          phase={battle.phase}
          lastDamage={battle.lastDamage}
        />

        <div className="grid grid-cols-2 border-b border-slate-800/50">
          <div className="px-4 py-3 border-r border-slate-800/50">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-white font-bold text-sm">{localChar.name}</p>
                <p className="text-[10px]" style={{ color: classInfo?.color }}>
                  {classInfo?.title} -- LVL {localChar.level}
                </p>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                <Zap className="w-3 h-3 text-amber-400" />{stats.attack}
                <Shield className="w-3 h-3 text-cyan-400 ml-1" />{stats.defense}
              </div>
            </div>
            <HealthBar current={battle.playerHp} max={battle.playerMaxHp} label="HP" colorClass="bg-emerald-500" />
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-white font-bold text-sm">{battle.enemy.name}</p>
                <p className="text-red-400 text-[10px]">{battle.enemy.title} -- LVL {battle.enemy.level}</p>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                <Zap className="w-3 h-3 text-amber-400" />{battle.enemy.attack}
                <Shield className="w-3 h-3 text-cyan-400 ml-1" />{battle.enemy.defense}
              </div>
            </div>
            <HealthBar current={battle.enemy.hp} max={battle.enemy.maxHp} label="HP" colorClass="bg-red-500" />
          </div>
        </div>

        <div
          ref={logRef}
          className="h-36 overflow-y-auto p-4 space-y-1.5 border-b border-slate-800/50 scrollbar-thin"
        >
          {battle.battleLog.map((msg, i) => (
            <p
              key={i}
              className={`text-xs leading-relaxed ${
                msg.startsWith('Victory') || msg.startsWith('LEVEL')
                  ? 'text-emerald-400 font-semibold'
                  : msg.startsWith('Correct')
                  ? 'text-cyan-400'
                  : msg.startsWith('Wrong') || msg.startsWith('You have been')
                  ? 'text-red-400'
                  : msg.startsWith('"')
                  ? 'text-slate-600 italic'
                  : 'text-slate-400'
              }`}
            >
              {msg}
            </p>
          ))}
        </div>

        <div className="p-4">
          {isPlayerTurn && !isOver && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Your Turn</p>
              <p className="text-[10px] text-slate-600 mb-2">Answer correctly to double your damage!</p>
              <button
                onClick={handleAttack}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600/80 to-amber-500/80 text-white font-medium py-3 rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all text-sm shadow-lg shadow-amber-500/10"
              >
                <Zap className="w-4 h-4" />
                Knowledge Strike
              </button>
            </div>
          )}

          {isDefendPhase && !isOver && (
            <div className="space-y-2">
              <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-3">
                {battle.enemy.name} is attacking!
              </p>
              <p className="text-[10px] text-slate-600 mb-2">Answer correctly to halve incoming damage!</p>
              <button
                onClick={handleDefend}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600/80 to-cyan-500/80 text-white font-medium py-3 rounded-xl hover:from-cyan-500 hover:to-cyan-400 transition-all text-sm shadow-lg shadow-cyan-500/10"
              >
                <Shield className="w-4 h-4" />
                Brain Shield
              </button>
            </div>
          )}

          {battle.phase === 'battle_won' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 font-bold text-lg px-6 py-3 rounded-2xl border border-emerald-500/30 mb-4">
                <Trophy className="w-5 h-5" />
                VICTORY
              </div>
              <p className="text-slate-400 text-sm mb-2">+{battle.expGained} EXP</p>
              {levelUpInfo && levelUpInfo.levelsGained > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 inline-block">
                  <p className="text-amber-400 font-bold text-sm flex items-center gap-1 justify-center mb-1">
                    <Star className="w-4 h-4" />
                    Level Up! (+{levelUpInfo.levelsGained})
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /><TrendingUp className="w-3 h-3" />+{levelUpInfo.hpGain}</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /><TrendingUp className="w-3 h-3" />+{levelUpInfo.attackGain}</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-400" /><TrendingUp className="w-3 h-3" />+{levelUpInfo.defenseGain}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center mt-4">
                <button
                  onClick={() => beginBattle(false)}
                  className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-emerald-500 transition-all text-sm"
                >
                  <Swords className="w-4 h-4" />
                  Fight Aliens
                </button>
                {isBossEligible(localChar.level) && (
                  <button
                    onClick={() => beginBattle(true)}
                    className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-red-500 transition-all text-sm"
                  >
                    <SkullIcon className="w-4 h-4" />
                    Fight Boss
                  </button>
                )}
                <button
                  onClick={onExit}
                  className="text-slate-500 hover:text-white py-2.5 px-5 rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                  Return
                </button>
              </div>
            </div>
          )}

          {battle.phase === 'battle_lost' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-red-500/15 text-red-400 font-bold text-lg px-6 py-3 rounded-2xl border border-red-500/30 mb-4">
                <SkullIcon className="w-5 h-5" />
                DEFEATED
              </div>
              <p className="text-slate-500 text-sm mb-4">The aliens live to fight another day...</p>
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={() => beginBattle(isBossFight)}
                  className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-emerald-500 transition-all text-sm"
                >
                  <Swords className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={onExit}
                  className="text-slate-500 hover:text-white py-2.5 px-5 rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                  Retreat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTrivia && battle.currentQuestion && (
        <TriviaModal
          question={battle.currentQuestion}
          type={battle.phase === 'trivia_attack' ? 'attack' : 'defend'}
          onAnswer={handleTriviaAnswer}
          onTimeout={handleTriviaTimeout}
          timeLimit={10}
        />
      )}
    </div>
  );
}
