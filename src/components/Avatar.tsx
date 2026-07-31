import type { CharacterClass, AlienSpriteKey } from '../types/game';
import { CHARACTER_CLASSES } from '../types/game';
import {
  CeoSprite, DevopsSprite, FullstackSprite,
  DesignerSprite, QaSprite, InternSprite,
  SupportSprite, ProductManagerSprite, SalesSprite, RecruiterSprite,
  AlienSprite, AlienBruteSprite, AlienStalkerSprite, AlienDroneSprite, AlienSpitterSprite,
  BossSprite,
} from './sprites';

const SPRITE_MAP: Record<string, React.ComponentType<{ size: number }>> = {
  ceo: CeoSprite,
  devops: DevopsSprite,
  fullstack: FullstackSprite,
  designer: DesignerSprite,
  qa: QaSprite,
  intern: InternSprite,
  support: SupportSprite,
  pm: ProductManagerSprite,
  sales: SalesSprite,
  recruiter: RecruiterSprite,
  alien: AlienSprite,
  alien_brute: AlienBruteSprite,
  alien_stalker: AlienStalkerSprite,
  alien_drone: AlienDroneSprite,
  alien_spitter: AlienSpitterSprite,
  boss: BossSprite,
};

const ALIEN_COLORS: Record<AlienSpriteKey, string> = {
  alien: '#4ade80',
  alien_brute: '#f97316',
  alien_stalker: '#a78bfa',
  alien_drone: '#38bdf8',
  alien_spitter: '#fbbf24',
};

interface AvatarProps {
  characterClass: CharacterClass | AlienSpriteKey | 'boss';
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
  showCrown?: boolean;
}

export default function Avatar({ characterClass, size = 'md', isPremium = false, showCrown = false }: AvatarProps) {
  const sizeClasses = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' };
  const spriteSizes = { sm: 32, md: 48, lg: 80 };
  const hatSizes = { sm: 28, md: 40, lg: 64 };
  const monoSizes = { sm: 10, md: 14, lg: 22 };
  const stacheSizes = { sm: 14, md: 20, lg: 32 };

  const color = characterClass === 'boss'
    ? '#ef4444'
    : ALIEN_COLORS[characterClass as AlienSpriteKey] ?? CHARACTER_CLASSES[characterClass as CharacterClass]?.color ?? '#6b7280';

  const SpriteComponent = SPRITE_MAP[characterClass] ?? AlienSprite;

  return (
    <div className="relative inline-flex" style={{ marginTop: isPremium && showCrown ? (size === 'lg' ? 20 : size === 'md' ? 14 : 10) : 0 }}>
      {isPremium && showCrown && (
        <div className="absolute left-1/2 -translate-x-1/2 z-30" style={{ top: size === 'lg' ? -20 : size === 'md' ? -14 : -10 }}>
          <svg width={hatSizes[size]} viewBox="0 0 40 28" fill="none">
            <rect x="8" y="0" width="24" height="18" rx="2" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="2" y="18" width="36" height="6" rx="1.5" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="4" y="24" width="32" height="4" rx="1" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1" />
            <rect x="14" y="19.5" width="12" height="3" rx="1" fill="#f59e0b" opacity="0.6" />
          </svg>
        </div>
      )}

      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${color}30, ${color}15)`,
          border: `2px solid ${isPremium ? '#f59e0b' : color}50`,
          boxShadow: isPremium
            ? `0 0 20px #f59e0b25, 0 0 40px #f59e0b10`
            : `0 0 20px ${color}15`,
        }}
      >
        <div className="relative z-10">
          <SpriteComponent size={spriteSizes[size]} />
        </div>

        {isPremium && (
          <>
            <svg
              className="absolute z-20"
              style={{ top: '22%', right: '12%' }}
              width={monoSizes[size]}
              viewBox="0 0 18 20"
              fill="none"
            >
              <circle cx="9" cy="10" r="7" stroke="#f59e0b" strokeWidth="1.5" fill="rgba(245,158,11,0.08)" />
              <circle cx="9" cy="10" r="2.5" fill="#f59e0b" opacity="0.4" />
              <line x1="15" y1="5" x2="18" y2="0" stroke="#f59e0b" strokeWidth="1" />
              <line x1="15" y1="6" x2="17" y2="20" stroke="#f59e0b" strokeWidth="0.8" />
            </svg>

            <svg
              className="absolute z-20"
              style={{ bottom: '46%', left: '50%', transform: 'translateX(-50%)' }}
              width={stacheSizes[size]}
              viewBox="0 0 28 10"
              fill="none"
            >
              <path
                d="M14 2C14 2 12 6 8 5C5 4.3 3 6 2 8"
                stroke="#5C3A1E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M14 2C14 2 16 6 20 5C23 4.3 25 6 26 8"
                stroke="#5C3A1E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </>
        )}
      </div>
    </div>
  );
}
