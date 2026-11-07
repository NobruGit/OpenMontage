import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadInter, loadOswald } from "../lib/localFonts";
import spec from "./placas.layers.json";

/**
 * Vuelta Bar — placa reutilizable (feed 1080x1080, portrait 1080x1350, story 1080x1920).
 * Las medidas, colores y textos viven en placas.layers.json; este archivo solo
 * apila las capas en el orden que define ese JSON (z 0 → 10).
 *
 * Como still: renderizar el último frame (todo en su lugar).
 * Como video (story/reel de 5 s): la tira LED "enciende" y el texto sube.
 */

export type PlateId = keyof typeof spec.plates;
export type FormatId = keyof typeof spec.formats;

export type VueltaPlacaProps = {
  plate: PlateId;
  format: FormatId;
  /** Foto propia: ruta dentro de remotion-composer/public/ o URL https. Sin foto se ve un fondo de prueba. */
  photo?: string | null;
  /** Sobrescriben los textos del JSON (para reutilizar la placa con otro mensaje). */
  kicker?: string;
  titulo?: string;
  subtitulo?: string;
  /** Punto de foco de la foto (object-position), p. ej. "50% 26%". Por defecto, el de la placa. */
  focus?: string;
  /** Zoom sobre la foto (1 = cover justo). Útil para recortar logos o acercar el producto. */
  zoom?: number;
  /** Sube la foto este % del alto (el hueco de abajo queda en grafito bajo el degradado). Para productos que están abajo en la foto. */
  shiftY?: number;
  /** Dónde va el bloque de texto: abajo (por defecto) o arriba, para fotos con el producto abajo. */
  anchor?: "top" | "bottom";
  /** Fuerza mostrar/ocultar la leyenda legal (por defecto: la placa decide; pintas = sí). */
  legal?: boolean;
};

const oswald = loadOswald(["500", "700"]).fontFamily;
const inter = loadInter(["500"]).fontFamily;

const C = spec.brand.colors;
const layer = (id: string) => {
  const l = spec.layers.find((x) => x.id === id);
  if (!l) throw new Error(`Capa ${id} no definida en placas.layers.json`);
  return l as (typeof spec.layers)[number] & Record<string, unknown>;
};

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
  );

/** Fondo de prueba cuando todavía no hay foto: grafito con dos "LEDs" ámbar desenfocados. */
const PlaceholderBg: React.FC = () => (
  <AbsoluteFill
    style={{
      background: [
        "radial-gradient(ellipse 60% 22% at 50% 8%, rgba(242,163,58,0.55), rgba(242,163,58,0) 70%)",
        "radial-gradient(circle at 78% 34%, rgba(242,163,58,0.35), rgba(242,163,58,0) 30%)",
        "radial-gradient(circle at 22% 46%, rgba(255,196,120,0.22), rgba(255,196,120,0) 26%)",
        "linear-gradient(180deg, #1d1b19 0%, #121314 55%, #0a0a0b 100%)",
      ].join(","),
    }}
  />
);

const resolvePhoto = (p: string) => (/^https?:\/\//.test(p) ? p : staticFile(p));

export const VueltaPlaca: React.FC<VueltaPlacaProps> = ({ plate, format, photo, kicker, titulo, subtitulo, focus, zoom = 1, legal, shiftY = 0, anchor = "bottom" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = spec.formats[format];
  const p = spec.plates[plate];
  const src = photo ?? p.photo;
  const objPos = focus ?? p.focus;
  const showLegal = legal ?? p.legal;

  // Animación (queda estática a partir de ~2 s, así el último frame sirve como still).
  const ledOn = interpolate(frame, [6, 10, 12, 14, 22], [0, 1, 0.35, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ledGrow = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const rise = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 90 } });
  const textIn = (delay: number) => ({
    opacity: rise(delay),
    transform: `translateY(${interpolate(rise(delay), [0, 1], [28, 0])}px)`,
  });
  const photoScale = interpolate(frame, [0, 150], [1.06, 1.0], { extrapolateRight: "clamp" });

  const grade = layer("grade_ambar");
  const grain = layer("grano");
  const handle = layer("handle");
  const sub = layer("subtitulo");

  return (
    <AbsoluteFill style={{ backgroundColor: C.grafito, overflow: "hidden" }}>
      {/* z1 foto */}
      {src ? (
        <AbsoluteFill
          style={{
            transform: `translateY(${-shiftY}%) scale(${photoScale * zoom})`,
            transformOrigin: objPos,
            ...(shiftY < 0
              ? {
                  WebkitMaskImage: "linear-gradient(to top, #000 82%, transparent 100%)",
                  maskImage: "linear-gradient(to top, #000 82%, transparent 100%)",
                }
              : {}),
            ...(shiftY > 0
              ? {
                  WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
                }
              : {}),
          }}
        >
          <Img
            src={resolvePhoto(src)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objPos, filter: layer("foto").filtro as string }}
          />
        </AbsoluteFill>
      ) : (
        <PlaceholderBg />
      )}

      {/* z2 grade ámbar */}
      <AbsoluteFill style={{ backgroundColor: C.ambar, opacity: grade.opacidad as number, mixBlendMode: "soft-light" }} />

      {/* z3 viñeta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />

      {/* z4 degradado inferior (legibilidad) */}
      <AbsoluteFill style={{ background: anchor === "top" ? f.degradado.replace("to top", "to bottom") : f.degradado }} />

      {/* z5 grano */}
      <AbsoluteFill
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "300px 300px", opacity: grain.opacidad as number, mixBlendMode: "overlay" }}
      />

      {/* z6 handle */}
      <div
        style={{
          position: "absolute",
          top: f.safe.top,
          left: f.safe.left,
          fontFamily: oswald,
          fontWeight: 500,
          fontSize: f.handle.size,
          letterSpacing: f.handle.tracking,
          color: C.blanco,
          opacity: (handle.opacidad as number) * rise(0),
          textTransform: "uppercase",
          textShadow: "0 1px 12px rgba(0,0,0,0.6)",
        }}
      >
        {spec.brand.handle}
      </div>

      {/* z7–z10 bloque de texto, anclado abajo a la izquierda dentro del área segura */}
      <div
        style={{
          position: "absolute",
          left: f.safe.left,
          right: f.safe.right,
          ...(anchor === "top" ? { top: f.safe.top + 70 } : { bottom: f.safe.bottom }),
          maxWidth: f.textMaxWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: f.led.width * ledGrow,
            height: f.led.height,
            marginBottom: f.led.marginBottom,
            backgroundColor: C.ambar,
            borderRadius: f.led.height,
            opacity: ledOn,
            boxShadow: `0 0 18px ${C.ambarGlow}, 0 0 42px rgba(242,163,58,0.35)`,
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 500,
            fontSize: f.kicker.size,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.ambar,
            marginBottom: f.kicker.marginBottom,
            ...textIn(10),
          }}
        >
          {kicker ?? p.kicker}
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: f.titulo.size,
            lineHeight: f.titulo.lineHeight,
            letterSpacing: f.titulo.tracking,
            textTransform: "uppercase",
            color: C.blanco,
            whiteSpace: "pre-line",
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            marginBottom: f.titulo.marginBottom,
            ...textIn(14),
          }}
        >
          {titulo ?? p.titulo}
        </div>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 500,
            fontSize: f.subtitulo.size,
            lineHeight: f.subtitulo.lineHeight,
            color: C.blanco,
            ...textIn(20),
            opacity: (sub.opacidad as number) * rise(20),
          }}
        >
          {subtitulo ?? p.subtitulo}
        </div>
        {showLegal ? (
          <div
            style={{
              fontFamily: inter,
              fontWeight: 500,
              fontSize: f.legal.size,
              marginTop: f.legal.marginTop,
              letterSpacing: "0.02em",
              color: C.blanco,
              opacity: (layer("legal").opacidad as number) * rise(24),
            }}
          >
            {spec.brand.legal}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const VUELTA_PLATES = Object.keys(spec.plates) as PlateId[];
export const VUELTA_FORMATS = Object.keys(spec.formats) as FormatId[];
export const vueltaFormatSize = (format: FormatId) => ({ width: spec.formats[format].width, height: spec.formats[format].height });
