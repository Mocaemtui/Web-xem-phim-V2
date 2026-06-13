"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { MovieDetail } from "@/types/api";
import { Users, Copy, Check, RefreshCw, Smile, Eye, EyeOff, MessageSquare } from "lucide-react";
import EpisodeSelector from "@/components/EpisodeSelector";
import { useWatchTogether } from "@/hooks/useWatchTogether";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });
const RoomChat = dynamic(() => import("@/components/RoomChat"), { ssr: false });
const FloatingReactions = dynamic(() => import("@/components/FloatingReactions"), { ssr: false });

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
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "episodes" | "watchers">("chat");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [chatWidth, setChatWidth] = useState(384);
  const [ambientActive, setAmbientActive] = useState(true);
  const [showWatchers, setShowWatchers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ambient_active");
      setAmbientActive(saved !== "false");
    }

    const handleAmbientChanged = () => {
      const saved = localStorage.getItem("ambient_active");
      setAmbientActive(saved !== "false");
    };

    window.addEventListener("ambient_active_changed", handleAmbientChanged);
    return () => window.removeEventListener("ambient_active_changed", handleAmbientChanged);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const isReceivingEvent = useRef<boolean>(false);
  const isResizing = useRef(false);
  const hasSynced = useRef(false);
  const currentServerIndexRef = useRef(currentServerIndex);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);


  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 240 && newWidth < window.innerWidth * 0.6) {
      setChatWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Sync ambient light canvas
  useEffect(() => {
    let animationFrameId: number;
    let lastDrawTime = 0;
    let cachedCtx: CanvasRenderingContext2D | null = null;

    const drawFrame = (now: number) => {
      const video = videoRef.current;
      const canvas1 = ambientCanvasRef.current;

      if (video && canvas1 && isJoined) {
        if (!cachedCtx) {
          cachedCtx = canvas1.getContext("2d", { willReadFrequently: false });
        }

        if (cachedCtx && !video.paused && !video.ended && now - lastDrawTime >= 66) {
          try {
            cachedCtx.drawImage(video, 0, 0, canvas1.width, canvas1.height);
            lastDrawTime = now;
          } catch (err) {
            // Ignore CORS
          }
        }
      }
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isJoined, ambientActive]);




  useEffect(() => {
    if (isTheaterMode) {
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isTheaterMode]);

  useEffect(() => {
    currentServerIndexRef.current = currentServerIndex;
    currentEpisodeIndexRef.current = currentEpisodeIndex;
  }, [currentServerIndex, currentEpisodeIndex]);
  
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

  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    lastMessageCountRef.current = messages.length;
  }, []);

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.isSystem && isChatHidden) {
        setNewMessageNotification(`Tin nhắn mới từ ${lastMsg.sender}: "${lastMsg.text}"`);
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, isChatHidden]);

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

    // Khi ai đó xin đồng bộ, mình trả lời bằng thời gian hiện tại và tập phim hiện tại của mình
    onRequestSyncRef.current = () => {
      if (videoRef.current) {
        triggerSyncResponse(
          videoRef.current.currentTime,
          !videoRef.current.paused,
          currentServerIndexRef.current,
          currentEpisodeIndexRef.current
        );
      }
    };

    // Khi nhận được phản hồi đồng bộ từ người khác
    onSyncResponseRef.current = (data) => {
      hasSynced.current = true;
      if (data.serverIndex !== undefined && data.episodeIndex !== undefined) {
        setCurrentServerIndex(data.serverIndex);
        setCurrentEpisodeIndex(data.episodeIndex);
      }
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

  // Sync state for single watchers (hosts)
  useEffect(() => {
    if (watchers.length <= 1 && isJoined) {
      hasSynced.current = true;
    }
  }, [watchers, isJoined]);

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
    <div ref={containerRef} className="relative min-h-screen bg-zinc-950 flex flex-col overflow-y-auto scroll-smooth">
      {/* Global Background Ambient Glow Canvas */}
      {ambientActive && (
        <canvas
          ref={ambientCanvasRef}
          width="16"
          height="9"
          className="absolute inset-0 w-full h-full blur-[80px] opacity-75 pointer-events-none transition-all duration-700"
          style={{ zIndex: 0 }}
        />
      )}


      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 767px) {
          header, footer { display: none !important; }
        }
        ${isTheaterMode ? "header { display: none !important; }" : ""}
      `}} />

      
      {/* Esc key & native fullscreen change listener */}
      <KeyboardAndTheaterHandler setIsTheaterMode={setIsTheaterMode} containerRef={containerRef} />


      {/* Main workspace: Side-by-side Player and Chat Sidebar (Fills the screen first fold) */}
      <div className="h-screen w-full flex flex-col md:flex-row shrink-0 relative overflow-hidden">
        {/* Left Area: Video Player & Controls */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 group/theater relative z-10 ${
            isTheaterMode 
              ? "h-full w-full p-0 bg-transparent overflow-hidden justify-center items-center" 
              : "min-h-0 overflow-hidden p-3 md:p-6 bg-transparent"
          }`}
          onDoubleClick={() => setIsTheaterMode(prev => !prev)}
        >
        {isTheaterMode && (
          <button
            onClick={() => setIsTheaterMode(false)}
            className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-white/20 transition-all duration-300 opacity-0 group-hover/theater:opacity-100 pointer-events-none group-hover/theater:pointer-events-auto shadow-lg flex items-center justify-center cursor-pointer"
            title="Thu nhỏ (Esc)"
          >
            <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5M15 9h4.5M15 9l6-6m-6 12v4.5M15 15h4.5M15 15l6 6m-6-6v4.5M9 15H4.5M9 15l-6 6" />
            </svg>
          </button>
        )}

        {/* Mobile Spacer (holds height for fixed top video player on mobile) */}
        {!isTheaterMode && (
          <div className="h-[calc(56.25vw+16px)] md:hidden shrink-0" />
        )}

        {/* Video Player */}
        <div className={`w-full relative transition-all ${
          isTheaterMode 
            ? "h-full max-h-screen flex items-center justify-end p-0 z-40" 
            : "relative z-20 bg-transparent p-0 shrink min-h-0 mb-3 md:mb-6 flex-1 flex items-center justify-center"
        }`}>

          {/* Floating Horizontal Controller at Top-Right (Only shows when chat is hidden & hovered near top-right) */}
          {isChatHidden && (
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-zinc-950/80 border border-zinc-800/60 p-2 rounded-xl backdrop-blur-md opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 group/overlay"
                 style={{ contentVisibility: "auto" }}>
              {/* Invisible hover helper to make it easy to trigger */}
              <div className="absolute -top-4 -right-4 -bottom-4 -left-12 z-[-1] pointer-events-auto" />
              
              {/* Watchers Popover (Horizontal Context) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowWatchers(prev => !prev);
                    setShowEmojis(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${showWatchers ? "bg-zinc-800/80 border-zinc-700 text-blue-400" : "bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"}`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{watchers.length}</span>
                </button>

                {showWatchers && (
                  <div className="absolute right-0 top-9 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/40 p-3 rounded-lg shadow-2xl z-50 min-w-[180px] max-w-[240px]">
                    <h4 className="text-[11px] font-semibold text-zinc-400 mb-2 border-b border-zinc-900 pb-1">Người xem ({watchers.length})</h4>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                      {watchers.map((w) => (
                        <div key={w.id} className="text-xs text-zinc-300 py-0.5 truncate">
                          {w.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emojis Popover (Horizontal Context) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowEmojis(prev => !prev);
                    setShowWatchers(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${showEmojis ? "bg-zinc-800/80 border-zinc-700 text-blue-400" : "bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"}`}
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>

                {showEmojis && (
                  <div className="absolute right-0 top-9 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/40 p-2 rounded-lg shadow-2xl z-50 min-w-[200px]">
                    <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            triggerReaction(emoji);
                          }}
                          className="text-lg hover:scale-125 active:scale-95 transition-transform duration-100 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Restore Chat Button */}
              <button
                onClick={() => {
                  setIsChatHidden(false);
                  setShowWatchers(false);
                  setShowEmojis(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"
                title="Hiện cuộc trò chuyện"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hiện Chat</span>
              </button>

            </div>
          )}

          {currentEpisode ? (
            <>
              <FloatingReactions reactions={reactions} />
              <VideoPlayer
                key={`${currentServerIndex}-${currentEpisodeIndex}`}
                externalVideoRef={videoRef}
                poster={posterUrl}
                videoUrl={currentEpisode.link_m3u8}
                nextVideoUrl={serverData[currentEpisodeIndex + 1]?.link_m3u8}
                isWatchTogether={true}
                isTheaterMode={isTheaterMode}
                onPlaySync={() => {
                  if (hasSynced.current && !isReceivingEvent.current && videoRef.current) triggerPlay(videoRef.current.currentTime);
                }}
                onPauseSync={() => {
                  if (hasSynced.current && !isReceivingEvent.current) triggerPause();
                }}
                onSeekSync={(time) => {
                  if (hasSynced.current && !isReceivingEvent.current) triggerSeek(time);
                }}

                hasNextEpisode={currentEpisodeIndex < serverData.length - 1}
                onAutoNext={() => {
                  if (currentEpisodeIndex < serverData.length - 1) {
                    const nextIdx = currentEpisodeIndex + 1;
                    setCurrentEpisodeIndex(nextIdx);
                    triggerChangeEpisode(currentServerIndex, nextIdx);
                  }
                }}
              />
            </>
          ) : (
            <div className="w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
              <p className="text-zinc-400">Không tìm thấy link phim</p>
            </div>
          )}
        </div>

        {/* Title and Share Link with Zoom Button */}
        {!isTheaterMode && (
          <div className="flex items-center justify-between gap-2 mb-2.5 shrink-0">
            <h1 className="text-sm md:text-2xl font-bold text-white truncate flex-1">
              {movie.name} - Tập {currentEpisodeIndex + 1}
            </h1>
            <div className="flex items-center gap-2">
              {/* Zoom / Theater Toggle Button on Desktop */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="hidden md:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-zinc-800 cursor-pointer active:scale-95"
                title="Bật/Tắt chế độ rạp chiếu (Theater Mode)"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {isTheaterMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5M15 9h4.5M15 9l6-6m-6 12v4.5M15 15h4.5M15 15l6 6m-6-6v4.5M9 15H4.5M9 15l-6 6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                  )}
                </svg>
                <span>{isTheaterMode ? "Thu nhỏ" : "Phóng to"}</span>
              </button>

              {/* Copy invite link */}
              <button
                onClick={copyLink}
                className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white px-2.5 py-1.5 rounded-lg text-xs transition-all border border-zinc-800 shrink-0 cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã copy" : "Mời bạn"}</span>
              </button>
            </div>
          </div>
        )}



        {/* Mobile-only Tabs Navigation and Content */}
        {!isTheaterMode && (
          <>
            <div className="flex md:hidden border-b border-zinc-800/40 bg-zinc-950/20 rounded-t-xl shrink-0">
              <button
                onClick={() => setActiveMobileTab("chat")}
                className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-colors ${activeMobileTab === "chat" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
              >
                Trò chuyện
              </button>
              <button
                onClick={() => setActiveMobileTab("episodes")}
                className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-colors ${activeMobileTab === "episodes" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
              >
                Tập phim
              </button>
              <button
                onClick={() => setActiveMobileTab("watchers")}
                className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-colors ${activeMobileTab === "watchers" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
              >
                Người xem ({watchers.length})
              </button>
            </div>

            {/* Mobile Tab Content Container */}
            <div className={`flex-1 min-h-0 md:hidden bg-zinc-900/10 rounded-b-xl border-0 p-3 flex flex-col ${activeMobileTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              {activeMobileTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Emojis Reaction bar inside mobile chat tab */}
                  {isJoined && (
                    <div className="flex items-center gap-2 justify-center py-2 px-1 bg-zinc-950/20 rounded-lg border-0 mb-2 shrink-0 overflow-x-auto no-scrollbar">

                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => triggerReaction(emoji)}
                          className="text-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 min-h-0">
                    <RoomChat 
                      messages={messages} 
                      typingUsers={typingUsers}
                      onSendMessage={sendMessage} 
                      onTyping={triggerTyping}
                    />
                  </div>
                </div>
              )}

              {activeMobileTab === "episodes" && (
                <div className="flex-1 overflow-y-auto">
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
              )}

              {activeMobileTab === "watchers" && (
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-white text-sm">Danh sách người đang xem</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchers.map((w) => (
                      <div key={w.id} className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full text-xs">
                        <span className="text-zinc-200">{w.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Resizable Divider handle (Absolutely positioned to overlap seamlessly, eliminating any black layout gap) */}
      {!isTheaterMode && (
        <div 
          onMouseDown={startResizing} 
          className="hidden md:block absolute top-0 bottom-0 w-2 cursor-col-resize z-50 bg-transparent hover:bg-blue-500/20 transition-all duration-150" 
          style={{ right: `${chatWidth - 4}px` }}
        />
      )}

      {/* Right Area: Desktop Sidebar */}
      <div 
        className={`hidden md:flex bg-transparent flex-col min-h-0 shrink-0 z-10 relative transition-all duration-300 ${
          isChatHidden ? "w-0 p-0 overflow-hidden" : "p-3 md:p-4 gap-3 overflow-visible"
        }`}
        style={{ 
          width: isChatHidden ? "0px" : (isTheaterMode ? "260px" : `${chatWidth}px`), 
          backgroundColor: "transparent" 
        }}
      >


        {/* Sleek controls row: Watchers & Emojis Popovers */}
        <div className={`flex items-center gap-2 justify-end relative z-20 shrink-0 ${isChatHidden ? "flex-col" : "flex-row"}`}>
          
          {/* Watchers Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowWatchers(prev => !prev);
                setShowEmojis(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${showWatchers ? "bg-zinc-800/80 border-zinc-700 text-blue-400" : "bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{watchers.length}</span>
            </button>

            {showWatchers && (
              <div className="absolute right-full top-0 mr-2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/40 p-3 rounded-lg shadow-2xl z-50 min-w-[180px] max-w-[240px]">
                <h4 className="text-[11px] font-semibold text-zinc-400 mb-2 border-b border-zinc-900 pb-1">Người xem ({watchers.length})</h4>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {watchers.map((w) => (
                    <div key={w.id} className="text-xs text-zinc-300 py-0.5 truncate">
                      {w.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emojis Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojis(prev => !prev);
                setShowWatchers(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${showEmojis ? "bg-zinc-800/80 border-zinc-700 text-blue-400" : "bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"}`}
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {showEmojis && (
              <div className="absolute right-full top-0 mr-2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/40 p-2 rounded-lg shadow-2xl z-50 min-w-[200px]">
                <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        triggerReaction(emoji);
                      }}
                      className="text-lg hover:scale-125 active:scale-95 transition-transform duration-100 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

           {/* Hide/Show Chat Toggle Button */}
          <button
            onClick={() => {
              setIsChatHidden(prev => !prev);
              setShowWatchers(false);
              setShowEmojis(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${isChatHidden ? "bg-zinc-800/80 border-zinc-700 text-yellow-400" : "bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"}`}
            title={isChatHidden ? "Hiện cuộc trò chuyện" : "Tạm ẩn cuộc trò chuyện"}
          >
            {isChatHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Full Width / Collapse Sidebar Option when chat is hidden */}
          {isChatHidden && (
            <button
              onClick={() => {
                setIsSidebarCollapsed(true);
                setShowWatchers(false);
                setShowEmojis(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border bg-zinc-900/30 border-zinc-900/20 text-zinc-400 hover:text-zinc-200"
              title="Xem toàn màn hình (Ẩn thanh điều khiển)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
              </svg>
            </button>
          )}

        </div>


        <div className={`flex-1 overflow-hidden p-0 relative z-10 transition-opacity duration-300 ${isChatHidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <RoomChat 
            messages={messages} 
            typingUsers={typingUsers}
            onSendMessage={sendMessage} 
            onTyping={triggerTyping}
          />
        </div>
      </div>

      {/* Close the Side-by-side Video/Chat container */}
      </div>

      {/* Bottom Section: Full-width Standalone Episode Selector (Desktop-only, scroll down to see) */}
      {!isTheaterMode && (
        <div className="hidden md:block w-full shrink-0 px-6 py-6 bg-zinc-950/60 border-t border-zinc-900/50 backdrop-blur-md relative z-20">
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
      )}
    {/* New Message Toast Notification Alert */}
      {newMessageNotification && (
        <button
          onClick={() => {
            setIsChatHidden(false);
            setNewMessageNotification(null);
          }}
          className="fixed bottom-24 right-6 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-md text-white border border-blue-500/30 px-4 py-2.5 rounded-xl shadow-2xl z-50 text-xs flex items-center gap-2 animate-bounce cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{newMessageNotification} (Nhấn để xem)</span>
        </button>
      )}
    </div>
  );
}

function KeyboardAndTheaterHandler({ 
  setIsTheaterMode, 
  containerRef 
}: { 
  setIsTheaterMode: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    // Esc key & 'z' key to toggle theater mode (using capture to bypass focus/propagation issues)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing in input/textarea/contenteditable fields
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        setIsTheaterMode(false);
      } else if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        setIsTheaterMode(prev => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    // Listen to native fullscreen changes (e.g. exiting fullscreen via Esc/browser controls)
    const handleFullscreenChange = () => {
      setIsTheaterMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Visual Viewport resize handler to lock layout height on mobile keyboard popups without jittering
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      
      const root = containerRef.current;
      if (root && window.innerWidth < 768) {
        root.style.height = `${viewport.height}px`;
      } else if (root) {
        // Reset styles for desktop
        root.style.height = "";
      }
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      // Run immediately
      handleResize();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, [setIsTheaterMode, containerRef]);

  return null;
}



