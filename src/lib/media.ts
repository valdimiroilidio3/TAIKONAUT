import { statSync } from "node:fs";
import path from "node:path";
import config from "@/data/media.json";
import type { ArrivalMedia, VideoSources } from "./media-types";

// Server-only resolution: unprovided video paths never enter browser markup.
function available(file: string): boolean {
  const root = path.resolve(process.cwd(), "public");
  const resolved = path.resolve(root, file.replace(/^\/+/, ""));
  if (!resolved.startsWith(root + path.sep)) return false;
  try {
    const stat = statSync(resolved);
    return stat.isFile() && stat.size > 1024;
  } catch {
    return false;
  }
}

function sources(value: { mp4: string; webm: string }): VideoSources | null {
  if (!config.arrival.enableVideo || !available(value.mp4)) return null;
  return { mp4: value.mp4, ...(available(value.webm) ? { webm: value.webm } : {}) };
}

export function getArrivalMedia(): ArrivalMedia {
  return {
    ...config.arrival,
    desktop: sources(config.arrival.desktop),
    mobile: sources(config.arrival.mobile),
  };
}
