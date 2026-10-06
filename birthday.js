// birthday.js — pastel de 3 pisos, velas con llamas, deseo, humo, chispas y confeti.
import * as THREE from 'three';
import { glowTexture } from './scene.js';

const rand = (a, b) => a + Math.random() * (b - a);

export function createBirthday(scene, isMobile) {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  /* ---------- Materiales ---------- */
  const std = (color, rough = 0.5, metal = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const M = {
    pink: std(0xf6a5c0, 0.45),
    cream: std(0xfff0dc, 0.5),
    gold: std(0xd9ac4f, 0.3, 0.85),
    white: std(0xffffff, 0.2),
    red: std(0xc9132f, 0.25),
    leaf: std(0x3f9b4d, 0.6),
    choco: std(0x4b2a1d, 0.5)
  };
  const add = (mesh, parent = group) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  /* ---------- Mesa y plato ---------- */
  const table = add(new THREE.Mesh(new THREE.CylinderGeometry(3.9, 4.1, 0.3, 64), M.gold));
  table.position.y = 0.15;
  const plate = add(new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.6, 0.14, 64), M.white));
  plate.position.y = 0.37;

  /* ---------- Pisos del pastel ---------- */
  const tiers = [
    { r: 2.7, h: 1.15, body: M.pink, accent: M.cream },
    { r: 2.0, h: 0.95, body: M.cream, accent: M.pink },
    { r: 1.35, h: 0.8, body: M.pink, accent: M.cream }
  ];

  function strawberry(x, y, z, parent) {
    const s = new THREE.Group();
    const fruit = add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), M.red), s);
    fruit.scale.set(1, 1.15, 1);
    const leaf = add(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.12, 6), M.leaf), s);
    leaf.position.y = 0.2;
    s.position.set(x, y, z);
    parent.add(s);
  }

  let y = 0.44;
  tiers.forEach((t, idx) => {
    const body = add(new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r, t.h, 64), t.body));
    body.position.y = y + t.h / 2;
    body.userData.cake = true; // para detectar clics sobre el pastel

    // Aros de crema arriba y abajo
    for (const yy of [y + 0.05, y + t.h]) {
      const ring = add(new THREE.Mesh(new THREE.TorusGeometry(t.r, 0.09, 12, 64), t.accent));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yy;
    }

    // Gotas de crema que escurren
    const drips = Math.round(t.r * 7);
    for (let i = 0; i < drips; i++) {
      const a = (i / drips) * Math.PI * 2 + rand(-0.05, 0.05);
      const len = rand(0.15, 0.5);
      const d = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, len, 10), t.accent));
      d.position.set(Math.cos(a) * (t.r + 0.01), y + t.h - len / 2 - 0.02, Math.sin(a) * (t.r + 0.01));
      const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), t.accent));
      tip.position.set(d.position.x, y + t.h - len - 0.02, d.position.z);
    }

    // Perlas doradas en el piso inferior
    if (idx === 0) {
      const pearls = Math.round(t.r * 11);
      for (let i = 0; i < pearls; i++) {
        const a = (i / pearls) * Math.PI * 2;
        const p = add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), M.gold));
        p.position.set(Math.cos(a) * (t.r + 0.02), y + t.h * 0.3, Math.sin(a) * (t.r + 0.02));
      }
    }

    // Fresas y nubes de crema en la parte superior de los pisos 1 y 2
    if (idx < 2) {
      const n = Math.round(t.r * 6);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = t.r - 0.28;
        const px = Math.cos(a) * rr, pz = Math.sin(a) * rr;
        if (i % 2 === 0) {
          const sw = add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), t.accent));
          sw.scale.set(1, 0.8, 1);
          sw.position.set(px, y + t.h + 0.1, pz);
        } else {
          strawberry(px, y + t.h + 0.14, pz, group);
        }
      }
    }
    y += t.h;
  });
  const topY = y;

  // Cereza central
  const cherry = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.red));
  cherry.position.set(0, topY + 0.2, 0);
  const stem = add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), M.choco));
  stem.position.set(0.04, topY + 0.46, 0);
  stem.rotation.z = -0.3;

  /* ---------- Velas ---------- */
  const glowTex = glowTexture('255,190,90');
  const smokeTex = glowTexture('210,210,225');
  const flameGeo = new THREE.SphereGeometry(0.1, 14, 14);
  const candles = [];
  const CANDLE_COUNT = 5;

  for (let i = 0; i < CANDLE_COUNT; i++) {
    const a = (i / CANDLE_COUNT) * Math.PI * 2;
    const c = new THREE.Group();
    c.position.set(Math.cos(a) * 0.72, topY, Math.sin(a) * 0.72);

    const body = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 16), std(i % 2 ? 0xffffff : 0xff9ec4, 0.4)), c);
    body.position.y = 0.375;
    const wick = add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), M.choco), c);
    wick.position.y = 0.8;

    const flame = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: 0xffc861, transparent: true, opacity: 0.95, fog: false }));
    flame.position.y = 0.98;
    flame.scale.set(1, 1.8, 1);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
    core.position.y = -0.03;
    flame.add(core);
    c.add(flame);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
    glow.position.y = 0.98;
    glow.scale.setScalar(0.9);
    c.add(glow);

    const light = new THREE.PointLight(0xffa04a, 2.4, 7, 2);
    light.position.y = 1.05;
    c.add(light);

    // Zona invisible más grande para poder hacer clic fácilmente
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.3, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.y = 0.65;
    c.add(hit);

    const candle = { group: c, flame, glow, light, lit: true, ph: rand(0, 6.28) };
    hit.userData.candle = candle;
    candles.push(candle);
    group.add(c);
  }

  /* ---------- Chispas doradas (Points con color que se desvanece) ---------- */
  const SN = isMobile ? 90 : 180;
  const sp = {
    pos: new Float32Array(SN * 3), col: new Float32Array(SN * 3),
    vel: new Float32Array(SN * 3), life: new Float32Array(SN), max: new Float32Array(SN)
  };
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp.pos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sp.col, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.24, map: glowTexture('255,255,255'), vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  sparks.frustumCulled = false;
  scene.add(sparks);

  function sparkBurst(origin, n = 40, speed = 2.5) {
    let k = 0;
    for (let i = 0; i < SN && k < n; i++) {
      if (sp.life[i] > 0) continue;
      sp.pos[i * 3] = origin.x; sp.pos[i * 3 + 1] = origin.y; sp.pos[i * 3 + 2] = origin.z;
      const th = rand(0, 6.283), ph = Math.acos(rand(-1, 1)), s = rand(0.3, 1) * speed;
      sp.vel[i * 3] = Math.sin(ph) * Math.cos(th) * s;
      sp.vel[i * 3 + 1] = Math.abs(Math.cos(ph)) * s + 0.8;
      sp.vel[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * s;
      sp.life[i] = sp.max[i] = rand(0.9, 1.9);
      k++;
    }
  }

  /* ---------- Confeti 3D (InstancedMesh) ---------- */
  const CN = isMobile ? 90 : 170;
  const conf = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.16, 0.1),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    CN
  );
  conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  conf.frustumCulled = false;
  const palette = [0xff7eb3, 0xffd27a, 0xffffff, 0xb9a2ff, 0xff9a62].map(c => new THREE.Color(c));
  const dummy = new THREE.Object3D();
  const cd = [];
  for (let i = 0; i < CN; i++) {
    conf.setColorAt(i, palette[i % palette.length]);
    cd.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Vector3(), rv: new THREE.Vector3(), life: 0 });
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    conf.setMatrixAt(i, dummy.matrix);
  }
  conf.instanceColor.needsUpdate = true;
  scene.add(conf);

  function confetti(origin, n = CN) {
    let k = 0;
    for (const d of cd) {
      if (d.life > 0 || k >= n) continue;
      d.p.set(origin.x + rand(-0.6, 0.6), origin.y + rand(-0.3, 0.3), origin.z + rand(-0.6, 0.6));
      d.v.set(rand(-3.2, 3.2), rand(3.5, 7.5), rand(-3.2, 3.2));
      d.r.set(rand(0, 6), rand(0, 6), rand(0, 6));
      d.rv.set(rand(-7, 7), rand(-7, 7), rand(-7, 7));
      d.life = rand(3, 5);
      k++;
    }
  }

  /* ---------- Humo ---------- */
  const puffs = [];
  const tmp = new THREE.Vector3();
  function smoke(pos) {
    for (let k = 0; k < 7; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false }));
      s.position.copy(pos).add(new THREE.Vector3(rand(-0.03, 0.03), 0, rand(-0.03, 0.03)));
      s.userData = {
        t: 0, delay: k * 0.12, life: rand(2.2, 3.4), s0: rand(0.2, 0.35),
        v: new THREE.Vector3(rand(-0.12, 0.12), rand(0.5, 0.9), rand(-0.12, 0.12))
      };
      scene.add(s);
      puffs.push(s);
    }
  }

  /* ---------- Estado e interacciones ---------- */
  let boost = 1, boostTarget = 1, wishing = false, emitTimer = 0, spinSpeed = 0.12;

  function topWorld(extra = 1.1) {
    return group.localToWorld(new THREE.Vector3(0, topY + extra, 0));
  }

  const api = {
    group, candles, onAllOut: null,

    anyLit: () => candles.some(c => c.lit),

    wish() {
      wishing = true;
      boostTarget = 1.9;
      sparkBurst(topWorld(), 55, 3.2);
    },
    endWish() { wishing = false; boostTarget = 1; },

    extinguish(c) {
      if (!c.lit) return false;
      c.lit = false;
      c.flame.visible = false;
      c.glow.visible = false;
      c.light.intensity = 0;
      c.flame.getWorldPosition(tmp);
      smoke(tmp.clone());
      sparkBurst(tmp, 6, 0.8);
      if (!api.anyLit() && api.onAllOut) api.onAllOut();
      return true;
    },

    relight() {
      candles.forEach(c => { c.lit = true; c.flame.visible = true; c.glow.visible = true; });
    },

    poke() { // clic en el pastel
      spinSpeed = 2.4;
      sparkBurst(topWorld(0.6), 28, 2.2);
    },

    confetti: (origin, n) => confetti(origin || topWorld(2.5), n),
    topWorld,

    setReveal(e) {
      group.visible = e > 0.001;
      group.scale.setScalar(Math.max(e, 0.001));
    },

    update(t, dt) {
      // Giro lento del pastel (más rápido un instante si le hacen clic)
      spinSpeed += (0.12 - spinSpeed) * Math.min(1, dt * 1.5);
      group.rotation.y += dt * spinSpeed;

      boost += (boostTarget - boost) * Math.min(1, dt * 3);

      for (const c of candles) {
        if (!c.lit) continue;
        const f = 1 + 0.1 * Math.sin(t * 13 + c.ph) + 0.07 * Math.sin(t * 29 + c.ph * 2);
        const w = (0.95 + 0.05 * Math.sin(t * 9 + c.ph)) * (0.7 + 0.3 * boost);
        c.flame.scale.set(w, 1.8 * f * boost, w);
        c.flame.position.x = Math.sin(t * 4 + c.ph) * 0.012;
        c.glow.scale.setScalar(0.9 * f * boost);
        c.light.intensity = 2.4 * f * boost;
      }

      if (wishing) {
        emitTimer += dt;
        if (emitTimer > 0.08) { emitTimer = 0; sparkBurst(topWorld(), 3, 1.4); }
      }

      // Chispas
      for (let i = 0; i < SN; i++) {
        if (sp.life[i] > 0) {
          sp.life[i] -= dt;
          sp.vel[i * 3 + 1] -= 0.6 * dt;
          for (let a = 0; a < 3; a++) {
            sp.vel[i * 3 + a] *= 0.985;
            sp.pos[i * 3 + a] += sp.vel[i * 3 + a] * dt;
          }
          const f = Math.max(0, sp.life[i] / sp.max[i]);
          sp.col[i * 3] = f; sp.col[i * 3 + 1] = 0.78 * f; sp.col[i * 3 + 2] = 0.5 * f;
        } else {
          sp.col[i * 3] = sp.col[i * 3 + 1] = sp.col[i * 3 + 2] = 0;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.color.needsUpdate = true;

      // Confeti
      for (let i = 0; i < CN; i++) {
        const d = cd[i];
        if (d.life > 0) {
          d.life -= dt;
          d.v.y -= 4.2 * dt;
          d.v.x *= 0.992; d.v.z *= 0.992;
          d.p.addScaledVector(d.v, dt);
          d.r.addScaledVector(d.rv, dt);
          if (d.p.y < 0.02) { d.p.y = 0.02; d.v.set(0, 0, 0); d.rv.set(0, 0, 0); }
          dummy.position.copy(d.p);
          dummy.rotation.set(d.r.x, d.r.y, d.r.z);
          dummy.scale.setScalar(Math.min(1, d.life * 2));
        } else {
          dummy.scale.setScalar(0);
        }
        dummy.updateMatrix();
        conf.setMatrixAt(i, dummy.matrix);
      }
      conf.instanceMatrix.needsUpdate = true;

      // Humo
      for (let i = puffs.length - 1; i >= 0; i--) {
        const s = puffs[i], d = s.userData;
        d.t += dt;
        const u = (d.t - d.delay) / d.life;
        if (u >= 1) {
          scene.remove(s);
          s.material.dispose();
          puffs.splice(i, 1);
          continue;
        }
        if (u > 0) {
          s.position.addScaledVector(d.v, dt);
          s.material.opacity = 0.32 * Math.sin(Math.PI * u);
          s.scale.setScalar(d.s0 + u * 1.1);
        }
      }
    }
  };
  return api;
}
