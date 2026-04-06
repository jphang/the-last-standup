import { useState } from 'react';
import { ArrowLeft, Save, Heart, Zap, Shield, TrendingUp, RefreshCw } from 'lucide-react';
import type { PlayerCharacter, CharacterClass } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import { CLASS_GROWTHS } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';

interface CharacterEditProps {
  character: PlayerCharacter;
  isPremium: boolean;
  onBack: () => void;
  onSaved: () => void;
}

const CLASS_KEYS = Object.keys(CHARACTER_CLASSES) as CharacterClass[];

export default function CharacterEdit({ character, isPremium, onBack, onSaved }: CharacterEditProps) {
  const [name, setName] = useState(character.name);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(character.character_key as CharacterClass);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showNameError, setShowNameError] = useState(false);

  const originalClass = character.character_key as CharacterClass;
  const classChanged = selectedClass !== originalClass;
  const classInfo = CHARACTER_CLASSES[selectedClass];
  const originalClassInfo = CHARACTER_CLASSES[originalClass];

  const handleSave = async () => {
    if (!name.trim()) {
      setShowNameError(true);
      return;
    }
    setSaving(true);
    setError('');
    setShowNameError(false);

    const updates: Record<string, unknown> = {
      name: name.trim(),
      updated_at: new Date().toISOString(),
    };

    if (classChanged) {
      updates.character_key = selectedClass;
    }

    const { error: err } = await supabase
      .from('player_characters')
      .update(updates)
      .eq('id', character.id);

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      onSaved();
    }
  };

  const hasChanges = name.trim() !== character.name || classChanged;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-white mb-1">Edit Agent</h2>
      <p className="text-slate-500 text-sm mb-8">Change your agent's name or role. Stats stay the same -- only future level-up growths use the new role.</p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-[55%] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <h3 className="text-white font-bold text-sm">Change Role</h3>
            <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded-full">Future level-ups only</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CLASS_KEYS.map((key) => {
              const info = CHARACTER_CLASSES[key];
              const isSelected = selectedClass === key;
              const isOriginal = key === originalClass;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedClass(key)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    isSelected
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
                  {isOriginal && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
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
              <Avatar
                characterClass={selectedClass}
                size="lg"
                isPremium={isPremium}
                showCrown={isPremium}
              />
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">{classInfo.name}</h3>
                <p className="text-slate-400 text-xs mb-1">{classInfo.title}</p>
                <p className="text-slate-500 text-xs">Level {character.level}</p>
                {classChanged && (
                  <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Switching from {originalClassInfo?.title}
                  </p>
                )}
                <p className="text-slate-500 text-sm italic leading-relaxed mt-2">{classInfo.description}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Stats</span>
                <span className="text-[10px] text-slate-600">(unchanged by role change)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
                  <Heart className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{character.max_hp}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">HP</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
                  <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{character.attack}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">ATK</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-2.5 text-center border border-slate-800/50">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{character.defense}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">DEF</p>
                </div>
              </div>
            </div>

            {classChanged && (
              <div className="mt-4 pt-3 border-t border-slate-700/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">New Growth per Level</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { label: 'HP', newRange: CLASS_GROWTHS[selectedClass].hp, oldRange: CLASS_GROWTHS[originalClass].hp, color: 'text-red-400', bg: 'bg-red-400' },
                    { label: 'ATK', newRange: CLASS_GROWTHS[selectedClass].atk, oldRange: CLASS_GROWTHS[originalClass].atk, color: 'text-amber-400', bg: 'bg-amber-400' },
                    { label: 'DEF', newRange: CLASS_GROWTHS[selectedClass].def, oldRange: CLASS_GROWTHS[originalClass].def, color: 'text-cyan-400', bg: 'bg-cyan-400' },
                  ] as const).map((stat) => {
                    const max = 5;
                    const newAvg = (stat.newRange[0] + stat.newRange[1]) / 2;
                    const oldAvg = (stat.oldRange[0] + stat.oldRange[1]) / 2;
                    const newPct = Math.round((newAvg / max) * 100);
                    const diff = newAvg - oldAvg;
                    const diffLabel = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-500';
                    return (
                      <div key={stat.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px] uppercase tracking-wider">{stat.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-mono ${stat.color}`}>
                              +{stat.newRange[0]}-{stat.newRange[1]}
                            </span>
                            {diff !== 0 && (
                              <span className={`text-[9px] font-bold ${diffLabel}`}>
                                ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stat.bg} transition-all duration-500`}
                            style={{ width: `${newPct}%`, opacity: 0.7 }}
                          />
                        </div>
                        <div className="text-[9px] text-slate-600">
                          Was: +{stat.oldRange[0]}-{stat.oldRange[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!classChanged && (
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
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Agent Name <span className="text-red-400">*</span>
              <span className="text-slate-500 font-normal text-xs ml-1">(required)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setShowNameError(false);
              }}
              maxLength={30}
              className={`w-full bg-slate-900/80 text-white placeholder-slate-600 border rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all ${
                showNameError ? 'border-red-500/60' : 'border-slate-700/50'
              }`}
            />
            {showNameError && (
              <p className="text-red-400 text-xs mt-2">Agent name is required.</p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={!name.trim() || !hasChanges || saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {classChanged ? 'Save & Change Role' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
