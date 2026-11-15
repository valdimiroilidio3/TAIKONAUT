"use client";

import Image, { type ImageProps } from "next/image";
import { useStore } from "@/context/StoreContext";

/** An explicit missing-media state. Never substitutes a different garment. */
export function AssetImage(props: ImageProps){
  const {language}=useStore();
  if(!props.src){
    const decorative = !props.alt;
    return <div
      className={`missing-photo ${props.fill?"absolute inset-0":""} ${props.className??""}`}
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": props.alt })}
      data-asset-status="missing"
    >
      {!decorative && (
        <span className="mono !text-[9px]">
          {language==="pt"?"Fotografia por disponibilizar":"Photograph not yet supplied"}
        </span>
      )}
    </div>;
  }
  return <Image {...props} alt={props.alt} />;
}
