import { useState } from 'react';
import { ArrowLeft, Plus, Heart, Zap, Shield, TrendingUp } from 'lucide-react';
import type { CharacterClass } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import { CLASS_GROWTHS } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { log } from '../lib/logger';
import { useAuth } from '../context/useAuth';
import Avatar from './Avatar';

interface CharacterCreateProps {
  onBack: () => void;
  onCreated: () => void;
}

const CLASS_KEYS = Object.keys(CHARACTER_CLASSES) as CharacterClass[];

export default function CharacterCreate({ onBack, onCreated }: CharacterCreateProps) {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('ceo');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showNameError, setShowNameError] = useState(false);

  const classInfo = CHARACTER_CLASSES[selectedClass];

  const handleCreate = async () => {
    if (!name.trim()) {
      setShowNameError(true);
      return;
    }
    if (!user) return;
    setCreating(true);
    setError('');
    setShowNameError(false);

    const { data: inserted, error: err } = await supabase
      .from('player_characters')
      .insert({
        user_id: user.id,
        name: name.trim(),
        character_key: selectedClass,
        max_hp: classInfo.baseHp,
        current_hp: classInfo.baseHp,
        attack: classInfo.baseAttack,
        defense: classInfo.baseDefense,
      })
      .select('id')
      .single();

    if (err) {
      setError(err.message);
      setCreating(false);
    } else {
      log({
        type: 'character.create',
        level: 'info',
        ts: new Date().toISOString(),
        userId: user.id,
        data: { characterId: inserted?.id ?? 'unknown', name: name.trim() },
      });
      onCreated();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-white mb-1">Recruit New Agent</h2>
      <p className="text-slate-500 text-sm mb-8">Choose a role and give your agent a name worthy of saving humanity.</p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-[55%] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CLASS_KEYS.map((key) => {
              const info = CHARACTER_CLASSES[key];
              const isSelected = selectedClass === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedClass(key)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${isSelected
                      ? 'border-opacity-60 bg-opacity-20 scale-[1.02] shadow-lg'
                      : 'border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  style={
                    isSelected
                      ? {
                        borderColor: `${info.color}60`,
                        backgroundColor: `${info.color}15`,
                        boxShadow: `0 0 30px ${info.color}10`,
                      }
                      : {}
                  }
                >
                  <Avatar characterClass={key} size="sm" />
                  <p className="text-white font-semibold text-sm mt-2">{info.name}</p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">{info.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 md:sticky md:top-4 md:self-start space-y-6">
          <div
            className="bg-gradient-to-br rounded-2xl p-6 border"
            style={{
              borderColor: `${classInfo.color}25`,
              background: `linear-gradient(135deg, ${classInfo.color}08, ${classInfo.color}04)`,
            }}
          >
            <div className="flex items-start gap-4">
              <Avatar characterClass={selectedClass} size="lg" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">{classInfo.name}</h3>
                <p className="text-slate-400 text-xs mb-2">{classInfo.title}</p>
                <p className="text-slate-500 text-sm italic leading-relaxed">{classInfo.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-slate-300 font-mono">{classInfo.baseHp}</span>
                    <span className="text-slate-600 text-xs">HP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 font-mono">{classInfo.baseAttack}</span>
                    <span className="text-slate-600 text-xs">ATK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300 font-mono">{classInfo.baseDefense}</span>
                    <span className="text-slate-600 text-xs">DEF</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Growth per Level</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { label: 'HP', range: CLASS_GROWTHS[selectedClass].hp, color: 'text-red-400', bg: 'bg-red-400' },
                      { label: 'ATK', range: CLASS_GROWTHS[selectedClass].atk, color: 'text-amber-400', bg: 'bg-amber-400' },
                      { label: 'DEF', range: CLASS_GROWTHS[selectedClass].def, color: 'text-cyan-400', bg: 'bg-cyan-400' },
                    ] as const).map((stat) => {
                      const max = 5;
                      const avg = (stat.range[0] + stat.range[1]) / 2;
                      const pct = Math.round((avg / max) * 100);
                      return (
                        <div key={stat.label} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[10px] uppercase tracking-wider">{stat.label}</span>
                            <span className={`text-[11px] font-mono ${stat.color}`}>+{stat.range[0]}-{stat.range[1]}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${stat.bg} transition-all duration-500`}
                              style={{ width: `${pct}%`, opacity: 0.7 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Agent Name <span className="text-red-400">*</span>
              <span className="text-slate-500 font-normal text-xs ml-1">(required)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Name your agent..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setShowNameError(false);
                }}
                maxLength={30}
                className={`flex-1 bg-slate-900/80 text-white placeholder-slate-600 border rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all ${showNameError ? 'border-red-500/60' : 'border-slate-700/50'
                  }`}
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Recruit
                  </>
                )}
              </button>
            </div>
            {showNameError && (
              <p className="text-red-400 text-xs mt-2">Agent name is required.</p>
            )}
            {error && (
              <p className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
