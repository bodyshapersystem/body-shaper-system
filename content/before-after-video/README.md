# Plantilla de video antes / después (aprobada por Emmy, nov 2026)

Video vertical 1080×1350, 30 fps, ~25 s, con música B (deep house elegante) y efectos bajos.
**Todos los videos de antes y después siguen este concepto.**

## Estructura (no cambiar sin aprobación de Emmy)
1. **Hook (5 s):** círculo dorado animado (se dibuja, respira, late con cada letra, destellos que orbitan).
   Frase gancho: línea pequeña en itálica que se escribe con tecleo → **número grande en dorado** que cae
   con golpe grave + brillo → tercera línea que se escribe → "MIRA EL ANTES Y DESPUÉS" con línea y flecha.
   Transición: zoom + destello suave + whoosh.
2. **Silueta Body Blueprint:** escaneo dorado, "BODY BLUEPRINT™" anclado en la clavícula,
   marcadores dorados con destellos en la zona, zoom a la zona + nombre y beneficios.
3. **Protocolo:** sistema™ + "EL PROTOCOLO", contadores (sesiones · min/sesión · frecuencia),
   línea SEM 1 → SEM N que se ilumina despacio, y las tres frases (a domicilio / sin cirugía / sin tiempo de recuperación).
4. **"y esto es lo que pasa"** → foto antes → barrido tipo radar → después con marcadores y etiquetas.
   Debajo: sistema, TECNOLOGÍA · N SESIONES · MIN, y "resultados reales · sin retoque · resultados varían".
5. **CTA:** logo real (bss-wordmark en crema), "tu cuerpo, con un plan.", "AGENDA TU BODY BLUEPRINT™",
   "link en bio" + "o escríbenos “PALABRA” por DM", flecha animada.

## Fondos (uno por video, para no repetir el vinotinto en el feed)
`"theme"` en el config: `wine` (mármol vinotinto), `green` (mármol verde), `sand` (mármol arena).
Los fondos oficiales están en `bgs/` (también crema, lino, acanalados y seda bronce para futuros temas).

## Fotos
- `"shape":"rect"` (recomendado): tarjeta vertical con esquinas redondeadas, **encuadre alejado**
  (debajo del busto hasta medio muslo) para que se vea la diferencia. `crop_rect.py` recorta antes/después
  a la misma escala usando puntos fijos (ombligo, borde del bra) y empareja la luz.
- Varias vistas en un video: `"pairs"` con `label` ("frente", "perfil"); cada una tiene su revelación.
- Config de ejemplo: `example-config.json`; correr con `CFG=mi-config.json python3 make_video.py`.

## Reglas de fotos
- Encuadre alejado para que se vea el contorno (cintura, caderas).
- Quitar branding viejo ("The Box"), collages y manos del fondo. **Nunca retocar el cuerpo.**
- Mismo balance de blancos y tono en antes y después (`grade.py`).
- Tapar busto descubierto con el fundido superior al mármol.
- Las fotos de clientas **no se suben al repo** (ver .gitignore). Solo publicar con permiso de la clienta.

## Cómo hacer un video nuevo
Requiere Python 3 con Pillow, numpy, opencv-python y ffmpeg.

1. Poner el collage original en `src/` y ajustar en `circ.py` el centro de cada foto (antes/después).
   `python3 circ.py` → crea `graded/<par>-before-circle.png` y `-after-circle.png` ya corregidas de color.
   (Si la foto original es rectangular, recortar y pasar por `grade.grade()` igual.)
2. Ajustar en `nohands.py` los rectángulos con manos/objetos del fondo y correr `python3 nohands.py`
   → `-circle-clean.png`.
3. Editar `CFG` arriba de `make_video.py`: par, zona, beneficios, sistema, tecnología, sesiones,
   minutos, frecuencia, frase del hook (`HOOKL`), palabra del DM, puntos de la zona en la silueta
   (`zone_pts`) y etiquetas sobre la foto (`photo_tags`), nombre de salida.
4. Previsualizar cuadros: `python3 make_video.py 1.0 4.4 9.0 16.5` → `frames/` (también escribe `timing.json`).
5. Música sincronizada: `python3 make_music.py B` → `music-B.wav`.
6. Render: `python3 make_video.py`, luego normalizar audio:
   `ffmpeg -i bb-abdomen.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k final.mp4`

## Archivos
- `burgundy-marble.jpg`, `waves.png` (Blueprint Waves — no redibujar), `silo.png` (silueta de session-area-map),
  `logo.png` (bss-wordmark), fuentes Cormorant Garamond y Jost (OFL).
- Música y efectos son originales, generados por `make_music.py` (estilos A, B, C; el aprobado es **B**).
