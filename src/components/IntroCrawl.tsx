import { useState, useEffect } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../context/useMusic';

interface IntroCrawlProps {
  onComplete: () => void;
}

export default function IntroCrawl({ onComplete }: IntroCrawlProps) {
  const { play, muted, toggleMute } = useMusic();
  const [phase, setPhase] = useState<'stars' | 'title' | 'crawl'>('stars');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    play('theme');
  }, [play]);

  useEffect(() => {
    const titleTimer = setTimeout(() => setPhase('title'), 500);
    const crawlTimer = setTimeout(() => setPhase('crawl'), 4500);
    const endTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 52000);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(crawlTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(onComplete, 600);
  };

  return (
    <div
      className={`fixed inset-0 bg-black z-[100] overflow-hidden transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
    >
      <div className="star-field" />

      {phase === 'title' && (
        <div className="absolute inset-0 flex items-center justify-center intro-title-flash">
          <p className="text-cyan-400 text-lg md:text-2xl tracking-[0.3em] font-medium text-center leading-relaxed">
            A long time ago in a conference room<br />far, far away....
          </p>
        </div>
      )}

      {phase === 'crawl' && (
        <div className="crawl-container">
          <div className="crawl-perspective">
            <div className="crawl-content">
              <h2 className="text-amber-400 text-4xl md:text-6xl font-black tracking-wide text-center mb-2">
                EPISODE I
              </h2>
              <h1 className="text-amber-400 text-5xl md:text-7xl font-black tracking-wider text-center mb-12 leading-tight">
                THE LAST<br />STANDUP
              </h1>

              <div className="text-cyan-50 text-lg md:text-[1.4rem] leading-[1.8] text-center max-w-[36rem] mx-auto space-y-8">
                <p>
                  It is a period of corporate chaos. The daily
                  standup meetings have become a battleground
                  where careers are made and broken in
                  fifteen-minute increments.
                </p>

                <p>
                  Dr. Marcus Pivot, a rogue CTO drunk on VC
                  funding and kombucha, has forged an unholy
                  alliance with an alien armada from the
                  Andromeda sector. Together, they plan to
                  deploy the ultimate legacy codebase -- one
                  so tangled, so undocumented, that no
                  developer could ever hope to maintain it.
                </p>

                <p>
                  Their weapon: a mass migration to an
                  alien tech stack with zero documentation
                  and mandatory six-hour code reviews
                  conducted entirely in interpretive dance.
                </p>

                <p>
                  As sprint velocity plummets and Jira boards
                  overflow with unresolved tickets, a small
                  band of rebellious developers rises from
                  the ashes of a failed deployment.
                </p>

                <p>
                  Armed with nothing but Stack Overflow
                  bookmarks, an unreasonable amount of
                  caffeine, and a single rubber duck for
                  debugging, they vow to take back the
                  codebase one pull request at a time.
                </p>

                <p>
                  The fate of every startup on Earth now
                  rests on their ability to ship features,
                  squash bugs, and survive the most
                  dangerous ritual in all of software
                  engineering...
                </p>

                <p className="text-amber-400 font-bold text-2xl md:text-3xl tracking-wide pt-4">
                  The Last Standup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 right-8 z-[110] flex items-center gap-3">
        <button
          onClick={toggleMute}
          className={`p-2.5 rounded-lg border backdrop-blur-sm transition-all duration-300 ${muted
              ? 'text-slate-600 border-white/10 hover:text-slate-400 hover:bg-white/5'
              : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
            }`}
          title={muted ? 'Unmute music' : 'Mute music'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 group"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
