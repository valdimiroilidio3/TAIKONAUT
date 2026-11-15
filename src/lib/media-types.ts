export interface VideoSources {
  mp4: string;
  webm?: string;
}

export interface ArrivalMedia {
  desktop: VideoSources | null;
  mobile: VideoSources | null;
  posterDesktop: string;
  posterMobile: string;
  hasAudio: boolean;
  posterCaptionPt: string;
  posterCaptionEn: string;
  videoCaptionPt: string;
  videoCaptionEn: string;
  altPt: string;
  altEn: string;
}
