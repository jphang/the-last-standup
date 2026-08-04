import { useState, useEffect, useCallback } from 'react';
import { Plus, Skull, Users, Crown, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { log } from '../lib/logger';
import { useAuth } from '../context/useAuth';
import type { PlayerCharacter, GameScreen } from '../types/game';
import CharacterCard from './CharacterCard';

interface DashboardProps {
  onNavigate: (screen: GameScreen) => void;
  onSelectCharacter: (character: PlayerCharacter) => void;
  onEditCharacter: (character: PlayerCharacter) => void;
}

export default function Dashboard({ onNavigate, onSelectCharacter, onEditCharacter }: DashboardProps) {
  const { user, profile } = useAuth();
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const isPremium = profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

  const fetchCharacters = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('player_characters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setCharacters(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDelete = async (id: string) => {
    await supabase.from('player_characters').delete().eq('id', id);
    log({
      type: 'character.delete',
      level: 'info',
      ts: new Date().toISOString(),
      userId: user?.id,
      data: { characterId: id },
    });
    setDeleteTarget(null);
    fetchCharacters();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Command Center</h2>
            <p className="text-slate-500 text-sm mt-1">
              Dr. Marcus Pivot won't step down quietly. Assemble your squad and take back the codebase.
            </p>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed max-w-md">
              Battles are won with brains, not brute force. Brush up on your
              <span className="text-cyan-500/80 font-medium"> computer science </span>
              and
              <span className="text-cyan-500/80 font-medium"> math </span>
              trivia -- correct answers double your damage and halve what enemies deal back. You'll need the edge when you face the boss CTO.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all text-sm shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Recruit Agent
          </button>
        </div>
      </div>

      {!isPremium && (
        <button
          onClick={() => onNavigate('premium')}
          className="w-full mb-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/40 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <div className="text-left flex-1">
            <p className="text-amber-400 font-bold text-sm">Paying to Win -- Premium Tier</p>
            <p className="text-slate-500 text-xs mt-0.5">
              Triple ALL stats. Top hat. Monocle. Fake mustache. Total fairness guaranteed.
            </p>
          </div>
          <span className="text-amber-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Subscribe &rarr;
          </span>
        </button>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700/50">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-slate-300 text-sm font-medium">{characters.length} Agent{characters.length !== 1 ? 's' : ''}</span>
        </div>
        {(() => {
          const totalBossKOs = characters.reduce((sum, c) => sum + (c.boss_defeats || 0), 0);
          return totalBossKOs > 0 ? (
            <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-4 py-2 border border-amber-500/20">
              <Skull className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                Dr. Marcus Pivot defeated {totalBossKOs} time{totalBossKOs !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 rounded-xl px-4 py-2 border border-red-500/20">
              <Skull className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Dr. Marcus Pivot is still at large</span>
            </div>
          );
        })()}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
          <Skull className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No agents recruited yet</p>
          <p className="text-slate-600 text-sm mb-6">The aliens are winning. Do something about it.</p>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-emerald-500 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Recruit Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {characters.map((c) => (
            <div key={c.id} className="relative">
              <CharacterCard
                character={c}
                isPremium={!!isPremium}
                onBattle={() => onSelectCharacter(c)}
                onEdit={() => onEditCharacter(c)}
                onDelete={() => setDeleteTarget(c.id)}
              />
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Dismiss Agent?</h3>
                <p className="text-slate-500 text-xs">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all font-medium text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
