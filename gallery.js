// gallery.js — fotos y videos como tarjetas 3D flotantes alrededor del pastel + GIFs flotantes.
// Si un archivo no existe, se muestra una tarjeta de ejemplo para que la escena nunca quede vacía.
import * as THREE from 'three';
import { glowTexture } from './scene.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOutBack = x => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// Textura de ejemplo (se usa mientras carga o si falta el archivo)
function placeholder(label, icon) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 640;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 512, 640);
  grad.addColorStop(0, '#3a1c4f');
  grad.addColorStop(1, '#12122e');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 640);
  g.strokeStyle = 'rgba(255,214,140,.5)';
  g.lineWidth = 4;
  g.strokeRect(24, 24, 464, 592);
  g.textAlign = 'center';
  g.font = '140px serif';
  g.fillText(icon, 256, 330);
  g.fillStyle = '#ffe2b8';
  g.font = '28px sans-serif';
  g.fillText(label, 256, 430);
  g.fillStyle = 'rgba(255,255,255,.55)';
  g.font = '20px sans-serif';
  g.fillText('(coloca tu archivo aquí)', 256, 470);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function playIconTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10,6,24,.6)';
  g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,226,160,.9)';
  g.lineWidth = 4;
  g.beginPath(); g.arc(64, 64, 58, 0, 7); g.stroke();
  g.fillStyle = '#ffe2b8';
  g.beginPath(); g.moveTo(50, 36); g.lineTo(50, 92); g.lineTo(98, 64); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createGallery(world, config, isMobile) {
  const { scene, camera } = world;
  const orbit = new THREE.Group();
  scene.add(orbit);

  const items = [];
  const pickables = [];
  const H = isMobile ? 1.9 : 2.35;               // alto base de las tarjetas
  const portrait = innerWidth / innerHeight < 0.9;
  const loader = new THREE.TextureLoader();
  const glowTex = glowTexture('255,150,200');
  const playTex = playIconTexture();

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd9ac4f, roughness: 0.3, metalness: 0.85 });
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x0b0814, roughness: 0.8 });

  /* ---------- Lista de elementos (alterna fotos y videos) ---------- */
  const photos = config.showGallery ? config.photos || [] : [];
  const videos = config.showVideos ? config.videos || [] : [];
  const defs = [];
  for (let i = 0; i < Math.max(photos.length, videos.length); i++) {
    if (photos[i]) defs.push({ type: 'photo', ...photos[i] });
    if (videos[i]) defs.push({ type: 'video', ...videos[i] });
  }

  /* ---------- Construcción de cada tarjeta ---------- */
  function setAspect(item, a) {
    item.aspect = a;
    const w = H * a;
    item.img.scale.set(w, H, 1);
    item.border.scale.set(w + 0.1, H + 0.1, 1);
    item.frame.scale.set(w + 0.26, H + 0.26, 1);
    item.glow.scale.set((w + 1) * 1.6, (H + 1) * 1.6, 1);
  }

  defs.forEach((d, i) => {
    const card = new THREE.Group();

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), frameMat);
    const border = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.12), borderMat);
    const imgMat = new THREE.MeshBasicMaterial({
      map: placeholder(d.file.split('/').pop(), d.type === 'video' ? '🎬' : '📷'),
      toneMapped: false
    });
    const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imgMat);
    img.position.z = 0.066;
    frame.castShadow = true;

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glow.position.z = -0.2;

    card.add(glow, frame, border, img);

    const item = {
      type: d.type, caption: d.caption || 'Un recuerdo que siempre guardaré ❤️',
      card, frame, border, img, glow, aspect: 0.8, base: new THREE.Vector3(),
      phase: Math.random() * 6.28, state: 'idle', hover: false, revealScale: 0, video: null, playIcon: null
    };
    setAspect(item, 0.8);

    if (d.type === 'photo') {
      loader.load(d.file, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        imgMat.map = tex;
        imgMat.needsUpdate = true;
        setAspect(item, clamp(tex.image.width / tex.image.height, 0.6, 1.7));
      }, undefined, () => { /* si falta el archivo se queda la tarjeta de ejemplo */ });
    } else {
      const v = document.createElement('video');
      v.src = d.file;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      v.addEventListener('loadeddata', () => {
        const vt = new THREE.VideoTexture(v);
        vt.colorSpace = THREE.SRGBColorSpace;
        imgMat.map = vt;
        imgMat.needsUpdate = true;
        setAspect(item, clamp(v.videoWidth / v.videoHeight, 0.6, 1.9));
        try { v.currentTime = 0.1; } catch (e) { /* ignorar */ }
      });
      v.load();
      item.video = v;

      const icon = new THREE.Mesh(
        new THREE.CircleGeometry(0.4, 32),
        new THREE.MeshBasicMaterial({ map: playTex, transparent: true, depthWrite: false })
      );
      icon.position.z = 0.1;
      card.add(icon);
      item.playIcon = icon;
    }

    [frame, border, img].forEach(m => { m.userData.item = item; pickables.push(m); });

    card.visible = false;
    orbit.add(card);
    items.push(item);
  });

  /* ---------- Colocación en semicírculo (abierto hacia la cámara) ---------- */
  const n = items.length;
  const R = portrait ? 4.9 : 6.6;
  const span = Math.PI * (portrait ? 1.35 : 1.5);
  items.forEach((it, i) => {
    const th = n === 1 ? 0 : -span / 2 + (span * i) / (n - 1);
    it.base.set(
      R * Math.sin(th),
      2.5 + 1.5 * (0.5 + 0.5 * Math.sin(i * 2.1)) + (i % 2) * 0.9,
      -R * Math.cos(th) * 0.9
    );
    it.card.position.copy(it.base);
  });

  /* ---------- GIFs flotantes (<img> HTML proyectados desde 3D para que se animen) ---------- */
  const gifLayer = document.getElementById('gif-layer');
  const stickers = [];
  const gifList = config.showGifs ? config.gifs || [] : [];
  gifList.forEach((g, i) => {
    const img = document.createElement('img');
    img.className = 'sticker';
    img.alt = '';
    img.src = typeof g === 'string' ? g : g.file;
    const s = { img, anchor: new THREE.Object3D(), dead: false, ph: Math.random() * 6.28 };
    img.addEventListener('error', () => { s.dead = true; img.remove(); });
    const side = i % 2 ? 1 : -1;
    const row = Math.floor(i / 2);
    s.anchor.position.set(side * (portrait ? 3.4 : 5.7), 1.4 + (row % 3) * 1.6 + (portrait ? 3 : 0), 2.2 - row * 1.2);
    orbit.add(s.anchor);
    gifLayer.appendChild(img);
    stickers.push(s);
  });

  /* ---------- Estado ---------- */
  let focused = null;
  let reveal = 0;
  let spin = 0;
  let stickerAlpha = 0;
  const tmpV = new THREE.Vector3();
  const tmpUp = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  const FOCUS_DIST = 5;

  function focus(item) {
    if (focused) return;
    focused = item;
    item.state = 'focus';
    scene.attach(item.card);
    if (item.video) {
      item.video.muted = false;
      item.video.play().catch(() => {
        item.video.muted = true;
        item.video.play().catch(() => {});
      });
      item.playIcon.visible = false;
    }
  }

  function unfocus() {
    if (!focused) return;
    const it = focused;
    focused = null;
    it.state = 'returning';
    if (it.video) {
      it.video.pause();
      it.video.muted = true;
      it.playIcon.visible = true;
    }
  }

  function toggleVideo() {
    const v = focused && focused.video;
    if (!v) return null;
    if (v.paused) { v.play(); return true; }
    v.pause();
    return false;
  }

  function update(t, dt) {
    // Giro suave por arrastre + balanceo lento
    spin -= spin * dt * 0.15;
    orbit.rotation.y = Math.sin(t * 0.12) * 0.18 + spin;

    const k = 1 - Math.exp(-dt * 6);

    for (const it of items) {
      const c = it.card;
      c.visible = it.state !== 'idle' || it.revealScale > 0.01;

      if (it.state === 'idle') {
        c.position.copy(it.base);
        c.position.y += Math.sin(t * 0.8 + it.phase) * 0.18;
        c.lookAt(camera.position);
        c.rotateY(Math.sin(t * 0.6 + it.phase) * 0.12);
        c.rotateX(Math.sin(t * 0.5 + it.phase) * 0.05);
        const s = it.revealScale * (it.hover ? 1.08 : 1);
        c.scale.lerp(tmpS.set(s, s, s), k);
      } else if (it.state === 'focus') {
        camera.getWorldDirection(tmpV);
        tmpUp.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(0.25);
        tmpV.multiplyScalar(FOCUS_DIST).add(camera.position).add(tmpUp);
        c.position.lerp(tmpV, k);
        c.quaternion.slerp(camera.quaternion, k);
        const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * FOCUS_DIST;
        const targetH = Math.min(visH * 0.62, (visH * camera.aspect * 0.86) / it.aspect);
        const s = targetH / H;
        c.scale.lerp(tmpS.set(s, s, s), k);
      } else if (it.state === 'returning') {
        orbit.localToWorld(tmpV.copy(it.base));
        c.position.lerp(tmpV, k);
        c.quaternion.slerp(camera.quaternion, k);
        c.scale.lerp(tmpS.set(1, 1, 1), k);
        if (c.position.distanceTo(tmpV) < 0.15) {
          orbit.attach(c);
          it.state = 'idle';
        }
      }

      it.glow.material.opacity += ((it.hover || it.state === 'focus' ? 0.6 : 0.28) - it.glow.material.opacity) * k;
    }

    // GIFs: proyectar la posición 3D a pantalla
    stickerAlpha += ((focused ? 0 : 1) - stickerAlpha) * k;
    for (const s of stickers) {
      if (s.dead) continue;
      s.anchor.getWorldPosition(tmpV);
      tmpV.y += Math.sin(t * 0.9 + s.ph) * 0.2;
      const dist = camera.position.distanceTo(tmpV);
      tmpV.project(camera);
      if (tmpV.z > 1) { s.img.style.opacity = 0; continue; }
      const x = (tmpV.x * 0.5 + 0.5) * innerWidth;
      const y = (-tmpV.y * 0.5 + 0.5) * innerHeight;
      const sc = clamp(11 / dist, 0.5, 1.4) * Math.max(0.01, reveal);
      s.img.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${Math.sin(t * 0.7 + s.ph) * 5}deg) scale(${sc})`;
      s.img.style.opacity = reveal * stickerAlpha;
    }
  }

  return {
    items, pickables, update, focus, unfocus, toggleVideo,
    get focused() { return focused; },
    setReveal(r) {
      reveal = r;
      items.forEach((it, i) => {
        const l = clamp(r * 1.7 - i * 0.1, 0, 1);
        it.revealScale = l <= 0 ? 0 : easeOutBack(l);
      });
    },
    setHover(item) { items.forEach(it => { it.hover = it === item; }); },
    addSpin(d) { spin = clamp(spin + d, -0.7, 0.7); }
  };
}
