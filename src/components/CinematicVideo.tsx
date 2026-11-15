"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { ArrivalMedia, VideoSources } from "@/lib/media-types";
import { useStore } from "@/context/StoreContext";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

export function CinematicVideo({ media, onVideoChange }: { media: ArrivalMedia; onVideoChange?: (active: boolean) => void }) {
  const { language } = useStore();
  const [source, setSource] = useState<VideoSources | null>(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const t = (pt: string, en: string) => language === "pt" ? pt : en;

  const { props: desktop } = getImageProps({ src:media.posterDesktop, alt:t(media.altPt,media.altEn), width:1600, height:1000, sizes:"100vw", quality:85, loading:"eager" });
  const { props: mobile } = getImageProps({ src:media.posterMobile, alt:"", width:720, height:1080, sizes:"100vw", quality:85 });

  useEffect(() => { if (posterRef.current?.complete) setPosterLoaded(true); }, []);
  useEffect(() => { onVideoChange?.(Boolean(ready && source && !failed)); }, [ready, source, failed, onVideoChange]);

  useEffect(() => {
    const narrow = matchMedia("(max-width: 767px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const choose = () => {
      const save = connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
      // Never load desktop footage on mobile as a fallback.
      const selected = motion.matches || save ? null : narrow.matches ? media.mobile : media.desktop;
      setSource(selected); setReady(false); setFailed(false);
    };
    choose();
    narrow.addEventListener("change", choose);
    motion.addEventListener("change", choose);
    connection?.addEventListener("change", choose);
    return () => {
      narrow.removeEventListener("change", choose);
      motion.removeEventListener("change", choose);
      connection?.removeEventListener("change", choose);
    };
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame || !source || !posterLoaded || failed) return;
    let visible = false;
    const update = () => {
      if (visible && !document.hidden && !paused) {
        void video.play().catch(() => { setPaused(true); });
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold:0.1 });
    observer.observe(frame);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",update); video.pause(); };
  }, [source, posterLoaded, paused, failed]);

  return (
    <>
      <div ref={frameRef} className="arrival-media">
        <picture>
          <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
          <img ref={posterRef} {...desktop} alt={desktop.alt ?? ""} fetchPriority="high" onLoad={() => setPosterLoaded(true)} className="absolute inset-0" />
        </picture>
        {source && posterLoaded && !failed && (
          <video
            key={source.mp4}
            ref={videoRef}
            className={`arrival-video ${ready ? "ready" : ""}`}
            poster={source.mp4 === media.mobile?.mp4 ? media.posterMobile : media.posterDesktop}
            muted={muted}
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            aria-hidden="true"
            onPlaying={() => setReady(true)}
            onError={() => { setFailed(true); setReady(false); }}
          >
            {source.webm && <source src={source.webm} type="video/webm" />}
            <source src={source.mp4} type="video/mp4" />
          </video>
        )}
      </div>
      {source && !failed && (
        <div className="absolute right-[var(--page-gutter)] top-7 z-10 flex gap-2 text-white">
          <button className="video-control" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? t("Reproduzir vídeo", "Play video") : t("Pausar vídeo", "Pause video")}>
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          {media.hasAudio && <button className="video-control" type="button" onClick={() => setMuted(!muted)} aria-label={muted ? t("Ativar som", "Enable sound") : t("Silenciar", "Mute")}>
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>}
        </div>
      )}
    </>
  );
}
