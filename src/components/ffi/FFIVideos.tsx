import { useState } from "react";
import { Play, X } from "lucide-react";

const videos = [
  {
    title: "Compound Interest Explained",
    youtubeId: "wf91rEGw88Q",
    desc: "Why starting to save and invest early can dramatically increase your money over time.",
  },
  {
    title: "What Is the Stock Market?",
    youtubeId: "p7HKvqRI_Bo",
    desc: "Learn what stocks represent and how the stock market actually works.",
  },
  {
    title: "Credit Scores Explained",
    youtubeId: "jPLUsc5SWTE",
    desc: "What a credit score is and why it affects loans, credit cards, and renting apartments.",
  },
  {
    title: "How Taxes Work",
    youtubeId: "ZJx3VNqJObs",
    desc: "A beginner-friendly explanation of how taxes work when you start earning income.",
  },
];

const FFIVideos = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Play className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display">
          Learn with <span className="gradient-text">Video</span>
        </h2>
      </div>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Watch these short videos to build a strong foundation in financial literacy. Each one covers a key concept every teen should know.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {videos.map((v) => (
          <div key={v.youtubeId} className="rounded-xl overflow-hidden border border-border bg-card">
            <div className="aspect-video relative">
              {playingId === v.youtubeId ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full absolute inset-0"
                  />
                  <button
                    onClick={() => setPlayingId(null)}
                    className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPlayingId(v.youtubeId)}
                  className="w-full h-full relative cursor-pointer"
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/20 hover:bg-background/40 transition-colors flex items-center justify-center">
                    <div className="p-3 rounded-full bg-primary/90 shadow-lg">
                      <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>
                </button>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-display font-semibold mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FFIVideos;
