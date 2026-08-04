export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  userId?: string | null;
  sessionId?: string | null;
}

export interface AuthLoginSuccessEvent {
  type: 'auth.login.success';
  level: LogLevel;
  ts: string;
  userId: string;
  data: { method: 'google' | 'email' };
}

export interface AuthLoginFailureEvent {
  type: 'auth.login.failure';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { method: 'google' | 'email'; message: string };
}

export interface AuthLogoutEvent {
  type: 'auth.logout';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: Record<string, never>;
}

export interface AuthSignupEvent {
  type: 'auth.signup';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { method: 'email'; name?: string };
}

export interface CharacterEvent {
  type: 'character.create' | 'character.rename' | 'character.delete';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { characterId: string; name?: string };
}

export interface BattleStartEvent {
  type: 'battle.start';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { characterId: string; enemyName: string; isBoss: boolean; playerLevel: number };
}

export interface BattleActionEvent {
  type: 'battle.player_attack' | 'battle.enemy_attack';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { damage: number; targetHp: number };
}

export interface BattleEndEvent {
  type: 'battle.victory' | 'battle.defeat';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { enemyName: string; isBoss: boolean; expGained?: number };
}

export interface BattleLevelUpEvent {
  type: 'battle.level_up';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { characterId: string; newLevel: number; levelsGained: number };
}

export interface TriviaEvent {
  type: 'trivia.fetch' | 'trivia.error';
  level: LogLevel;
  ts: string;
  userId?: string;
  data: { category: 'cs' | 'math'; count: number; responseCode?: number; reason?: string };
}

export type LogEvent =
  | AuthLoginSuccessEvent
  | AuthLoginFailureEvent
  | AuthLogoutEvent
  | AuthSignupEvent
  | CharacterEvent
  | BattleStartEvent
  | BattleActionEvent
  | BattleEndEvent
  | BattleLevelUpEvent
  | TriviaEvent;

export interface LogTransport {
  readonly name: string;
  write(event: LogEvent): void;
}

export interface LoggerConfig {
  transports: LogTransport[];
  maxBytes: number;
  maxFiles: number;
  level: LogLevel;
}
