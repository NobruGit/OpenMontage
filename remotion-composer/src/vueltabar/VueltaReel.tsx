import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
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
  clips: {
    src: string;
    frames: number;
    /** Punto de foco "x% y%": lo de alrededor se desenfoca (efecto de poca profundidad de campo). */
    focus?: string;
    /** Radio de la zona nítida "ancho% alto%" (por defecto "42% 30%"). */
    focusSize?: string;
    /** Intensidad del desenfoque del fondo en px (por defecto 16; 0 = sin desenfoque). */
    blur?: number;
    /** Solo fotos: zoom inicial y final (movimiento lento) y punto de origen del zoom. */
    zoomFrom?: number;
    zoomTo?: number;
    origin?: string;
  }[];
  hook: { kicker: string; titulo: string };
  endPlate: PlateId;
  endPhoto?: string | null;
  endFocus?: string;
  endFrames: number;
  /** Leyenda legal en la placa de cierre (obligatoria si el Reel muestra alcohol). */
  endLegal?: boolean;
  /** Sube la foto de la placa de cierre (ver VueltaPlaca.shiftY). */
  endShiftY?: number;
  /** Textos propios para la placa de cierre. */
  endTitulo?: string;
  endSubtitulo?: string;
  endKicker?: string;
  /** Volumen del sonido original de los clips (0–1). */
  volume?: number;
  /** Pista de música dentro de public/ (reemplaza o acompaña el sonido original). */
  music?: string | null;
  musicVolume?: number;
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

const KenBurns: React.FC<{ src: string; frames: number; from: number; to: number; origin: string }> = ({ src, frames, from, to, origin }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, frames], [from, to], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: origin }}>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: origin, filter: "brightness(0.9) contrast(1.1) saturate(0.95)" }}
      />
    </AbsoluteFill>
  );
};

export const VueltaReel: React.FC<VueltaReelProps> = ({ clips, hook, endPlate, endPhoto, endFocus, endFrames, endLegal, endShiftY, endTitulo, endSubtitulo, endKicker, volume = 0.5, music, musicVolume = 1 }) => {
  let from = 0;
  const seqs = clips.map((c, i) => {
    const s = (
      <Sequence key={i} from={from} durationInFrames={c.frames}>
        <AbsoluteFill style={{ backgroundColor: C.carbono }}>
          {/\.(jpe?g|png)$/i.test(c.src) ? (
            <KenBurns src={c.src} frames={c.frames} from={c.zoomFrom ?? 1.04} to={c.zoomTo ?? 1.14} origin={c.origin ?? "50% 40%"} />
          ) : c.focus && (c.blur ?? 16) > 0 ? (
            <>
              {/* Fondo: el mismo clip desenfocado y un poco más oscuro */}
              <OffthreadVideo
                src={staticFile(c.src)}
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(1.06)",
                  filter: `blur(${c.blur ?? 16}px) brightness(0.72) contrast(1.05) saturate(0.85)`,
                }}
              />
              {/* Zona nítida con borde suave alrededor del punto de foco */}
              <AbsoluteFill
                style={{
                  WebkitMaskImage: `radial-gradient(ellipse ${c.focusSize ?? "42% 30%"} at ${c.focus}, #000 55%, transparent 100%)`,
                  maskImage: `radial-gradient(ellipse ${c.focusSize ?? "42% 30%"} at ${c.focus}, #000 55%, transparent 100%)`,
                }}
              >
                <OffthreadVideo
                  src={staticFile(c.src)}
                  volume={volume}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9) contrast(1.1) saturate(0.95)" }}
                />
              </AbsoluteFill>
            </>
          ) : (
            <OffthreadVideo
              src={staticFile(c.src)}
              volume={volume}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9) contrast(1.1) saturate(0.95)" }}
            />
          )}
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
      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
      {seqs}
      <Sequence from={0} durationInFrames={Math.min(84, total)}>
        <Hook {...hook} />
      </Sequence>
      <AbsoluteFill
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "300px 300px", opacity: 0.07, mixBlendMode: "overlay" }}
      />
      <Sequence from={total} durationInFrames={endFrames}>
        <VueltaPlaca plate={endPlate} format="story" photo={endPhoto ?? null} focus={endFocus} legal={endLegal} shiftY={endShiftY} titulo={endTitulo} subtitulo={endSubtitulo} kicker={endKicker} />
      </Sequence>
    </AbsoluteFill>
  );
};
