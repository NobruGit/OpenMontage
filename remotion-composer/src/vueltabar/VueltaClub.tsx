import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";

/**
 * Vuelta Bar — historias del Club de puntos (1080x1920).
 * "sumate": foto del bar + celular con la página del club + 3 pasos.
 * "premios": escalera de premios con sus puntos.
 * Los datos (pasos, puntos, premios) vienen por props: copiarlos tal cual de la página del club.
 */
export type VueltaClubProps = {
  variant: "sumate" | "premios";
  photo: string;
  focus?: string;
  screen?: string;
  kicker: string;
  titulo: string;
  subtitulo?: string;
  pasos?: string[];
  premios?: { nombre: string; puntos: number; img: string }[];
  cierre: string;
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

const Led: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: story.led.height, backgroundColor: C.ambar, borderRadius: story.led.height, boxShadow: `0 0 18px ${C.ambarGlow}, 0 0 42px rgba(242,163,58,0.35)` }} />
);

export const VueltaClub: React.FC<VueltaClubProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200, stiffness: 100 } });
  const up = (d: number) => ({ opacity: r(d), transform: `translateY(${interpolate(r(d), [0, 1], [30, 0])}px)` });
  const zoom = interpolate(frame, [0, 150], [1.06, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: C.grafito, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile(p.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.focus ?? "50% 50%", filter: "brightness(0.85) contrast(1.08)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: C.ambar, opacity: 0.1, mixBlendMode: "soft-light" }} />
      <AbsoluteFill
        style={{
          background:
            p.variant === "sumate"
              ? "linear-gradient(to bottom, rgba(10,10,11,0.9) 0%, rgba(10,10,11,0.55) 30%, rgba(10,10,11,0.35) 50%, rgba(10,10,11,0.92) 78%, rgba(10,10,11,0.97) 100%)"
              : "linear-gradient(to bottom, rgba(10,10,11,0.88) 0%, rgba(10,10,11,0.8) 100%)",
        }}
      />

      <div style={{ position: "absolute", top: story.safe.top - 110, left: story.safe.left, fontFamily: oswald, fontWeight: 500, fontSize: story.handle.size, letterSpacing: story.handle.tracking, color: C.blanco, opacity: 0.8, textTransform: "uppercase" }}>
        {spec.brand.handle}
      </div>

      {/* encabezado */}
      <div style={{ position: "absolute", top: story.safe.top - 40, left: story.safe.left, right: story.safe.right }}>
        <div style={{ ...up(0) }}>
          <Led w={story.led.width} />
        </div>
        <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 40, letterSpacing: "0.26em", color: C.ambar, textTransform: "uppercase", marginTop: 22, ...up(4) }}>{p.kicker}</div>
        <div style={{ fontFamily: oswald, fontWeight: 700, fontSize: 132, lineHeight: 1.06, color: C.blanco, textTransform: "uppercase", whiteSpace: "pre-line", marginTop: 8, textShadow: "0 2px 24px rgba(0,0,0,0.5)", ...up(8) }}>
          {p.titulo}
        </div>
        {p.subtitulo ? <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 40, color: C.blanco, opacity: 0.9, marginTop: 14, ...up(12) }}>{p.subtitulo}</div> : null}
      </div>

      {p.variant === "sumate" ? (
        <>
          {/* celular */}
          <div
            style={{
              position: "absolute",
              right: 70,
              top: 760,
              width: 400,
              height: 820,
              borderRadius: 56,
              background: "#0b0b0c",
              padding: 14,
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 3px rgba(242,163,58,0.55), 0 0 40px rgba(242,163,58,0.25)`,
              transform: `rotate(4deg) translateY(${interpolate(r(14), [0, 1], [80, 0])}px)`,
              opacity: r(14),
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: "#fff" }}>
              <Img src={staticFile(p.screen!)} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
          {/* pasos */}
          <div style={{ position: "absolute", left: story.safe.left, top: 800, width: 500, display: "flex", flexDirection: "column", gap: 40 }}>
            {(p.pasos ?? []).map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, ...up(18 + i * 6) }}>
                <div
                  style={{
                    flex: "0 0 auto",
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    border: `4px solid ${C.ambar}`,
                    color: C.ambar,
                    fontFamily: oswald,
                    fontWeight: 700,
                    fontSize: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 18px rgba(242,163,58,0.45)`,
                    background: "rgba(10,10,11,0.6)",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 40, lineHeight: 1.2, color: C.blanco, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>{t}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: story.safe.left, right: story.safe.right, top: 610, display: "flex", flexDirection: "column", gap: 16 }}>
          {(p.premios ?? []).map((x, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "14px 28px 14px 14px",
                borderRadius: 30,
                background: "rgba(255,255,255,0.06)",
                border: "2px solid rgba(242,163,58,0.35)",
                ...up(12 + i * 5),
              }}
            >
              <Img src={staticFile(x.img)} style={{ width: 124, height: 124, borderRadius: 20, objectFit: "cover", background: "#fff", flex: "0 0 auto" }} />
              <div style={{ flex: 1, fontFamily: oswald, fontWeight: 700, fontSize: 46, lineHeight: 1.08, color: C.blanco, textTransform: "uppercase", whiteSpace: "pre-line" }}>{x.nombre}</div>
              <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                <div style={{ fontFamily: oswald, fontWeight: 700, fontSize: 70, lineHeight: 1, color: C.ambar, textShadow: `0 0 22px rgba(242,163,58,0.5)` }}>{x.puntos}</div>
                <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 28, letterSpacing: "0.2em", color: C.ambar }}>PUNTOS</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* cierre */}
      <div style={{ position: "absolute", left: story.safe.left, right: story.safe.right, bottom: 250, ...up(40) }}>
        <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 36, lineHeight: 1.3, color: C.blanco, whiteSpace: "pre-line" }}>{p.cierre}</div>
        {p.legal ? <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 22, color: C.blanco, opacity: 0.7, marginTop: 18 }}>{spec.brand.legal}</div> : null}
      </div>

      <AbsoluteFill style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "300px 300px", opacity: 0.07, mixBlendMode: "overlay" }} />
    </AbsoluteFill>
  );
};
