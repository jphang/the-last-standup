interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  colorClass?: string;
  showNumbers?: boolean;
}

export default function HealthBar({
  current,
  max,
  label = 'HP',
  colorClass = 'bg-emerald-500',
  showNumbers = true,
}: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = pct > 60 ? colorClass : pct > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full">
      {(label || showNumbers) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>}
          {showNumbers && (
            <span className="text-xs font-mono text-slate-400">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
