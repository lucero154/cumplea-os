// scene.js — escenario base: renderer, cámara, luces, suelo, estrellas, destellos, corazones y globos.
import * as THREE from 'three';

/* ---------- Texturas generadas por código (no necesitan archivos) ---------- */
export function glowTexture(rgb = '255,255,255') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.45)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function heartTexture(color = '#ff7eb3') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.shadowColor = color;
  g.shadowBlur = 8;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(32, 54);
  g.bezierCurveTo(4, 34, 6, 10, 22, 10);
  g.bezierCurveTo(28, 10, 32, 15, 32, 20);
  g.bezierCurveTo(32, 15, 36, 10, 42, 10);
  g.bezierCurveTo(58, 10, 60, 34, 32, 54);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const rand = (a, b) => a + Math.random() * (b - a);

export function createScene(canvas, isMobile) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090614, 0.017);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 250);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0); // transparente: se ve el degradado / foto de fondo del CSS
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  /* ---------- Luces ---------- */
  scene.add(new THREE.AmbientLight(0x6b5b95, 0.6));
  scene.add(new THREE.HemisphereLight(0xffd9e8, 0x1a1030, 0.55));

  const key = new THREE.SpotLight(0xffe2b8, 120, 45, 0.62, 0.65, 1.2);
  key.position.set(5, 13, 9);
  key.target.position.set(0, 1.5, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);

  const rim = new THREE.PointLight(0xff6fa5, 45, 32, 1.6);
  rim.position.set(-8, 5, -4);
  const goldLight = new THREE.PointLight(0xffc36b, 32, 32, 1.6);
  goldLight.position.set(8, 4, -2);
  scene.add(rim, goldLight);

  /* ---------- Suelo ---------- */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 64),
    new THREE.MeshStandardMaterial({ color: 0x140c26, roughness: 0.55, metalness: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(5.1, 5.18, 96),
    new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  /* ---------- Estrellas lejanas ---------- */
  const starCount = isMobile ? 260 : 650;
  const sPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = rand(45, 95), th = rand(0, Math.PI * 2), ph = Math.acos(rand(-0.2, 1));
    sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    sPos[i * 3 + 1] = r * Math.cos(ph) + 5;
    sPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.9, map: glowTexture('255,240,220'), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, fog: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- Destellos flotantes cerca del escenario ---------- */
  const dustCount = isMobile ? 90 : 240;
  const dPos = new Float32Array(dustCount * 3);
  const dSpd = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dPos[i * 3] = rand(-12, 12);
    dPos[i * 3 + 1] = rand(0, 9);
    dPos[i * 3 + 2] = rand(-12, 8);
    dSpd[i] = rand(0.08, 0.3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.2, map: glowTexture('255,205,130'), transparent: true, opacity: 0.85,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(dust);

  /* ---------- Corazoncitos que suben ---------- */
  const hearts = [];
  const heartTex = heartTexture();
  const heartCount = isMobile ? 6 : 14;
  for (let i = 0; i < heartCount; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent: true, depthWrite: false, opacity: 0 }));
    const sc = rand(0.25, 0.5);
    s.scale.set(sc, sc, 1);
    s.userData = { x0: rand(-8, 8), z: rand(-8, 4), y: rand(0, 9), spd: rand(0.25, 0.55), ph: rand(0, 6.28) };
    scene.add(s);
    hearts.push(s);
  }

  /* ---------- Globos ---------- */
  const balloons = new THREE.Group();
  scene.add(balloons);
  const balloonColors = [0xff7eb3, 0xffd27a, 0xb9a2ff, 0xffffff, 0xff9a62, 0xf15a8a, 0x8fd3ff];
  const balloonCount = isMobile ? 6 : 10;
  for (let i = 0; i < balloonCount; i++) {
    const size = rand(0.6, 1.05);
    const color = balloonColors[i % balloonColors.length];
    const g = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(size, 24, 20),
      new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.15, emissive: color, emissiveIntensity: 0.12 })
    );
    body.scale.set(1, 1.2, 1);
    body.castShadow = true;
    g.add(body);

    const knot = new THREE.Mesh(
      new THREE.ConeGeometry(size * 0.13, size * 0.22, 10),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
    );
    knot.position.y = -size * 1.22;
    knot.rotation.x = Math.PI;
    g.add(knot);

    const pts = [];
    for (let k = 0; k <= 8; k++) pts.push(new THREE.Vector3(Math.sin(k * 0.8) * 0.12, -size * 1.3 - k * 0.32, 0));
    const string = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(20)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
    );
    g.add(string);

    // Los globos se reparten por el fondo y los lados; el frente queda libre para no tapar el pastel
    const th = -2 + (4 * i) / (balloonCount - 1);
    const r = rand(8.5, 12);
    g.position.set(Math.sin(th) * r, rand(3.5, 7.5), -Math.cos(th) * r * 0.8 - 1);
    g.userData = { baseY: g.position.y, ph: rand(0, 6.28), spd: rand(0.4, 0.9) };
    balloons.add(g);
  }
  balloons.visible = false;

  /* ---------- Cámara ---------- */
  const view = {
    mode: 'intro',
    parX: 0, parY: 0,                       // movimiento del mouse (-1..1)
    base: new THREE.Vector3(),
    look: new THREE.Vector3(0, 2.2, 0),
    curLook: new THREE.Vector3(0, 2.2, 0)
  };

  function homeZ() {
    const a = innerWidth / innerHeight;
    return a < 1 ? 11 + (1 - a) * 11 : 11; // en vertical (celular) la cámara se aleja
  }

  function setMode(mode) {
    view.mode = mode;
    const z = homeZ();
    if (mode === 'intro') { view.base.set(0, 7, z + 14); }
    else if (mode === 'wish') { view.base.set(0, 3.4, z - 3.6); view.look.set(0, 2.7, 0); }
    else { view.base.set(0, 3.7, z); view.look.set(0, 2.2, 0); }
  }
  setMode('intro');
  camera.position.copy(view.base);

  const target = new THREE.Vector3();

  function update(t, dt) {
    // Cámara suave + parallax con mouse/touch
    const k = 1 - Math.exp(-dt * 2.2);
    target.set(
      view.base.x + view.parX * 1.6,
      view.base.y - view.parY * 0.8 + Math.sin(t * 0.3) * 0.15,
      view.base.z + Math.sin(t * 0.2) * 0.3
    );
    camera.position.lerp(target, k);
    view.curLook.lerp(view.look, k);
    camera.lookAt(view.curLook);

    // Estrellas
    stars.rotation.y = t * 0.004;
    starMat.opacity = 0.75 + 0.25 * Math.sin(t * 1.3);

    // Destellos
    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      p[i * 3 + 1] += dSpd[i] * dt;
      p[i * 3] += Math.sin(t * 0.5 + i) * 0.003;
      if (p[i * 3 + 1] > 9.5) p[i * 3 + 1] = -0.3;
    }
    dustGeo.attributes.position.needsUpdate = true;

    // Corazones
    for (const h of hearts) {
      const d = h.userData;
      d.y += d.spd * dt;
      if (d.y > 9) d.y = 0.3;
      h.position.set(d.x0 + Math.sin(t * 0.6 + d.ph) * 0.5, d.y, d.z);
      h.material.opacity = Math.sin(Math.PI * Math.min(1, d.y / 9)) * 0.75;
    }

    // Globos
    if (balloons.visible) {
      for (const b of balloons.children) {
        const d = b.userData;
        b.position.y = d.baseY + Math.sin(t * d.spd + d.ph) * 0.4 + balloons.userData.rise;
        b.rotation.z = Math.sin(t * d.spd * 0.8 + d.ph) * 0.07;
        b.rotation.y = t * 0.1 + d.ph;
      }
    }
  }
  balloons.userData.rise = -6;

  function setReveal(r) {
    balloons.visible = r > 0.05;
    balloons.userData.rise = -(1 - r) * 6;
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (view.mode !== 'intro') setMode(view.mode);
  }
  addEventListener('resize', resize);

  return { scene, camera, renderer, view, update, setMode, setReveal, resize };
}
