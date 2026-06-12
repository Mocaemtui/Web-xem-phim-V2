"use client";

import { useState, useRef, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import RoomChat from "@/components/RoomChat";
import { useWatchTogether } from "@/hooks/useWatchTogether";
import type { MovieDetail } from "@/types/api";
import { Users, Copy, Check, RefreshCw, Smile } from "lucide-react";
import EpisodeSelector from "@/components/EpisodeSelector";
import FloatingReactions from "@/components/FloatingReactions";

interface WatchTogetherClientProps {
  movie: MovieDetail;
  posterUrl: string;
  roomId: string;
}

export default function WatchTogetherClient({ movie, posterUrl, roomId }: WatchTogetherClientProps) {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isReceivingEvent = useRef<boolean>(false);
  
  // Mọi người đều là Host
  const {
    watchers,
    messages,
    reactions,
    typingUsers,
    triggerPlay,
    triggerPause,
    triggerSeek,
    triggerRequestSync,
    triggerSyncResponse,
    triggerChangeEpisode,
    triggerReaction,
    triggerTyping,
    sendMessage,
    onPlayRef,
    onPauseRef,
    onSeekRef,
    onRequestSyncRef,
    onSyncResponseRef,
    onChangeEpisodeRef,
  } = useWatchTogether(isJoined ? roomId : "", username, true);

  // Bind remote events to local video player
  useEffect(() => {
    onPlayRef.current = (time) => {
      if (videoRef.current) {
        isReceivingEvent.current = true;
        if (Math.abs(videoRef.current.currentTime - time) > 1) {
          videoRef.current.currentTime = time;
        }
        videoRef.current.play().catch(() => {});
        setTimeout(() => { isReceivingEvent.current = false; }, 500);
      }
    };

    onPauseRef.current = () => {
      if (videoRef.current) {
        isReceivingEvent.current = true;
        videoRef.current.pause();
        setTimeout(() => { isReceivingEvent.current = false; }, 500);
      }
    };

    onSeekRef.current = (time) => {
      if (videoRef.current) {
        isReceivingEvent.current = true;
        videoRef.current.currentTime = time;
        setTimeout(() => { isReceivingEvent.current = false; }, 500);
      }
    };

    // Khi ai đó xin đồng bộ, mình trả lời bằng thời gian hiện tại của mình
    onRequestSyncRef.current = () => {
      if (videoRef.current) {
        triggerSyncResponse(videoRef.current.currentTime, !videoRef.current.paused);
      }
    };

    // Khi nhận được phản hồi đồng bộ từ người khác
    onSyncResponseRef.current = (data) => {
      if (videoRef.current) {
        isReceivingEvent.current = true;
        videoRef.current.currentTime = data.time;
        if (data.isPlaying) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
        setTimeout(() => { isReceivingEvent.current = false; }, 500);
      }
    };

    onChangeEpisodeRef.current = (serverIndex, episodeIndex) => {
      setCurrentServerIndex(serverIndex);
      setCurrentEpisodeIndex(episodeIndex);
    };
  }, [onPlayRef, onPauseRef, onSeekRef, onRequestSyncRef, onSyncResponseRef, onChangeEpisodeRef]);

  // Khi vừa vào phòng, tự động xin đồng bộ với những người đang xem (nếu có)
  useEffect(() => {
    if (isJoined) {
      setTimeout(() => {
        triggerRequestSync();
      }, 1000);
    }
  }, [isJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncClick = () => {
    // Xin đồng bộ thời gian từ bất kỳ ai trong phòng
    triggerRequestSync();
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Phòng Xem Chung</h1>
          <p className="text-zinc-400 text-sm text-center mb-6">Phim: {movie.name}</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">Biệt danh của bạn</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên để mọi người nhận ra bạn..."
                className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Vào Phòng
            </button>
          </form>
        </div>
      </div>
    );
  }

  const episodes = movie.episodes || [];
  const currentServer = episodes[currentServerIndex];
  const serverData = currentServer?.server_data || [];
  const currentEpisode = serverData[currentEpisodeIndex];
  const EMOJIS = ['❤️', '✨', '💦', '😇', '😢', '🤨', '😏', '🤡', '😈', '💀'];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {movie.name} - Tập {currentEpisodeIndex + 1}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Đã copy" : "Mời bạn bè"}
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          {currentEpisode ? (
            <>
              <FloatingReactions reactions={reactions} />
              <VideoPlayer
                externalVideoRef={videoRef}
                poster={posterUrl}
                videoUrl={currentEpisode.link_m3u8}
                onPlaySync={() => {
                  if (!isReceivingEvent.current && videoRef.current) triggerPlay(videoRef.current.currentTime);
                }}
                onPauseSync={() => {
                  if (!isReceivingEvent.current) triggerPause();
                }}
                onSeekSync={(time) => {
                  if (!isReceivingEvent.current) triggerSeek(time);
                }}
              />
            </>
          ) : (
            <div className="w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
              <p className="text-zinc-400">Không tìm thấy link phim</p>
            </div>
          )}
        </div>

        {episodes.length > 0 && serverData.length > 0 && (
          <EpisodeSelector
            episodes={episodes}
            currentServerIndex={currentServerIndex}
            currentEpisodeIndex={currentEpisodeIndex}
            onSelectEpisode={(idx) => {
              setCurrentEpisodeIndex(idx);
              triggerChangeEpisode(currentServerIndex, idx);
            }}
            onSelectServer={(idx) => {
              setCurrentServerIndex(idx);
              setCurrentEpisodeIndex(0);
              triggerChangeEpisode(idx, 0);
            }}
          />
        )}
      </div>

      <div className="w-full md:w-80 lg:w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col h-screen">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Người đang xem ({watchers.length})</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {watchers.map((w) => (
              <div key={w.id} className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full text-sm">
                <span className="text-zinc-200">{w.name}</span>
                {w.name === username && <span className="text-xs text-zinc-500">(Bạn)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Reaction Bar */}
        {isJoined && (
          <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/20">
            <div className="flex flex-wrap items-center gap-2 justify-center py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/60">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="text-xl hover:scale-125 active:scale-95 transition-transform duration-150 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden p-4">
          <RoomChat 
            messages={messages} 
            typingUsers={typingUsers}
            onSendMessage={sendMessage} 
            onTyping={triggerTyping}
          />
        </div>
      </div>
    </div>
  );
}
