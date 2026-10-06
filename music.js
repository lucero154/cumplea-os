// music.js — reproductor de música (minimizado en una esquina, se expande al hacer clic).
// La música NO se reproduce sola: empieza cuando se pulsa "Entrar a la sorpresa" (llama a start()).

const FALLBACK = 'linear-gradient(135deg, #ff7eb3, #6a4cff)';

function fmt(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function createMusic(playlist) {
  const root = document.getElementById('player');
  if (!playlist || !playlist.length) return null;

  root.innerHTML = `
    <button class="mini" aria-label="Abrir reproductor"><span class="mini-cover"></span><span class="eq"><i></i><i></i><i></i></span></button>
    <div class="full">
      <div class="top">
        <div class="cover"></div>
        <div class="meta"><strong class="t"></strong><span class="a"></span><small class="err"></small></div>
        <button class="min-btn" aria-label="Minimizar">–</button>
      </div>
      <input class="seek" type="range" min="0" max="1000" value="0" aria-label="Progreso">
      <div class="times"><span class="cur">0:00</span><span class="dur">0:00</span></div>
      <div class="ctrl">
        <button class="prev" aria-label="Anterior">⏮</button>
        <button class="play" aria-label="Reproducir o pausar">▶</button>
        <button class="next" aria-label="Siguiente">⏭</button>
      </div>
      <div class="vol"><span>🔈</span><input class="volume" type="range" min="0" max="100" value="70" aria-label="Volumen"></div>
      <ul class="list"></ul>
    </div>`;

  const $ = s => root.querySelector(s);
  const audio = new Audio();
  audio.preload = 'metadata';
  let idx = 0, vol = 0.7, ducked = false, seeking = false;

  const applyVolume = () => { audio.volume = vol * (ducked ? 0.12 : 1); };
  applyVolume();

  // Lista de canciones
  const list = $('.list');
  playlist.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${s.title}</span><small>${s.artist}</small>`;
    li.addEventListener('click', () => { load(i); play(); });
    list.appendChild(li);
  });

  function setCover(el, url) {
    el.style.backgroundImage = `url("${url}"), ${FALLBACK}`;
  }

  function load(i) {
    idx = (i + playlist.length) % playlist.length;
    const s = playlist[idx];
    audio.src = s.file;
    $('.t').textContent = s.title;
    $('.a').textContent = s.artist;
    $('.err').textContent = '';
    setCover($('.cover'), s.cover);
    setCover($('.mini-cover'), s.cover);
    $('.seek').value = 0;
    $('.cur').textContent = '0:00';
    $('.dur').textContent = '0:00';
    [...list.children].forEach((li, k) => li.classList.toggle('on', k === idx));
  }

  function play() {
    audio.play().catch(() => { $('.err').textContent = 'No se pudo reproducir (revisa el archivo)'; });
  }
  function toggle() { audio.paused ? play() : audio.pause(); }

  audio.addEventListener('play', () => { root.classList.add('playing'); $('.play').textContent = '⏸'; });
  audio.addEventListener('pause', () => { root.classList.remove('playing'); $('.play').textContent = '▶'; });
  audio.addEventListener('ended', () => { load(idx + 1); play(); });
  audio.addEventListener('loadedmetadata', () => { $('.dur').textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (seeking || !audio.duration) return;
    $('.seek').value = (audio.currentTime / audio.duration) * 1000;
    $('.cur').textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('error', () => { $('.err').textContent = 'Archivo no encontrado en assets/music/'; });

  $('.play').addEventListener('click', toggle);
  $('.next').addEventListener('click', () => { load(idx + 1); play(); });
  $('.prev').addEventListener('click', () => {
    if (audio.currentTime > 3) audio.currentTime = 0;
    else { load(idx - 1); play(); }
  });
  $('.seek').addEventListener('input', e => {
    seeking = true;
    if (audio.duration) $('.cur').textContent = fmt((e.target.value / 1000) * audio.duration);
  });
  $('.seek').addEventListener('change', e => {
    if (audio.duration) audio.currentTime = (e.target.value / 1000) * audio.duration;
    seeking = false;
  });
  $('.volume').addEventListener('input', e => { vol = e.target.value / 100; applyVolume(); });

  $('.mini').addEventListener('click', () => root.classList.add('open'));
  $('.min-btn').addEventListener('click', () => root.classList.remove('open'));

  load(0);

  return {
    start: play,           // se llama dentro del clic de "Entrar" (los navegadores exigen un gesto del usuario)
    toggle,
    duck(on) { ducked = on; applyVolume(); } // baja la música mientras se ve un video
  };
}
