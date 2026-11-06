import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";
import { PlateId, VueltaPlaca } from "./VueltaPlaca";

/**
 * Vuelta Bar — Reel 9:16 reutilizable.
 * Tramos de video (ya recortados a 1080x1920) con el mismo tratamiento de color
 * y grano que las placas, gancho en pantalla los primeros segundos y cierre con
 * la placa animada (formato story).
 */

export type VueltaReelProps = {
  /** Archivos dentro de public/ (mp4 1080x1920 30 fps), en orden. */
  clips: { src: string; frames: number }[];
  hook: { kicker: string; titulo: string };
  endPlate: PlateId;
  endPhoto?: string | null;
  endFocus?: string;
  endFrames: number;
  /** Leyenda legal en la placa de cierre (obligatoria si el Reel muestra alcohol). */
  endLegal?: boolean;
  /** Volumen del sonido original de los clips (0–1). */
  volume?: number;
};

const oswald = loadOswald(["500", "700"]).fontFamily;
loadInter(["500"]);
const C = spec.brand.colors;
const story = spec.formats.story;

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  );

export const reelDuration = (p: Pick<VueltaReelProps, "clips" | "endFrames">) =>
  p.clips.reduce((a, c) => a + c.frames, 0) + p.endFrames;

const Hook: React.FC<{ kicker: string; titulo: string }> = ({ kicker, titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200, stiffness: 110 } });
  const out = interpolate(frame, [70, 82], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill
        style={{ background: "linear-gradient(to bottom, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0.55) 30%, rgba(10,10,11,0) 52%)" }}
      />
      <div style={{ position: "absolute", top: story.safe.top + 40, left: story.safe.left, right: story.safe.right }}>
        <div
          style={{
            width: story.led.width * r(0),
            height: story.led.height,
            marginBottom: story.led.marginBottom,
            backgroundColor: C.ambar,
            borderRadius: story.led.height,
            boxShadow: `0 0 18px ${C.ambarGlow}, 0 0 42px rgba(242,163,58,0.35)`,
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 500,
            fontSize: story.kicker.size,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.ambar,
            marginBottom: story.kicker.marginBottom,
            opacity: r(4),
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 124,
            lineHeight: 0.94,
            textTransform: "uppercase",
            color: C.blanco,
            whiteSpace: "pre-line",
            textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            opacity: r(8),
            transform: `translateY(${interpolate(r(8), [0, 1], [30, 0])}px)`,
          }}
        >
          {titulo}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const VueltaReel: React.FC<VueltaReelProps> = ({ clips, hook, endPlate, endPhoto, endFocus, endFrames, endLegal, volume = 0.5 }) => {
  let from = 0;
  const seqs = clips.map((c, i) => {
    const s = (
      <Sequence key={i} from={from} durationInFrames={c.frames}>
        <AbsoluteFill style={{ backgroundColor: C.carbono }}>
          <OffthreadVideo
            src={staticFile(c.src)}
            volume={volume}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9) contrast(1.1) saturate(0.95)" }}
          />
          <AbsoluteFill style={{ backgroundColor: C.ambar, opacity: 0.1, mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
        </AbsoluteFill>
      </Sequence>
    );
    from += c.frames;
    return s;
  });
  const total = from;
  return (
    <AbsoluteFill style={{ backgroundColor: C.carbono }}>
      {seqs}
      <Sequence from={0} durationInFrames={Math.min(84, total)}>
        <Hook {...hook} />
      </Sequence>
      <AbsoluteFill
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "300px 300px", opacity: 0.07, mixBlendMode: "overlay" }}
      />
      <Sequence from={total} durationInFrames={endFrames}>
        <VueltaPlaca plate={endPlate} format="story" photo={endPhoto ?? null} focus={endFocus} legal={endLegal} />
      </Sequence>
    </AbsoluteFill>
  );
};
