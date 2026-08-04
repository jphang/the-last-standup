import { useCallback, useEffect, useRef, useState } from 'react';
import type { BattlePhase, BattleState, CharacterClass, PlayerCharacter } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import { isBossEligible } from '../lib/enemies';
import { calculateExpGain, processLevelUp, getEffectiveStats } from '../lib/gameLogic';
import { getCSQuestion, getMathQuestion, prefetchQuestions } from '../lib/trivia';
import { supabase } from '../lib/supabase';
import { useMusic } from '../context/useMusic';
import { applyEnemyAttack, applyPlayerAttack, createBattleState } from '../lib/battleEngine';
import { log } from '../lib/logger';

interface UseBattleFlowOptions {
    character: PlayerCharacter;
    isPremium: boolean;
}

export function useBattleFlow({ character, isPremium }: UseBattleFlowOptions) {
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
    const [choosing, setChoosing] = useState(() => isBossEligible(character.level));
    const [showBossVictory, setShowBossVictory] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);
    const localCharRef = useRef(localChar);

    localCharRef.current = localChar;

    const addLog = useCallback((msg: string) => {
        setBattle((prev) => (prev ? { ...prev, battleLog: [...prev.battleLog, msg] } : null));
    }, []);

    const setPhase = useCallback((phase: BattlePhase) => {
        setBattle((prev) => (prev ? { ...prev, phase } : null));
    }, []);

    const startBattle = useCallback((boss: boolean) => {
        const current = localCharRef.current;
        const nextBattle = createBattleState(current, isPremium, boss);

        setBattle({
            playerHp: nextBattle.playerHp,
            playerMaxHp: nextBattle.playerMaxHp,
            enemy: nextBattle.enemy,
            phase: 'player_choose',
            currentQuestion: null,
            battleLog: [`${nextBattle.enemy.name} appears!`, `"${nextBattle.enemy.description}"`],
            expGained: 0,
            lastDamage: null,
        });

        setIsBossFight(boss);
        setLevelUpInfo(null);
        prefetchQuestions();
        play(boss ? 'battle_boss' : 'battle_alien');

        log({
            type: 'battle.start',
            level: 'info',
            ts: new Date().toISOString(),
            userId: current.user_id,
            data: {
                characterId: current.id,
                enemyName: nextBattle.enemy.name,
                isBoss: boss,
                playerLevel: current.level,
            },
        });
    }, [isPremium, play]);

    const beginBattle = useCallback((boss: boolean) => {
        setChoosing(false);
        setShowBossVictory(false);
        startBattle(boss);
    }, [startBattle]);

    const handleVictory = useCallback(async () => {
        if (!battle) return;

        play('victory');
        const exp = calculateExpGain(localChar.level, battle.enemy.level, battle.enemy.isBoss);
        const result = processLevelUp(localChar, exp);

        log({
            type: 'battle.victory',
            level: 'info',
            ts: new Date().toISOString(),
            userId: localChar.user_id,
            data: { enemyName: battle.enemy.name, isBoss: battle.enemy.isBoss, expGained: exp },
        });

        addLog(`Victory! Gained ${exp} EXP!`);
        if (result.levelsGained > 0) {
            log({
                type: 'battle.level_up',
                level: 'info',
                ts: new Date().toISOString(),
                userId: localChar.user_id,
                data: {
                    characterId: localChar.id,
                    newLevel: result.newLevel,
                    levelsGained: result.levelsGained,
                },
            });
            addLog(`LEVEL UP! Now level ${result.newLevel}!`);
            setLevelUpInfo({
                levelsGained: result.levelsGained,
                hpGain: result.hpGain,
                attackGain: result.attackGain,
                defenseGain: result.defenseGain,
            });
        }

        setBattle((prev) => (prev ? { ...prev, expGained: exp } : null));

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
    }, [addLog, battle, localChar, play]);

    const handleDefeat = useCallback(async () => {
        if (!battle) return;

        play('defeat');
        addLog('You have been defeated...');

        log({
            type: 'battle.defeat',
            level: 'info',
            ts: new Date().toISOString(),
            userId: localChar.user_id,
            data: { enemyName: battle.enemy.name, isBoss: battle.enemy.isBoss },
        });

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
    }, [addLog, battle, localChar, play]);

    const executePlayerAttack = useCallback((multiplier: number) => {
        if (!battle) return;

        setAnimating(true);
        setShowTrivia(false);

        const nextBattle = applyPlayerAttack(battle, stats.attack, battle.enemy.defense, multiplier);
        const dmg = nextBattle.lastDamage?.amount ?? 0;
        const label = multiplier > 1 ? 'CRITICAL Knowledge Strike' : 'Attack';

        log({
            type: 'battle.player_attack',
            level: 'debug',
            ts: new Date().toISOString(),
            userId: localCharRef.current.user_id,
            data: { damage: dmg, targetHp: nextBattle.enemy.hp },
        });

        addLog(`You use ${label}! ${dmg} damage to ${battle.enemy.name}!`);

        setBattle(nextBattle);

        if (nextBattle.phase === 'battle_won') {
            handleVictory();
            return;
        }

        setTimeout(() => {
            setAnimating(false);
            setPhase('enemy_incoming');
        }, 800);
    }, [addLog, battle, handleVictory, setPhase, stats.attack]);

    const executeEnemyAttack = useCallback((damageMultiplier: number) => {
        if (!battle) return;

        setAnimating(true);
        setShowTrivia(false);

        const nextBattle = applyEnemyAttack(battle, battle.enemy.attack, stats.defense, damageMultiplier);
        const dmg = nextBattle.lastDamage?.amount ?? 0;
        const label = damageMultiplier < 1 ? 'Brain Shield absorbs the blow' : `${battle.enemy.name} attacks`;

        log({
            type: 'battle.enemy_attack',
            level: 'debug',
            ts: new Date().toISOString(),
            userId: localCharRef.current.user_id,
            data: { damage: dmg, targetHp: nextBattle.playerHp },
        });

        addLog(`${label}! ${dmg} damage to you!`);

        setBattle(nextBattle);

        if (nextBattle.phase === 'battle_lost') {
            handleDefeat();
            return;
        }

        setTimeout(() => setAnimating(false), 800);
    }, [addLog, battle, handleDefeat, stats.defense]);

    const handleAttack = useCallback(async () => {
        if (!battle || animating) return;

        if (autopilot) {
            executePlayerAttack(1);
            return;
        }

        const q = await getCSQuestion();
        if (q) {
            setBattle((prev) => (prev ? { ...prev, currentQuestion: q, phase: 'trivia_attack' } : null));
            setShowTrivia(true);
            return;
        }

        addLog('No trivia available -- attacking normally.');
        executePlayerAttack(1);
    }, [addLog, animating, autopilot, battle, executePlayerAttack]);

    const handleDefend = useCallback(async () => {
        if (!battle || animating) return;

        if (autopilot) {
            executeEnemyAttack(1);
            return;
        }

        const q = await getMathQuestion();
        if (q) {
            setBattle((prev) => (prev ? { ...prev, currentQuestion: q, phase: 'trivia_defend' } : null));
            setShowTrivia(true);
            return;
        }

        addLog('No trivia available -- bracing normally.');
        executeEnemyAttack(1);
    }, [addLog, animating, autopilot, battle, executeEnemyAttack]);

    useEffect(() => {
        if (!isBossEligible(character.level)) {
            startBattle(false);
        }
    }, [character.level, startBattle]);

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
    }, [autopilot, battle, animating, handleAttack, handleDefend]);

    const handleTriviaAnswer = useCallback((correct: boolean) => {
        if (!battle) return;

        if (battle.phase === 'trivia_attack') {
            if (correct) {
                addLog('Correct! Double damage incoming!');
                executePlayerAttack(2);
            } else {
                addLog('Wrong answer. Normal attack.');
                executePlayerAttack(1);
            }
            return;
        }

        if (correct) {
            addLog('Correct! Damage halved!');
            executeEnemyAttack(0.5);
        } else {
            addLog('Wrong answer. Full damage incoming.');
            executeEnemyAttack(1);
        }
    }, [addLog, battle, executeEnemyAttack, executePlayerAttack]);

    const handleTriviaTimeout = useCallback(() => {
        if (!battle) return;

        addLog("Time's up! Normal damage.");
        if (battle.phase === 'trivia_attack') {
            executePlayerAttack(1);
        } else {
            executeEnemyAttack(1);
        }
    }, [addLog, battle, executeEnemyAttack, executePlayerAttack]);

    const classInfo = CHARACTER_CLASSES[localChar.character_key as CharacterClass];

    return {
        localChar,
        stats,
        battle,
        showTrivia,
        levelUpInfo,
        isBossFight,
        autopilot,
        choosing,
        showBossVictory,
        logRef,
        classInfo,
        beginBattle,
        handleAttack,
        handleDefend,
        handleTriviaAnswer,
        handleTriviaTimeout,
        setAutopilot,
    };
}
