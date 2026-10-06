# 🎂 birthday-3d — Tarjeta de cumpleaños 3D interactiva

Experiencia hecha con **HTML5 + CSS3 + JavaScript + Three.js** (sin React, Vue ni Angular).
Incluye intro cinematográfica, pastel 3D con velas, deseo, galería 3D de fotos y videos, GIFs flotantes, globos, confeti, partículas y un reproductor de música.

> Si no pones tus archivos todavía, la escena funciona igual: verás tarjetas de ejemplo en lugar de las fotos y videos.

---

## 1. Estructura de carpetas

```
birthday-3d/
├── index.html
├── css/style.css
├── js/
│   ├── main.js          ← AQUÍ se personaliza todo (birthdayConfig)
│   ├── scene.js         ← cámara, luces, estrellas, globos
│   ├── birthday.js      ← pastel, velas, llamas, humo, confeti
│   ├── gallery.js       ← fotos, videos y GIFs
│   ├── music.js         ← reproductor
│   └── interactions.js ← intro, clics, hover, deseo
└── assets/
    ├── images/   (fotos, portadas y fondo)
    ├── videos/
    ├── gifs/
    ├── music/
    └── textures/ (libre, para uso futuro)
```

Para crear las carpetas (si no vienen en el .zip), desde la carpeta que prefieras:

```bash
mkdir -p birthday-3d/css birthday-3d/js birthday-3d/assets/{images,videos,gifs,music,textures}
```

En Windows (PowerShell):

```powershell
mkdir birthday-3d\css, birthday-3d\js, birthday-3d\assets\images, birthday-3d\assets\videos, birthday-3d\assets\gifs, birthday-3d\assets\music, birthday-3d\assets\textures
```

---

## 2. Dónde colocar tus archivos

| Qué | Dónde | Nombres de ejemplo |
|---|---|---|
| Fotografías | `assets/images/` | `foto1.jpg` … `foto5.jpg` |
| Imagen de fondo | `assets/images/` | `background.jpg` |
| Portadas de canciones | `assets/images/` | `cover1.jpg`, `cover2.jpg`, `cover3.jpg` |
| Videos | `assets/videos/` | `video1.mp4`, `video2.mp4` |
| GIFs | `assets/gifs/` | `gif1.gif`, `gif2.gif`, `gif3.gif` |
| Canciones | `assets/music/` | `cancion1.mp3`, `cancion2.mp3`, `cancion3.mp3` |

Consejos:
- Fotos: JPG/PNG/WebP, idealmente de menos de 1 MB cada una (≈ 1200 px de lado largo).
- Videos: **MP4 (H.264 + AAC)**, que es lo que reproducen todos los navegadores. Mejor si pesan menos de 30 MB.
- GIFs: de menos de 3 MB para que carguen rápido en el celular.
- Los nombres son sensibles a mayúsculas en algunos sistemas: `Foto1.JPG` ≠ `foto1.jpg`.

---

## 3. Cómo ejecutarlo

Como el proyecto usa **módulos ES** (`import`), **no funciona haciendo doble clic en `index.html`** (el navegador bloquea los módulos con `file://`). Necesita un servidor local, que es muy sencillo:

**Opción A — Python (viene en Mac/Linux y en muchos Windows):**

```bash
cd birthday-3d
python -m http.server 8000
```
(si no funciona, prueba `python3 -m http.server 8000`)

**Opción B — Node.js:**

```bash
cd birthday-3d
npx serve .
```

**Opción C — VS Code:** instala la extensión *Live Server*, clic derecho en `index.html` → *Open with Live Server*.

Luego abre en el navegador: **http://localhost:8000** (con `npx serve` te muestra la dirección, normalmente `http://localhost:3000`).

Para verlo en el celular (misma red Wi-Fi): abre `http://IP-DE-TU-PC:8000` desde el celular. Para compartirlo con otra persona, sube la carpeta a un hosting estático (Netlify, GitHub Pages, Vercel…).

### ¿Por qué Three.js por CDN?
Se carga desde `cdn.jsdelivr.net` con un *import map* en `index.html`. Así no necesitas instalar nada con npm y el proyecto sigue siendo "una carpeta + un servidor". Requiere internet la primera vez (el navegador lo guarda en caché).

**Si prefieres usarlo sin internet (npm):**

```bash
cd birthday-3d
npm init -y
npm install three@0.160.0
```
y cambia en `index.html` el import map por:

```html
<script type="importmap">
  { "imports": { "three": "./node_modules/three/build/three.module.js" } }
</script>
```

---

## 4. Cómo personalizarlo (todo en `js/main.js`)

Abre `js/main.js` y edita el objeto `birthdayConfig` al principio:

| Quiero cambiar… | Edita… |
|---|---|
| **El nombre** | `name: 'NOMBRE'` |
| **El título** | `title: 'Feliz Cumpleaños'` |
| **El mensaje** | `message: '...'` |
| **La foto de fondo** | `background: 'assets/images/background.jpg'` (si el archivo no existe, simplemente no se muestra) |
| **Las fotos** | la lista `photos` (archivo + frase que aparece al hacer clic) |
| **Los videos** | la lista `videos` |
| **Los GIFs** | la lista `gifs` |
| **La música** | la lista `playlist` (título, artista, archivo y portada) |
| **Ocultar partes** | `showGallery`, `showVideos`, `showGifs`, `showMusic` en `true` / `false` |

Ejemplo para agregar una foto:

```js
photos: [
  { file: 'assets/images/viaje.jpg', caption: 'Nuestro viaje favorito ❤️' },
  // ...
]
```

Ejemplo para agregar una canción:

```js
playlist: [
  { title: 'Nuestra canción', artist: 'Mi artista', file: 'assets/music/nuestra.mp3', cover: 'assets/images/cover-nuestra.jpg' }
]
```

### Para regalárselo a OTRA persona
1. `main.js` → cambia `name`, `message` y las frases (`caption`) de fotos y videos.
2. Reemplaza los archivos de `assets/images`, `assets/videos`, `assets/gifs` y `assets/music` (o actualiza los nombres en las listas).
3. (Opcional) cambia los textos de la intro en `index.html` (`#l1`, `#l2`, `#l3`) y los de "Ahora pide un deseo..." / "¡Feliz cumpleaños!" en `js/interactions.js`.
4. (Opcional) colores: variables `--gold` y `--rose` al inicio de `css/style.css`; número de velas: `CANDLE_COUNT` en `js/birthday.js`.

---

## 5. Cómo se usa

- **Intro:** aparecen los textos y el botón **"Entrar a la sorpresa ❤️"**. Al pulsarlo empieza la música (los navegadores no permiten audio automático).
- **✨ Pedir un deseo:** la cámara se acerca, las llamas crecen, salen chispas y aparece el texto del deseo; luego "¡Feliz cumpleaños! 🎂❤️" con confeti.
- **Velas:** haz clic sobre una vela para apagarla (humo). Al apagar todas, confeti. Pulsa el botón de deseo para volver a encenderlas.
- **Pastel:** haz clic para que gire más rápido con chispas.
- **Fotos y videos:** pasa el mouse (se agrandan un poco) y haz clic para verlos de cerca. En un video, clic o botón para pausar/reproducir; `Esc`, clic fuera o **Cerrar** para volver. La música baja de volumen mientras ves un video.
- **Arrastrar** (mouse o dedo) gira el anillo de fotos. El mouse mueve ligeramente la cámara.
- **Reproductor:** esquina inferior derecha; clic para expandirlo (lista, volumen, progreso, anterior/siguiente).

---

## 6. Si algo no funciona

| Problema | Solución |
|---|---|
| Pantalla en blanco / error de módulos | Estás abriendo con `file://`. Usa un servidor local (sección 3). |
| Veo tarjetas "coloca tu archivo aquí" | El archivo no existe o el nombre/ruta no coincide con `main.js`. |
| No suena la música | Revisa que el `.mp3` exista en `assets/music/`; el reproductor muestra un aviso en rojo. |
| El video no se ve en el celular | Usa MP4 H.264. Evita formatos `.mov`/`.mkv`/HEVC. |
| Va lento en el celular | Reduce el peso de fotos/GIFs; el proyecto ya baja partículas y sombras en móviles. |
| Consola: error cargando `three` | Sin internet no carga el CDN; usa la opción npm de la sección 3. |
