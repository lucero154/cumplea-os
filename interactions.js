// interactions.js — introducción, hover/clics con Raycaster, botón de deseo, velas y fotos/videos de cerca.
import * as THREE from 'three';

export function setupInteractions({ app, world, cake, gallery, music, config }) {
  const $ = id => document.getElementById(id);
  const canvas = world.renderer.domElement;

  /* ============ Introducción cinematográfica ============ */
  const intro = $('intro');
  const enterBtn = $('enter-btn');
  const show = (id, ms) => setTimeout(() => $(id).classList.add('show'), ms);
  show('l1', 1000);
  show('l2', 3300);
  show('l3', 5400);
  setTimeout(() => enterBtn.classList.add('show'), 6600);

  let entered = false;
  enterBtn.addEventListener('click', () => {
    if (entered) return;
    entered = true;

    if (music) music.start();           // la música empieza aquí, tras el gesto del usuario
    intro.classList.add('leaving');
    setTimeout(() => intro.remove(), 1500);

    app.revealing = true;               // main.js hace aparecer pastel, globos y fotos
    world.setMode('home');              // la cámara vuela hacia el pastel

    setTimeout(() => {
      $('hud').classList.remove('hidden');
      $('bottom-ui').classList.remove('hidden');
      $('player').classList.remove('hidden');
    }, 1700);
    setTimeout(() => cake.confetti(cake.topWorld(2.5)), 1500);
  });

  /* ============ Texto central y deseo ============ */
  const wishText = $('wish-text');
  const wishBtn = $('wish-btn');
  let busy = false;
  let textTimer = null;

  function showText(msg, ms = 0) {
    wishText.textContent = msg;
    wishText.classList.add('show');
    clearTimeout(textTimer);
    if (ms) textTimer = setTimeout(() => wishText.classList.remove('show'), ms);
  }

  wishBtn.addEventListener('click', () => {
    if (busy || !entered) return;
    busy = true;
    wishBtn.textContent = '✨ Pide tu deseo...';
    if (!cake.anyLit()) cake.relight();
    world.setMode('wish');              // la cámara se acerca al pastel
    cake.wish();                        // llamas y luces más intensas + partículas
    showText('Ahora pide un deseo... ✨');

    setTimeout(() => {
      showText('¡Feliz cumpleaños! 🎂❤️');
      cake.confetti(cake.topWorld(2.5));
    }, 4300);

    setTimeout(() => {
      wishText.classList.remove('show');
      cake.endWish();
      world.setMode('home');
      wishBtn.textContent = '✨ Pedir un deseo';
      busy = false;
    }, 8000);
  });

  // Cuando se apagan todas las velas
  cake.onAllOut = () => {
    cake.confetti(cake.topWorld(2.5));
    showText('¡Feliz cumpleaños! 🎂❤️', 3500);
  };

  /* ============ Ver fotos y videos de cerca ============ */
  const bar = $('media-bar');
  const playBtn = $('media-play');

  function openMedia(item) {
    gallery.focus(item);
    $('media-caption').textContent = item.caption;
    playBtn.style.display = item.video ? '' : 'none';
    playBtn.textContent = '⏸ Pausar';
    bar.classList.remove('hidden');
    $('hud').classList.add('dim');
    $('bottom-ui').classList.add('dim');
    if (item.video && music) music.duck(true);
  }

  function closeMedia() {
    if (!gallery.focused) return;
    gallery.unfocus();
    bar.classList.add('hidden');
    $('hud').classList.remove('dim');
    $('bottom-ui').classList.remove('dim');
    if (music) music.duck(false);
  }

  playBtn.addEventListener('click', () => {
    const playing = gallery.toggleVideo();
    if (playing !== null) playBtn.textContent = playing ? '⏸ Pausar' : '▶ Reproducir';
  });
  $('media-close').addEventListener('click', closeMedia);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMedia(); });

  /* ============ Raycaster: hover y clics ============ */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9, -9);

  function pick(e) {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, world.camera);
    const hits = raycaster.intersectObjects([cake.group, ...gallery.pickables], true);
    for (const h of hits) {
      const u = h.object.userData;
      if (u.item || u.candle || u.cake) return u;
    }
    return null;
  }

  let down = null;

  canvas.addEventListener('pointerdown', e => {
    down = { x: e.clientX, last: e.clientX, moved: 0 };
  });

  canvas.addEventListener('pointermove', e => {
    // Parallax: la escena reacciona al mouse / dedo
    world.view.parX = (e.clientX / innerWidth) * 2 - 1;
    world.view.parY = (e.clientY / innerHeight) * 2 - 1;

    if (down) {
      const dx = e.clientX - down.last;
      down.last = e.clientX;
      down.moved += Math.abs(dx);
      if (!gallery.focused) gallery.addSpin(dx * 0.004); // arrastrar gira las fotos
      return;
    }
    if (e.pointerType === 'touch' || !entered) return;
    const u = pick(e);
    gallery.setHover(u && u.item && !gallery.focused ? u.item : null);
    canvas.style.cursor = u && (u.item || u.candle || u.cake) ? 'pointer' : 'default';
  });

  const endDrag = e => {
    if (!down) return;
    const wasTap = down.moved < 6;
    down = null;
    if (wasTap && entered) handleClick(e);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', () => { down = null; });
  canvas.addEventListener('pointerleave', () => { world.view.parX = 0; world.view.parY = 0; });

  function handleClick(e) {
    const u = pick(e);

    // Si hay una foto/video abierto: clic sobre él = pausar/reproducir, clic fuera = cerrar
    if (gallery.focused) {
      if (u && u.item === gallery.focused && u.item.video) {
        const playing = gallery.toggleVideo();
        playBtn.textContent = playing ? '⏸ Pausar' : '▶ Reproducir';
      } else if (!u || u.item !== gallery.focused) {
        closeMedia();
      }
      return;
    }

    if (!u) return;
    if (u.item) openMedia(u.item);
    else if (u.candle && !busy) cake.extinguish(u.candle);
    else if (u.cake) cake.poke();
  }

  return { closeMedia };
}
