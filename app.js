// ======================
// app.js
// ======================

// ----------------------
// Preguntas (las 15)
// ----------------------
const allQuestions = [
  { cancion:'Viva la Vida (Coldplay)', tiempo_gramatical:'USED TO', frase_completa:'I used to rule the world', blanks:['used to rule'], videoId:'dvgZkm1xWPE', startTime:35 },
  { cancion:'Someone Like You (Adele)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'I heard that you settled down', blanks:['heard'], videoId:'hLQl3WQQoQ0', startTime:8 },
  { cancion:'Shape of You (Ed Sheeran)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'The club was the reason why we started talking', blanks:['was'], videoId:'JGwWNGJdvx8', startTime:18 },
  { cancion:'Counting Stars (OneRepublic)', tiempo_gramatical:'USED TO', frase_completa:'I used to dream about living', blanks:['used to dream'], videoId:'hT_nvWreIhg', startTime:48 },
  { cancion:'Rolling in the Deep (Adele)', tiempo_gramatical:'PAST CONTINUOUS', frase_completa:'We were having it all', blanks:['were having'], videoId:'rYEDA3JcQqw', startTime:68 },
  { cancion:'Someone You Loved (Lewis Capaldi)', tiempo_gramatical:'USED TO', frase_completa:'I used to be by myself now', blanks:['used to be'], videoId:'zABLecsR5UE', startTime:58 },
  { cancion:'Car Radio (Twenty One Pilots)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'Somebody stole my car radio', blanks:['stole'], videoId:'92XVwY54h5k', startTime:15 },
  { cancion:'Say Something (A Great Big World)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'I gave up on you', blanks:['gave'], videoId:'-2U0Ivkn2Ds', startTime:15 },
  { cancion:'Perfect (Ed Sheeran)', tiempo_gramatical:'PAST CONTINUOUS', frase_completa:'We were dancing in the dark', blanks:['were dancing'], videoId:'2Vv-BfVoq4g', startTime:95 },
  { cancion:'Let It Be (The Beatles)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'When I found myself in times of trouble', blanks:['found'], videoId:'QDYfEBY9NM4', startTime:8 },
  { cancion:'Uptown Funk (Bruno Mars)', tiempo_gramatical:'PAST CONTINUOUS', frase_completa:'I was rocking with you', blanks:['was rocking'], videoId:'OPf0YbXqDm0', startTime:52 },
  { cancion:'Back to December (Taylor Swift)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'You gave me all your love', blanks:['gave'], videoId:'QUwxKWT6m7U', startTime:68 },
  { cancion:'Locked Out of Heaven (Bruno Mars)', tiempo_gramatical:'PAST CONTINUOUS', frase_completa:'It was showing me the light', blanks:['was showing'], videoId:'e-fA-gBCkj0', startTime:45 },
  { cancion:'I Love It (Icona Pop)', tiempo_gramatical:'SIMPLE PAST', frase_completa:'I crashed my car into the bridge', blanks:['crashed'], videoId:'UxxajLWwzqY', startTime:58 },
  { cancion:'Don\'t Start Now (Dua Lipa)', tiempo_gramatical:'USED TO', frase_completa:'The way I used to be', blanks:['used to be'], videoId:'oygrmJFKYZY', startTime:48 }
];

// ----------------------
// Estado del juego
// ----------------------
let playerName = "";
let difficulty = null; // 'easy' | 'medium' | 'hard'
let questions = [];
let currentIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 0;
let player = null;
let ytReady = false;

let selectedOption = null; // texto seleccionado
let allowConfirm = false;

// Sonidos DOM
const soundCorrect = () => document.getElementById("sound-correct");
const soundWrong = () => document.getElementById("sound-wrong");

// ----------------------
// YouTube IFrame API
// ----------------------
function onYouTubeIframeAPIReady() {
  // Creamos player oculto (audio-only). Lo hacemos con tamaño 0.
  player = new YT.Player('youtubePlayer', {
    height: '0',
    width: '0',
    videoId: '',
    playerVars: { 'playsinline': 1 },
    events: {
      'onReady': () => { ytReady = true; },
      'onStateChange': () => {}
    }
  });
}

// ----------------------
// Utilidades
// ----------------------
function shuffle(a){ return a.sort(()=>Math.random()-0.5); }

function getTimeByDifficulty(){
  if(difficulty === 'easy') return 25;
  if(difficulty === 'medium') return 18;
  return 12;
}

// ----------------------
// Render principal
// ----------------------
function render(){
  const app = document.getElementById('app');
  if(!playerName) return renderNameScreen();
  if(!difficulty) return renderDifficultyScreen();
  if(currentIndex >= questions.length) return renderResults();
  return renderQuestion();
}

// ----------------------
// Pantalla nombre
// ----------------------
function renderNameScreen(){
  document.body.className = ''; // reset bg
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>Bienvenido 🎧</h2>
      <p>Ingresa tu nombre para comenzar</p>
      <input id="nameInput" class="input-field" placeholder="Tu nombre">
      <div>
        <button class="action-button" onclick="saveName()">Comenzar</button>
      </div>
    </div>
  `;
}

function saveName(){
  const v = document.getElementById('nameInput').value.trim();
  if(!v) return alert('Escribe un nombre válido');
  playerName = v;
  render();
}

// ----------------------
// Pantalla dificultad
// ----------------------
function renderDifficultyScreen(){
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>Selecciona dificultad</h2>
      <div style="margin-top:12px;">
        <button onclick="startGame('easy')">Fácil</button>
        <button onclick="startGame('medium')">Medio</button>
        <button onclick="startGame('hard')">Difícil</button>
      </div>
    </div>
  `;
}

// ----------------------
// Iniciar juego
// ----------------------
function startGame(level){
  difficulty = level;
  // aplicar clase para fondo dinámico
  document.body.className = level;

  // clonar y mezclar preguntas
  questions = shuffle([...allQuestions]);
  currentIndex = 0;
  score = 0;
  render();
}

// ----------------------
// Render pregunta
// ----------------------
function renderQuestion(){
  selectedOption = null;
  allowConfirm = false;
  clearInterval(timerInterval);

  const q = questions[currentIndex];

  // preparar frase con blank (solo primer blank)
  const blank = q.blanks[0];
  const fraseHtml = q.frase_completa.replace(new RegExp(blank, 'i'), `<strong>_______</strong>`);

  // opciones (1 correcta + 2 distractores de la misma frase)
  const palabras = q.frase_completa.split(/\s+/).filter(w => !q.blanks.includes(w));
  const distractores = [];
  while(distractores.length < 2 && palabras.length){
    const pick = palabras.splice(Math.floor(Math.random() * palabras.length),1)[0];
    if(!distractores.includes(pick)) distractores.push(pick);
  }
  const opciones = shuffle([q.blanks[0], ...distractores]);

  // render
  document.getElementById('app').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h3 style="margin:0">${q.cancion}</h3>
          <small>${q.tiempo_gramatical}</small>
        </div>
        <div style="text-align:right">
          <div>Puntaje: <strong id="scoreDisplay">${score}</strong></div>
          <div>Pregunta: ${currentIndex+1} / ${questions.length}</div>
        </div>
      </div>

      <div style="margin:12px 0;">
        <div class="progress-bar"><div id="progressFill" style="width:${(currentIndex/questions.length)*100}%"></div></div>
        <div class="timer" id="timerDisplay">${getTimeByDifficulty()}s</div>
      </div>

      <p style="font-size:1.1rem">${fraseHtml}</p>

      <div id="optionsContainer" style="margin:12px 0;">
        ${opciones.map((o,i)=>`<button class="secondary-button option-btn" onclick="selectOption(this,'${escapeQuotes(o)}')">${o}</button>`).join('')}
      </div>

      <div style="margin-top:10px;">
        <button id="confirmBtn" class="action-button" disabled onclick="confirmAnswer()">Confirmar respuesta</button>
        <button class="play-button" onclick="playAudio()">▶ Escuchar</button>
      </div>
    </div>
  `;

  // iniciar timer y player (audio)
  startTimer();
  // si yt aún no estuvo listo, onYouTubeIframeAPIReady lo inicializará y player quedará listo.
}

// escape simple para atributos
function escapeQuotes(s){ return s.replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

// ----------------------
// Selección de opción
// ----------------------
function selectOption(btn, value){
  // habilitar confirm
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b=> b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOption = value;
  allowConfirm = true;
  document.getElementById('confirmBtn').disabled = false;
}

// ----------------------
// Confirmar respuesta
// ----------------------
function confirmAnswer(){
  if(!allowConfirm) return;
  const q = questions[currentIndex];
  const correct = q.blanks[0];

  // deshabilitar botones de opciones
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  document.getElementById('confirmBtn').disabled = true;

  // detener timer
  clearInterval(timerInterval);

  // buscar boton seleccionado
  const selectedBtn = Array.from(document.querySelectorAll('.option-btn')).find(b => b.classList.contains('selected'));

  if(selectedOption === correct){
    // correcto
    score += 10;
    selectedBtn.classList.add('correct');
    (soundCorrect() || {play:()=>{}}).play();
    showInlineMessage('¡Correcto! +10', true);
  } else {
    // incorrecto
    selectedBtn && selectedBtn.classList.add('wrong');
    (soundWrong() || {play:()=>{}}).play();
    // marcar cuál era la correcta
    Array.from(document.querySelectorAll('.option-btn')).forEach(b=>{
      if(b.textContent.trim() === correct) b.classList.add('correct');
    });
    showInlineMessage(`Incorrecto — la correcta era: "${correct}"`, false);
  }

  // actualizar puntaje en UI
  const sd = document.getElementById('scoreDisplay');
  if(sd) sd.textContent = score;

  // esperar 900ms y avanzar
  setTimeout(()=>{ currentIndex++; render(); }, 900);
}

// Mensaje breve
function showInlineMessage(text, success){
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.marginTop = '8px';
  msg.style.fontWeight = '600';
  msg.style.color = success ? '#0a0' : '#b00';
  document.querySelector('.card').appendChild(msg);
  setTimeout(()=> msg.remove(), 1200);
}

// ----------------------
// Timer
// ----------------------
function startTimer(){
  clearInterval(timerInterval);
  timeLeft = getTimeByDifficulty();
  const tEl = document.getElementById('timerDisplay');
  if(tEl) tEl.textContent = `${timeLeft}s`;

  timerInterval = setInterval(()=>{
    timeLeft--;
    const tEl2 = document.getElementById('timerDisplay');
    if(tEl2) tEl2.textContent = `${timeLeft}s`;

    // actualizar barra
    const pf = document.getElementById('progressFill');
    if(pf) pf.style.width = `${(currentIndex/questions.length)*100}%`;

    if(timeLeft <= 0){
      clearInterval(timerInterval);
      // timeout => incorrecto
      (soundWrong() || {play:()=>{}}).play();
      showInlineMessage('⏳ Tiempo agotado', false);
      // revelar correcta
      const q = questions[currentIndex];
      const correct = q.blanks[0];
      Array.from(document.querySelectorAll('.option-btn')).forEach(b=>{
        if(b.textContent.trim() === correct) b.classList.add('correct');
        b.disabled = true;
      });
      setTimeout(()=>{ currentIndex++; render(); }, 900);
    }
  }, 1000);
}

// ----------------------
// Reproducir audio (solo audio)
// ----------------------
function playAudio(){
  const q = questions[currentIndex];
  if(!player || !ytReady){
    // si el player no está listo, informar y continuar (no bloquear)
    console.warn('YouTube player no listo aún');
    return;
  }
  // load y play segmento (recomendado 12s)
  try {
    player.loadVideoById({ videoId: q.videoId, startSeconds: q.startTime, endSeconds: q.startTime + 12 });
  } catch(e){
    console.warn('Error cargando audio', e);
  }
}

// ----------------------
// Resultados y medallas
// ----------------------
function renderResults(){
  clearInterval(timerInterval);

  const maxScore = questions.length * 10;
  const pct = Math.round((score / maxScore) * 100);
  let medal = 'Bronce';
  if(pct >= 80) medal = 'Oro';
  else if(pct >= 50) medal = 'Plata';

  // guardar en leaderboard
  saveLeaderboard({ name: playerName, score, date: Date.now() });

  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>Juego terminado</h2>
      <p>${playerName}, tu puntaje: <strong>${score}</strong> / ${maxScore} (${pct}%)</p>
      <p>Medalla: <strong>${medal}</strong></p>
      <div style="margin:12px">
        <button onclick="goLeaderboard()">Ver tabla de clasificación</button>
        <button onclick="restart()">Jugar otra vez</button>
      </div>
    </div>
  `;
}

// ----------------------
// Leaderboard (localStorage)
// ----------------------
function saveLeaderboard(entry){
  const key = 'gram_game_leaderboard_v1';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.push(entry);
  data.sort((a,b)=> b.score - a.score);
  // limitar top 20
  localStorage.setItem(key, JSON.stringify(data.slice(0,20)));
}

function goLeaderboard(){
  const key = 'gram_game_leaderboard_v1';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h2>Tabla de Clasificación</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left">Jugador</th><th>Puntaje</th></tr></thead>
        <tbody>
          ${data.map(d=>`<tr><td>${escapeHTML(d.name)}</td><td>${d.score}</td></tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px">
        <button onclick="restart()">Jugar</button>
        <button onclick="clearLeaderboard()">Borrar tabla</button>
      </div>
    </div>
  `;
}

function clearLeaderboard(){
  if(!confirm('Eliminar tabla de clasificación?')) return;
  localStorage.removeItem('gram_game_leaderboard_v1');
  goLeaderboard();
}

function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ----------------------
// Restart
// ----------------------
function restart(){
  playerName = "";
  difficulty = null;
  questions = [];
  currentIndex = 0;
  score = 0;
  clearInterval(timerInterval);
  document.body.className = '';
  render();
}

// ----------------------
// Init
// ----------------------
render();
