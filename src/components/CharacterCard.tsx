import { Swords, Pencil, Trash2, Heart, Shield, Zap, Trophy, Crown, Skull, Lock } from 'lucide-react';
import type { PlayerCharacter, CharacterClass } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import { getEffectiveStats } from '../lib/gameLogic';
import { isBossEligible } from '../lib/enemies';
import Avatar from './Avatar';
import HealthBar from './HealthBar';

interface CharacterCardProps {
  character: PlayerCharacter;
  isPremium: boolean;
  onBattle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CharacterCard({ character, isPremium, onBattle, onEdit, onDelete }: CharacterCardProps) {
  const classKey = character.character_key as CharacterClass;
  const classInfo = CHARACTER_CLASSES[classKey];
  const stats = getEffectiveStats(character, isPremium);

  if (!classInfo) return null;

  return (
    <div
      className={`relative bg-gradient-to-br ${classInfo.bgGradient} border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
      style={{ borderColor: `${classInfo.color}25` }}
    >
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-[9px] font-black text-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
          <Crown className="w-2.5 h-2.5" />
          3x STATS
        </div>
      )}

      <div className="flex items-start gap-4">
        <Avatar characterClass={classKey} size="md" isPremium={isPremium} showCrown={isPremium} />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate">{character.name}</h3>
          <p className="text-slate-400 text-xs">{classInfo.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">
              LVL {character.level}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Trophy className="w-3 h-3 text-amber-500" />
              {character.battles_won}W / {character.battles_lost}L
            </div>
            {character.boss_defeats > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <Skull className="w-3 h-3" />
                {character.boss_defeats} Boss KO{character.boss_defeats !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <HealthBar current={character.exp} max={100} label="EXP" colorClass="bg-cyan-500" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
          <Heart className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{stats.hp}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">HP</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
          <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{stats.attack}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">ATK</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
          <Shield className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{stats.defense}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">DEF</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 px-1">
        {isBossEligible(character.level) ? (
          <div className="flex items-center gap-1.5 text-red-400">
            <Skull className="w-3 h-3" />
            <span className="text-[10px] font-semibold">Boss eligible</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Eligible to fight boss at LVL 3</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onBattle}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-2.5 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all text-sm shadow-lg shadow-emerald-500/10"
        >
          <Swords className="w-4 h-4" />
          Battle
        </button>
        <button
          onClick={onEdit}
          className="p-2.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-all"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2.5 text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-xl border border-slate-700/50 hover:border-red-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
