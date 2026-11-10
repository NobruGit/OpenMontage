import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";

/**
 * Vuelta Bar — historia "reloj": el reloj pasa de la hora previa a la hora de
 * arranque (p. ej. 17:59 → 18:00), titila como un LED y aparece el mensaje.
 * Fondo: uno o dos clips 1080x1920 oscurecidos.
 */
export type VueltaRelojProps = {
  clips: { src: string; frames: number }[];
  antes: string;
  hora: string;
  kicker: string;
  titulo: string;
  subtitulo: string;
  /** Cuadro en que cambia la hora. */
  cambio?: number;
  legal?: boolean;
};

const oswald = loadOswald(["500", "700"]).fontFamily;
const inter = loadInter(["500"]).fontFamily;
const C = spec.brand.colors;
const story = spec.formats.story;

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  );

export const relojDuration = (p: Pick<VueltaRelojProps, "clips">) => p.clips.reduce((a, c) => a + c.frames, 0);

export const VueltaReloj: React.FC<VueltaRelojProps> = ({ clips, antes, hora, kicker, titulo, subtitulo, cambio = 36, legal = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const after = frame >= cambio;
  // parpadeo tipo LED al cambiar la hora
  const flick = interpolate(frame, [cambio, cambio + 3, cambio + 5, cambio + 7, cambio + 12], [1, 0.25, 1, 0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = after ? interpolate(frame, [cambio, cambio + 10, cambio + 40], [0, 1, 0.65], { extrapolateRight: "clamp" }) : 0;
  const pop = spring({ frame: frame - cambio, fps, config: { damping: 12, stiffness: 160 } });
  const clockScale = after ? interpolate(pop, [0, 1], [1.18, 1]) : 1;
  const r = (d: number) => spring({ frame: frame - cambio - d, fps, config: { damping: 200, stiffness: 110 } });
  const intro = spring({ frame, fps, config: { damping: 200 } });

  let from = 0;
  const bg = clips.map((c, i) => {
    const s = (
      <Sequence key={i} from={from} durationInFrames={c.frames}>
        <OffthreadVideo src={staticFile(c.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8) contrast(1.1) saturate(0.95)" }} />
      </Sequence>
    );
    from += c.frames;
    return s;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.carbono }}>
      {bg}
      <AbsoluteFill style={{ backgroundColor: C.ambar, opacity: 0.12, mixBlendMode: "soft-light" }} />
      {/* oscurecido: más fuerte antes del cambio, se abre después */}
      <AbsoluteFill style={{ backgroundColor: "rgba(10,10,11,1)", opacity: after ? interpolate(frame, [cambio, cambio + 20], [0.72, 0.45], { extrapolateRight: "clamp" }) : 0.72 }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.5) 30%, rgba(10,10,11,0) 55%)" }} />

      <div
        style={{
          position: "absolute",
          top: story.safe.top,
          left: story.safe.left,
          fontFamily: oswald,
          fontWeight: 500,
          fontSize: story.handle.size,
          letterSpacing: story.handle.tracking,
          color: C.blanco,
          opacity: 0.8,
          textTransform: "uppercase",
        }}
      >
        {spec.brand.handle}
      </div>

      {/* reloj */}
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: intro }}>
        <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 40, letterSpacing: "0.3em", color: C.ambar, textTransform: "uppercase", marginBottom: 10 }}>{kicker}</div>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 330,
            lineHeight: 1,
            letterSpacing: "0.02em",
            fontVariantNumeric: "tabular-nums",
            color: after ? C.ambar : C.blanco,
            opacity: after ? flick : 0.9,
            transform: `scale(${clockScale})`,
            textShadow: after ? `0 0 ${30 + 50 * glow}px ${C.ambarGlow}, 0 0 ${90 * glow}px rgba(242,163,58,0.55)` : "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          {after ? hora : antes}
        </div>
        <div
          style={{
            width: interpolate(r(0), [0, 1], [0, 520]),
            height: story.led.height,
            marginTop: 20,
            backgroundColor: C.ambar,
            borderRadius: story.led.height,
            boxShadow: `0 0 18px ${C.ambarGlow}, 0 0 42px rgba(242,163,58,0.35)`,
          }}
        />
      </div>

      {/* mensaje */}
      <div style={{ position: "absolute", left: story.safe.left, right: story.safe.right, bottom: story.safe.bottom, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 128,
            lineHeight: 1.08,
            color: C.blanco,
            textTransform: "uppercase",
            whiteSpace: "pre-line",
            textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            opacity: r(6),
            transform: `translateY(${interpolate(r(6), [0, 1], [40, 0])}px)`,
          }}
        >
          {titulo}
        </div>
        <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 40, color: C.blanco, marginTop: 22, opacity: 0.9 * r(14) }}>{subtitulo}</div>
        {legal ? (
          <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 22, color: C.blanco, marginTop: 26, opacity: 0.7 * r(18) }}>{spec.brand.legal}</div>
        ) : null}
      </div>

      <AbsoluteFill style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "300px 300px", opacity: 0.07, mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};
