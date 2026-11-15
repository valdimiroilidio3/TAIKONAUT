"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useSyncExternalStore } from "react";
import { useStore } from "@/context/StoreContext";

/** useSyncExternalStore gives a hydration-safe "mounted" flag with no effect. */
const noopSubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type AssetState = {
  src: ImageProps["src"];
  loaded: boolean;
  failed: boolean;
};

/**
 * Single source of truth for media states:
 *  - no src             -> explicit "photograph not supplied" state (never a fake garment)
 *  - network/decode error -> explicit "image unavailable" state, still accessible
 *  - loading            -> subtle skeleton, rendered only after mount so the
 *                          server HTML (and no-JS) always contains the real image
 *  - ready              -> real Next.js-optimised image
 */
export function AssetImage(props: ImageProps) {
  const { language } = useStore();
  const mounted = useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot);
  const src = props.src;
  const [record, setRecord] = useState<AssetState>({ src, loaded: false, failed: false });
  // State is keyed by src, so a prop change resets itself without an effect.
  const { loaded, failed } = record.src === src ? record : { loaded: false, failed: false };

  if (!src || failed) {
    const decorative = !props.alt;
    return (
      <div
        className={`missing-photo ${props.fill ? "absolute inset-0" : ""} ${props.className ?? ""}`}
        {...(decorative
          ? { "aria-hidden": true as const }
          : { role: "img", "aria-label": props.alt })}
        data-asset-status={src ? "error" : "missing"}
      >
        {!decorative && (
          <span className="mono !text-[9px]">
            {src
              ? language === "pt" ? "Imagem indisponível" : "Image unavailable"
              : language === "pt" ? "Fotografia por disponibilizar" : "Photograph not yet supplied"}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {mounted && !loaded && props.fill && (
        <span className="cine-skeleton" aria-hidden="true" data-asset-skeleton="" />
      )}
      <Image
        {...props}
        alt={props.alt}
        onLoad={() => setRecord({ src, loaded: true, failed: false })}
        onError={() => setRecord({ src, loaded: false, failed: true })}
        data-asset-status={loaded ? "ready" : "loading"}
      />
    </>
  );
}
