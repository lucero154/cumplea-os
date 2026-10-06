// main.js — AQUÍ se personaliza el regalo. Edita solo el objeto birthdayConfig.
import * as THREE from 'three';
import { createScene } from './scene.js';
import { createBirthday } from './birthday.js';
import { createGallery } from './gallery.js';
import { createMusic } from './music.js';
import { setupInteractions } from './interactions.js';

/* =====================================================================
   CONFIGURACIÓN PERSONALIZABLE
   ===================================================================== */
const birthdayConfig = {
  name: 'MI AMOR',
  title: 'Feliz Cumpleaños',
  message: 'Hoy quiero celebrar tu vida, tus momentos, tus logros y todos los recuerdos bonitos que hemos compartido juntos, te amo y siempre te amare mi vida.',

  background: 'assets/images/background.jpg',

  showGallery: true,
  showVideos: true,
  showGifs: true,
  showMusic: true,

  // Fotos: archivos dentro de assets/images/  (puedes agregar o quitar líneas)
  photos: [
    { file: 'assets/images/foto1.jpg', caption: 'Tu primera nevada en el trabajo ✨' },
    { file: 'assets/images/foto2.jpg', caption: 'Me tienes lokita por ti ❤️' },
    { file: 'assets/images/foto3.jpg', caption: 'Gracias por cada momento juntos' },
    { file: 'assets/images/foto4.jpg', caption: 'Mi INGENIERO 💖' },
    { file: 'assets/images/foto5.jpg', caption: 'Contigo todo es mejor 🤍' }
  ],

  // Videos: archivos dentro de assets/videos/
  videos: [
    { file: 'assets/videos/video1.mp4', caption: 'Cuando me emocione por el gol que hiciste mi amor ⚽' },
    { file: 'assets/videos/video2.mp4', caption: 'Lo guapo que estas papasito 😉' }
  ],

  // GIFs: archivos dentro de assets/gifs/ (vacío por ahora; agrega rutas como 'assets/gifs/gif1.gif')
  gifs: [],

  // Canciones: archivos dentro de assets/music/ y portadas en assets/images/
  playlist: [
    { title: 'Golden Hour', artist: 'JVKE', file: 'assets/music/cancion1.mp3', cover: 'assets/images/foto1.jpg' }
  ]
};
/* ===================================================================== */

const $ = id => document.getElementById(id);
const isMobile = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;

// Textos
document.title = `${birthdayConfig.title}, ${birthdayConfig.name} ❤️`;
$('title').textContent = `${birthdayConfig.title}, ${birthdayConfig.name} ❤️`;
$('message').textContent = birthdayConfig.message;

// Foto de fondo (solo se muestra si el archivo existe)
if (birthdayConfig.background) {
  const probe = new Image();
  probe.onload = () => {
    $('bg').style.backgroundImage = `url("${birthdayConfig.background}")`;
    $('bg').classList.add('on');
  };
  probe.src = birthdayConfig.background;
}

// Escena
let world;
try {
  world = createScene($('c'), isMobile);
} catch (err) {
  console.error(err);
  document.querySelector('.intro-lines').innerHTML =
    '<p class="line show">Tu navegador no pudo iniciar WebGL. Prueba con Chrome, Edge o Firefox actualizados.</p>';
  throw err;
}

const cake = createBirthday(world.scene, isMobile);
const gallery = createGallery(world, birthdayConfig, isMobile);
const music = birthdayConfig.showMusic ? createMusic(birthdayConfig.playlist) : null;
if (!music) $('player').remove();

const app = { revealing: false, reveal: 0 };
setupInteractions({ app, world, cake, gallery, music, config: birthdayConfig });

// Bucle de animación
const easeOutBack = x => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clock = new THREE.Clock();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (app.revealing && app.reveal < 1) {
    app.reveal = Math.min(1, app.reveal + dt / 2.4);
    cake.setReveal(easeOutBack(app.reveal));
    gallery.setReveal(app.reveal);
    world.setReveal(app.reveal);
  }

  world.update(t, dt);
  cake.update(t, dt);
  gallery.update(t, dt);
  world.renderer.render(world.scene, world.camera);
}
loop();
