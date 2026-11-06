# Vuelta Bar · Sistema de placas para OpenMontage

Tres placas reutilizables (Pintas, Pizzas, Sándwiches) en tres formatos. Es **una sola composición de Remotion** que lee todo de un JSON. Para cambiar colores, medidas o textos se edita el JSON, no el código.

| Archivo | Qué es |
|---|---|
| `remotion-composer/src/vueltabar/placas.layers.json` | **Fuente única**: marca, capas (z 0→10), medidas por formato y textos por placa |
| `remotion-composer/src/vueltabar/VueltaPlaca.tsx` | Componente que apila las capas |
| `remotion-composer/src/Root.tsx` | Registra 9 composiciones `Vuelta-<placa>-<formato>` |
| `remotion-composer/src/fonts/Oswald-latin.woff2`, `Inter-latin.woff2` | Tipografías incluidas en el repo (SIL OFL), así el render no depende de internet |

## Marca

| Token | Valor | Uso |
|---|---|---|
| Grafito | `#121314` | Fondo base |
| Carbono | `#0A0A0B` | Degradados y sombras |
| Ámbar LED | `#F2A33A` + glow `rgba(242,163,58,0.85)` | Tira LED, kicker, grade de color |
| Blanco | `#FFFFFF` | Título (100%) y subtítulo (82%) |
| Títulos | **Oswald Bold 700**, mayúsculas | Condensada e industrial |
| Kicker | **Oswald Medium 500**, mayúsculas, tracking 0.28em | Categoría en ámbar |
| Subtítulos | **Inter Medium 500** | Alta legibilidad en tamaños chicos |

## Capas (de abajo hacia arriba)

| z | Capa | Especificación | Opacidad | Para qué |
|---|---|---|---|---|
| 0 | Base | Sólido `#121314` | 1 | Fondo si la foto no cubre |
| 1 | Foto | `cover` + `brightness(.88) contrast(1.08) saturate(.92)`; punto focal por placa | 1 | Foto propia del producto |
| 2 | Grade ámbar | `#F2A33A` en *soft-light* | 0.10 | Iguala la temperatura de fotos distintas con la luz LED |
| 3 | Viñeta | Radial, transparente al 55% → negro 55% en bordes | 1 | Look nocturno, foco en el producto |
| 4 | **Degradado inferior** | Negro carbono de abajo hacia arriba (paradas por formato, ver abajo) | 0.94–0.96 en la base | **Legibilidad del texto sobre fotos reales** |
| 5 | Grano | Ruido SVG en *overlay* | 0.07 | Textura industrial, evita el look de "plantilla" |
| 6 | Handle `@VUELTABAR` | Oswald 500, arriba a la izquierda, sombra suave | 0.70 | Firma (reemplazable por logo PNG) |
| 7 | Tira LED | Barra ámbar redondeada con doble glow | 1 | Firma visual de la marca |
| 8 | Kicker | Oswald 500 ámbar | 1 | Categoría |
| 9 | Título | Oswald 700 blanco, sombra `0 2px 24px rgba(0,0,0,.45)` | 1 | Mensaje principal |
| 10 | Subtítulo | Inter 500 blanco | 0.82 | Bajada |

## Medidas por formato

Todo el bloque de texto va **abajo a la izquierda**, dentro del área segura: LED → kicker → título → subtítulo.

| | Feed 1080×1080 | Portrait 4:5 1080×1350 (opcional) | Story/Reel 1080×1920 |
|---|---|---|---|
| Márgenes (arriba/der/abajo/izq) | 72 / 80 / 92 / 80 | 80 / 80 / 104 / 80 | **250 / 90 / 380 / 90** (libres para la interfaz de IG) |
| Ancho máx. de texto | 900 | 900 | 900 |
| Handle | 26 px | 26 px | 30 px |
| Tira LED | 140×5, separación 26 | 150×5, sep. 28 | 170×6, sep. 32 |
| Kicker | 24 px, sep. 14 | 26 px, sep. 16 | 30 px, sep. 18 |
| Título | **112 px**, interlineado 0.94, sep. 22 | **124 px**, 0.93, sep. 24 | **140 px**, 0.93, sep. 28 |
| Subtítulo | 36 px, interlineado 1.25 | 38 px | 44 px |
| Degradado inferior | 0.94 → 0.78 (22%) → 0.35 (45%) → 0 (62%) | 0.95 → 0.80 (22%) → 0.40 (42%) → 0 (60%) | 0.96 → 0.90 (24%) → 0.72 (42%) → 0 (66%) |

> El 4:5 lo sumé porque ocupa más pantalla en el feed y es el formato recomendado para carruseles. Si no lo usás, ignoralo.

## Las 3 placas

| Placa | Kicker | Título (con salto) | Subtítulo | Punto focal | Foto ideal |
|---|---|---|---|---|---|
| **Pintas** | CERVEZA ARTESANAL | PINTAS / DE LA CASA | Frías y tiradas en el punto exacto | 50% 35% | Pinta recién tirada en la barra, espuma de dos dedos, condensación, LEDs desenfocados atrás. Producto en el tercio superior |
| **Pizzas** | FERMENTACIÓN LENTA | EL ARTE DE LA / MASA MADRE | 100% crocantes y listas para compartir | 50% 30% | Pizza entera cenital o a 45°, borde inflado y leopardeado, sobre tabla oscura. En la mitad superior del encuadre |
| **Sándwiches** | SÁNDWICHES | CONTUNDENTES / Y AL PUNTO | El bajón que te merecés hoy | 50% 38% | Sándwich cortado mostrando el corte, a la altura de los ojos, con luz lateral cálida |

> Cambié "te mereces" por **"te merecés"**, que es como se habla en Tucumán. Si preferís la otra forma, se edita en el JSON.

**Regla de foto:** el producto va siempre en la **mitad superior**, porque la inferior es del texto. Para stories, sacá la foto en vertical.

## Cómo usarlas

```bash
cd remotion-composer
# 1) Copiá tus fotos a remotion-composer/public/vueltabar/
# 2) Still para posteo (último frame = todo en su lugar)
npx remotion still Vuelta-pintas-feed out/pintas-feed.png --frame=149 \
  --props='{"plate":"pintas","format":"feed","photo":"vueltabar/pinta-barra.jpg"}'
# 3) Versión animada de 5 s (story o cierre de Reel): la tira LED "enciende" y el texto sube
npx remotion render Vuelta-pintas-story out/pintas-story.mp4 \
  --props='{"plate":"pintas","format":"story","photo":"vueltabar/pinta-vertical.jpg"}'
# 4) Reusar una placa con otro texto (portada de carrusel, por ejemplo)
npx remotion still Vuelta-pizzas-portrait out/carrusel-masa.png --frame=149 \
  --props='{"plate":"pizzas","format":"portrait","photo":"vueltabar/bollos.jpg","kicker":"Fermentación lenta","titulo":"[XX] HORAS ANTES\nDE TU PIZZA","subtitulo":"Deslizá y mirá el proceso"}'
# Vista previa interactiva de todas las placas:
npx remotion studio
```

Composiciones disponibles: `Vuelta-{pintas|pizzas|sandwiches}-{feed|portrait|story}`.
