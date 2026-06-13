"use client";

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link: string;
  link_embed: string;
  link_m3u8: string;
}

interface Server {
  server_name: string;
  is_ai?: boolean;
  server_data: Episode[];
}

interface EpisodeSelectorProps {
  episodes: Server[];
  currentServerIndex: number;
  currentEpisodeIndex: number;
  onSelectEpisode: (episodeIndex: number) => void;
  onSelectServer: (serverIndex: number) => void;
}

export default function EpisodeSelector({ 
  episodes, 
  currentServerIndex, 
  currentEpisodeIndex,
  onSelectEpisode,
  onSelectServer 
}: EpisodeSelectorProps) {
  const serverData = episodes[currentServerIndex]?.server_data || [];

  return (
    <div className="mb-8 relative z-20">
      <h3 className="text-lg font-semibold text-white mb-4">
        {serverData.length <= 1 ? "Server nguồn / Tập" : "Danh sách tập"}
      </h3>
      
      {/* Server Selection */}
      {episodes.length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {episodes.map((server, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectServer(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentServerIndex === index
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episode Selection - Show even for single episode (Phim lẻ) */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {serverData.map((episode, index) => (
          <button
            key={`${episode.slug}-${index}`}
            type="button"
            onClick={() => onSelectEpisode(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentEpisodeIndex === index
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {episode.name}
          </button>
        ))}
      </div>
    </div>
  );
}
