import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";

/**
 * Vuelta Bar — historia "¿Cuál pedís?": pantalla partida con dos productos y
 * una franja central con la pregunta. Deja aire debajo de la franja para que
 * el sticker de encuesta de Instagram se agregue desde la app.
 */
export type VueltaVersusProps = {
  top: { photo: string; label: string; focus?: string };
  bottom: { photo: string; label: string; focus?: string };
  kicker: string;
  pregunta: string;
};

const oswald = loadOswald(["500", "700"]).fontFamily;
loadInter(["500"]);
const C = spec.brand.colors;

const Half: React.FC<{ photo: string; label: string; focus?: string; top: boolean; t: number }> = ({ photo, label, focus, top, t }) => (
  <div style={{ position: "absolute", left: 0, right: 0, height: 960, top: top ? 0 : 960, overflow: "hidden" }}>
    <Img
      src={staticFile(photo)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: focus ?? "50% 50%",
        filter: "brightness(0.88) contrast(1.08) saturate(0.95)",
        transform: `scale(${1.04 + 0.04 * t})`,
      }}
    />
    <AbsoluteFill style={{ backgroundColor: C.ambar, opacity: 0.1, mixBlendMode: "soft-light" }} />
    <AbsoluteFill
      style={{
        background: top
          ? "linear-gradient(to bottom, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0) 30%, rgba(10,10,11,0) 70%, rgba(10,10,11,0.85) 100%)"
          : "linear-gradient(to top, rgba(10,10,11,0.6) 0%, rgba(10,10,11,0) 30%, rgba(10,10,11,0) 70%, rgba(10,10,11,0.85) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 90,
        [top ? "top" : "bottom"]: top ? 250 : 400,
        fontFamily: oswald,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 0.95,
        color: C.blanco,
        textTransform: "uppercase",
        whiteSpace: "pre-line",
        textShadow: "0 2px 24px rgba(0,0,0,0.6)",
      }}
    >
      {label}
    </div>
  </div>
);

export const VueltaVersus: React.FC<VueltaVersusProps> = ({ top, bottom, kicker, pregunta }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const r = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const led = interpolate(frame, [4, 8, 10, 12, 18], [0, 1, 0.35, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: C.grafito }}>
      <Half {...top} top t={t} />
      <Half {...bottom} top={false} t={t} />
      {/* franja central */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 960 - 150,
          height: 300,
          background: "rgba(10,10,11,0.92)",
          borderTop: `4px solid ${C.ambar}`,
          borderBottom: `4px solid ${C.ambar}`,
          boxShadow: `0 0 26px ${C.ambarGlow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: led,
        }}
      >
        <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 30, letterSpacing: "0.28em", color: C.ambar, textTransform: "uppercase", marginBottom: 12 }}>
          {kicker}
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 110,
            lineHeight: 1,
            color: C.blanco,
            textTransform: "uppercase",
            transform: `scale(${interpolate(r, [0, 1], [0.9, 1])})`,
            opacity: r,
          }}
        >
          {pregunta}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 90,
          fontFamily: oswald,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: "0.12em",
          color: C.blanco,
          opacity: 0.75,
          textTransform: "uppercase",
          textShadow: "0 1px 12px rgba(0,0,0,0.6)",
        }}
      >
        {spec.brand.handle}
      </div>
    </AbsoluteFill>
  );
};
