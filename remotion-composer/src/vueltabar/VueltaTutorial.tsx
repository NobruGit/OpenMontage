import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";

/**
 * Vuelta Bar — tutorial en imágenes (1080x1920) para mandar por WhatsApp o subir como historia.
 * Cada lámina: número de paso, título, celular con la captura real y una lista corta de indicaciones.
 * `highlight` marca (en % de la captura) la zona a tocar con un recuadro ámbar.
 */
export type VueltaTutorialProps = {
  paso: number;
  total: number;
  titulo: string;
  screen?: string;
  highlight?: { top: number; left: number; width: number; height: number };
  items: { text: string; tipo?: "ok" | "no" | "dato" }[];
  pie?: string;
  /** Globo de diálogo grande (para pasos sin captura). */
  burbuja?: string;
};

const oswald = loadOswald(["500", "700"]).fontFamily;
const inter = loadInter(["500"]).fontFamily;
const C = spec.brand.colors;

const marca = { ok: "✓", no: "✕", dato: "•" } as const;
const color = { ok: "#5BD38A", no: "#FF6B5B", dato: C.ambar } as const;

export const VueltaTutorial: React.FC<VueltaTutorialProps> = ({ paso, total, titulo, screen, highlight, items, pie, burbuja }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(242,163,58,0.22), rgba(242,163,58,0) 70%), ${C.grafito}` }}>
    {/* encabezado */}
    <div style={{ position: "absolute", top: 110, left: 80, right: 80 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 34, letterSpacing: "0.22em", color: C.ambar, textTransform: "uppercase" }}>
          Club de puntos · La Vuelta
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ width: 54, height: 10, borderRadius: 5, background: i < paso ? C.ambar : "rgba(255,255,255,0.18)", boxShadow: i < paso ? `0 0 14px ${C.ambarGlow}` : "none" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 40 }}>
        <div
          style={{
            flex: "0 0 auto",
            width: 150,
            height: 150,
            borderRadius: 75,
            background: C.ambar,
            color: C.carbono,
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${C.ambarGlow}`,
          }}
        >
          {paso}
        </div>
        <div style={{ fontFamily: oswald, fontWeight: 700, fontSize: 96, lineHeight: 1.06, color: C.blanco, textTransform: "uppercase", whiteSpace: "pre-line" }}>{titulo}</div>
      </div>
    </div>

    {/* celular */}
    {screen ? (
      <div style={{ position: "absolute", left: 80, top: 520, width: 470, height: 960, borderRadius: 62, background: "#0b0b0c", padding: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.12)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: "#fff" }}>
          <Img src={staticFile(screen)} style={{ width: "100%", height: "auto", display: "block" }} />
          {highlight ? (
            <div
              style={{
                position: "absolute",
                top: `${highlight.top}%`,
                left: `${highlight.left}%`,
                width: `${highlight.width}%`,
                height: `${highlight.height}%`,
                border: `6px solid ${C.ambar}`,
                borderRadius: 18,
                boxShadow: `0 0 0 2000px rgba(0,0,0,0.35), 0 0 24px ${C.ambarGlow}`,
              }}
            />
          ) : null}
        </div>
      </div>
    ) : null}

    {/* indicaciones */}
    <div style={{ position: "absolute", left: screen ? 600 : 80, right: 70, top: 560, display: "flex", flexDirection: "column", gap: 40 }}>
      {items.map((it, i) => {
        const t = it.tipo ?? "dato";
        return (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 auto", fontFamily: inter, fontWeight: 500, fontSize: 44, lineHeight: 1.15, color: color[t], width: 36 }}>{marca[t]}</div>
            <div style={{ fontFamily: inter, fontWeight: 500, fontSize: 40, lineHeight: 1.25, color: C.blanco, whiteSpace: "pre-line" }}>{it.text}</div>
          </div>
        );
      })}
    </div>

    {burbuja ? (
      <div style={{ position: "absolute", left: 80, right: 80, top: 1080 }}>
        <div style={{ fontFamily: oswald, fontWeight: 500, fontSize: 30, letterSpacing: "0.2em", color: C.ambar, textTransform: "uppercase", marginBottom: 18 }}>En la caja</div>
        <div style={{ position: "relative", padding: "40px 48px", borderRadius: 40, borderBottomLeftRadius: 8, background: C.blanco, color: C.carbono, fontFamily: inter, fontWeight: 500, fontSize: 50, lineHeight: 1.25, whiteSpace: "pre-line", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          {burbuja}
        </div>
      </div>
    ) : null}

    {pie ? (
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 170, padding: "28px 36px", borderRadius: 28, background: "rgba(242,163,58,0.12)", border: `2px solid rgba(242,163,58,0.5)`, fontFamily: inter, fontWeight: 500, fontSize: 38, lineHeight: 1.3, color: C.blanco, whiteSpace: "pre-line" }}>
        {pie}
      </div>
    ) : null}

    <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center", fontFamily: oswald, fontWeight: 500, fontSize: 30, letterSpacing: "0.12em", color: C.blanco, opacity: 0.6, textTransform: "uppercase" }}>
      {spec.brand.handle} · Marañón 585
    </div>
  </AbsoluteFill>
);
