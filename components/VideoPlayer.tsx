"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  poster: string;
  videoUrl?: string;
  embedUrl?: string;
  onPlaySync?: () => void;
  onPauseSync?: () => void;
  onSeekSync?: (time: number) => void;
  externalVideoRef?: React.RefObject<HTMLVideoElement | null>;
  hasNextEpisode?: boolean;
  onAutoNext?: () => void;
}

export default function VideoPlayer({
  poster,
  videoUrl,
  embedUrl,
  onPlaySync,
  onPauseSync,
  onSeekSync,
  externalVideoRef,
  hasNextEpisode,
  onAutoNext
}: VideoPlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New Features States
  const [ambientActive, setAmbientActive] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showAutoNext, setShowAutoNext] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState(5);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ambient Light Canvas Draw Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ambientActive || !isPlaying) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastDrawTime = 0;

    const drawFrame = (now: number) => {
      if (video.paused || video.ended) return;
      
      // Cap drawing rate to ~15fps (every 66ms) to save CPU/GPU cycles
      if (now - lastDrawTime >= 66) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          lastDrawTime = now;
        } catch (err) {
          // Cross-origin streaming might taint the canvas
          console.warn("Ambient Light: Cannot draw frame due to CORS constraints.", err);
        }
      }
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, ambientActive, videoRef]);

  // Monitor playback for Auto-Next trigger
  useEffect(() => {
    if (!hasNextEpisode || !onAutoNext) return;

    const remainingTime = duration - currentTime;
    if (isPlaying && duration > 0 && remainingTime > 0 && remainingTime <= 5) {
      if (!showAutoNext) {
        setShowAutoNext(true);
        setAutoNextCountdown(Math.ceil(remainingTime));
      }
    } else {
      // Hide if user seeks back or pauses
      if (showAutoNext && (remainingTime > 6 || remainingTime <= 0 || !isPlaying)) {
        setShowAutoNext(false);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }
  }, [currentTime, duration, isPlaying, hasNextEpisode, onAutoNext, showAutoNext]);

  // Countdown timer for Auto-Next
  useEffect(() => {
    if (showAutoNext) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setAutoNextCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            setShowAutoNext(false);
            if (onAutoNext) onAutoNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showAutoNext, onAutoNext]);

  // Setup HLS / Stream source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported() && videoUrl.endsWith(".m3u8")) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (hls) hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (hls) hls.recoverMediaError();
              break;
            default:
              if (hls) hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl, embedUrl]);

  const [showControls, setShowControls] = useState(true);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlayStateChange = () => {
      setIsPlaying(!video.paused);
      if (video.paused) {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        resetControlsTimer();
      }
    };

    video.addEventListener("play", onPlayStateChange);
    video.addEventListener("pause", onPlayStateChange);

    return () => {
      video.removeEventListener("play", onPlayStateChange);
      video.removeEventListener("pause", onPlayStateChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (onPlaySync) onPlaySync();
    } else {
      video.pause();
      setIsPlaying(false);
      if (onPauseSync) onPauseSync();
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
    if (onSeekSync) onSeekSync(time);
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancelAutoNext = () => {
    setShowAutoNext(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  return (
    <div className={`relative w-full ${isCinemaMode ? "z-[45]" : "z-10"}`}>
      {/* Cinema Backdrop */}
      {isCinemaMode && (
        <div 
          onClick={() => setIsCinemaMode(false)}
          className="fixed inset-0 bg-black/95 z-[40] cursor-pointer transition-opacity duration-300"
        />
      )}

      {/* Ambient Light Canvas (Glow) */}
      {ambientActive && !embedUrl && (
        <canvas
          ref={canvasRef}
          width="16"
          height="9"
          className="absolute inset-0 w-full h-full blur-[60px] opacity-70 scale-[1.15] pointer-events-none transition-opacity duration-500 rounded-lg"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Player Container */}
      <div 
        className="relative w-full bg-black rounded-lg overflow-hidden group z-10"
        onMouseMove={resetControlsTimer}
        onMouseLeave={() => {
          if (videoRef.current && !videoRef.current.paused) {
            setShowControls(false);
          }
        }}
      >
        {embedUrl && (
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        )}
        {!embedUrl && (
          <video
            ref={videoRef}
            poster={poster}
            crossOrigin="anonymous"
            className="w-full aspect-video relative z-10"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => {
              setIsPlaying(true);
              if (onPlaySync) onPlaySync();
            }}
            onPause={() => {
              setIsPlaying(false);
              if (onPauseSync) onPauseSync();
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (onPauseSync) onPauseSync();
            }}
          />
        )}

        {/* Auto-Next Countdown overlay */}
        {showAutoNext && (
          <div className="absolute top-4 right-4 bg-zinc-900/95 border border-zinc-800 text-white p-4 rounded-xl shadow-2xl z-30 max-w-[280px] backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-medium mb-1">Tập tiếp theo sẽ phát sau</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-blue-500">{autoNextCountdown}s</span>
              <button
                onClick={() => {
                  setShowAutoNext(false);
                  if (onAutoNext) onAutoNext();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Chuyển ngay
              </button>
              <button
                onClick={handleCancelAutoNext}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Custom Controls - only show for video element */}
        {!embedUrl && (
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between text-xs text-zinc-300 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-zinc-300 [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Ambient Light Toggle */}
                <button
                  onClick={() => setAmbientActive(!ambientActive)}
                  className={`transition-colors p-1 rounded-md hover:bg-zinc-800 ${ambientActive ? "text-blue-400" : "text-zinc-500"}`}
                  title="Bật/Tắt hiệu ứng đèn nền (Ambient Light)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-3.343" />
                  </svg>
                </button>

                {/* Cinema Mode button */}
                <button
                  onClick={() => setIsCinemaMode(!isCinemaMode)}
                  className={`transition-colors p-1 rounded-md hover:bg-zinc-800 ${isCinemaMode ? "text-yellow-400" : "text-zinc-300"}`}
                  title="Chế độ rạp chiếu phim"
                >
                  {isCinemaMode ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75zM6.162 5.102a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06zm11.676 0a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0zM12 6a6 6 0 1 0 6 6 6.007 6.007 0 0 0-6-6zm0 10.5a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1-4.5 4.5zM3 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12zm15 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-2.25A.75.75 0 0 1 18 12zM6.162 18.898a.75.75 0 0 1 0-1.06l1.59-1.59a.75.75 0 1 1 1.06 1.06l-1.59 1.59a.75.75 0 0 1-1.06 0zm11.676 0a.75.75 0 0 1-1.06 0l-1.59-1.59a.75.75 0 1 1 1.06-1.06l1.59 1.59a.75.75 0 0 1 0 1.06zM12 18.75a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 1 0 9 9h-9V3z" />
                    </svg>
                  )}
                </button>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors p-1 rounded-md hover:bg-zinc-800"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


