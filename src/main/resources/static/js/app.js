const API_URL = 'http://localhost:8081/api';
let activeItems = [];
let currentStats = { hp: 0, attack: 0, defense: 0, speed: 0 };

// ==========================================
// 0. MOTOR DE SONIDO RETRO (Web Audio API)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SoundEngine = {
    // Generador de tonos base
    playTone: function(freq, type, duration, vol = 0.1) {
        if (audioCtx.state === 'suspended') audioCtx.resume(); // Requerido por los navegadores
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Efecto de desvanecimiento para que no suene cortado
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },

    // Efectos específicos
    playerHit: () => SoundEngine.playTone(600, 'square', 0.1, 0.05),   // Espadazo agudo
    enemyHit: () => SoundEngine.playTone(150, 'sawtooth', 0.15, 0.1),  // Golpe grave del Orco
    miss: () => SoundEngine.playTone(800, 'sine', 0.05, 0.02),         // Sonido de fallar al aire

    victory: () => {
        // Arpegio feliz (Acorde mayor)
        setTimeout(() => SoundEngine.playTone(440, 'square', 0.15, 0.1), 0);
        setTimeout(() => SoundEngine.playTone(554, 'square', 0.15, 0.1), 150);
        setTimeout(() => SoundEngine.playTone(659, 'square', 0.30, 0.1), 300);
        setTimeout(() => SoundEngine.playTone(880, 'square', 0.40, 0.1), 450);
    },

    defeat: () => {
        // Tonos tristes descendentes
        setTimeout(() => SoundEngine.playTone(300, 'sawtooth', 0.3, 0.1), 0);
        setTimeout(() => SoundEngine.playTone(250, 'sawtooth', 0.3, 0.1), 300);
        setTimeout(() => SoundEngine.playTone(200, 'sawtooth', 0.5, 0.1), 600);
    }
};

// ==========================================
// 1. CONEXIÓN CON JAVA
// ==========================================
// Estado del juego
let gameOver = false;
let gameLoopId;

const player = { x: 50, y: 180, size: 30, color: '#3498db', attacking: false, currentHp: 0 };
const enemy = { x: 700, y: 180, size: 40, color: '#e74c3c', maxHp: 800, hp: 800, speed: 1.5, attack: 35, attackCooldown: 0, attacking: false };

const obstacles = [
    { x: 200, y: 50, w: 40, h: 150 },
    { x: 400, y: 200, w: 40, h: 200 },
    { x: 200, y: 300, w: 150, h: 40 }
];

async function fetchHero() {
    try {
        const res = await fetch(`${API_URL}/hero`);
        const data = await res.json();

        document.getElementById('hero-desc').innerText = data.description;
        document.getElementById('stat-hp').innerText = data.hp;
        document.getElementById('stat-atk').innerText = data.attack;
        document.getElementById('stat-def').innerText = data.defense;
        document.getElementById('stat-spd').innerText = data.speed;

        activeItems = data.items;
        currentStats = { hp: data.hp, attack: data.attack, defense: data.defense, speed: data.speed };

        updateButtons();
        resetGame();
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}

async function toggleItem(itemId) {
    const isEquipped = activeItems.includes(itemId);
    const endpoint = isEquipped ? 'unequip' : 'equip';
    await fetch(`${API_URL}/${endpoint}?item=${itemId}`, { method: 'POST' });
    fetchHero();
}

function updateButtons() {
    const allItems = ['sword', 'axe', 'leather', 'plate', 'str_potion', 'spd_aura', 'dragon'];
    allItems.forEach(id => {
        const btn = document.getElementById(`btn-${id}`);
        const status = document.getElementById(`status-${id}`);
        if (activeItems.includes(id)) {
            btn.className = 'btn btn-unequip';
            status.innerText = '(Desequipar)';
        } else {
            btn.className = 'btn btn-equip';
            status.innerText = '(Equipar)';
        }
    });
}

// ==========================================
// 2. LÓGICA DEL MOTOR 2D Y LA IA
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameLog = document.getElementById('game-log');
const reportModal = document.getElementById('battle-report');

const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if(e.code === 'Space' && !gameOver) {
        e.preventDefault();
        attackEnemy();
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

function resetGame() {
    gameOver = false;
    reportModal.classList.add('hidden');
    gameLog.innerText = "¡Prepárate para luchar!";

    player.x = 50; player.y = 180;
    player.currentHp = currentStats.hp;

    enemy.x = 700; enemy.y = 180;
    enemy.hp = enemy.maxHp;
    enemy.attackCooldown = 0;

    updateHpUI();
    if (!gameLoopId) gameLoop();
}

function updateHpUI() {
    document.getElementById('current-hp').innerText = player.currentHp;
}

function isColliding(x, y, size) {
    if (x < 0 || x + size > canvas.width || y < 0 || y + size > canvas.height) return true;
    for (let obs of obstacles) {
        if (x < obs.x + obs.w && x + size > obs.x && y < obs.y + obs.h && y + size > obs.y) return true;
    }
    return false;
}

function attackEnemy() {
    const distX = Math.abs((player.x + player.size/2) - (enemy.x + enemy.size/2));
    const distY = Math.abs((player.y + player.size/2) - (enemy.y + enemy.size/2));

    player.attacking = true;
    setTimeout(() => player.attacking = false, 150);

    if (distX < 60 && distY < 60) {
        // SONIDO: El jugador golpea
        SoundEngine.playerHit();

        enemy.hp -= currentStats.attack;
        gameLog.innerText = `¡Golpeas al Orco! (-${currentStats.attack} HP)`;
        if (enemy.hp <= 0) endGame(true);
    } else {
        // SONIDO: Fallas el golpe
        SoundEngine.miss();
        gameLog.innerText = "Estás muy lejos para atacar.";
    }
}

function updateEnemyAI() {
    if (gameOver) return;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if (distance < 400 && distance > 40) {
        let moveX = (dx / distance) * enemy.speed;
        let moveY = (dy / distance) * enemy.speed;

        if (!isColliding(enemy.x + moveX, enemy.y, enemy.size)) enemy.x += moveX;
        if (!isColliding(enemy.x, enemy.y + moveY, enemy.size)) enemy.y += moveY;
    }

    if (enemy.attackCooldown > 0) enemy.attackCooldown--;

    if (distance <= 50 && enemy.attackCooldown === 0) {
        let damage = Math.max(1, enemy.attack - currentStats.defense);

        // SONIDO: El enemigo te golpea
        SoundEngine.enemyHit();

        player.currentHp -= damage;
        updateHpUI();

        enemy.attackCooldown = 60;
        enemy.attacking = true;
        setTimeout(() => enemy.attacking = false, 150);

        gameLog.innerText = `¡El Orco te ataca! (-${damage} HP) ¡Tu defensa bloqueó ${currentStats.defense}!`;

        if (player.currentHp <= 0) endGame(false);
    }
}

function endGame(isWin) {
    gameOver = true;
    reportModal.classList.remove('hidden');
    const title = document.getElementById('report-title');
    const desc = document.getElementById('report-desc');

    if (isWin) {
        // SONIDO: Victoria
        SoundEngine.victory();
        title.innerText = "¡VICTORIA!";
        title.className = "win-text";
        desc.innerText = `Has derrotado al temible Orco.\nTe sobraron ${player.currentHp} puntos de vida.`;
    } else {
        // SONIDO: Derrota
        SoundEngine.defeat();
        title.innerText = "¡DERROTA!";
        title.className = "lose-text";
        desc.innerText = `El Orco ha acabado contigo.\nLe quedaron ${enemy.hp} puntos de vida al enemigo.`;
    }
}

function gameLoop() {
    if (gameOver) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    const moveSpeed = currentStats.speed ? (currentStats.speed / 5) : 2;
    let newX = player.x;
    let newY = player.y;

    if (keys['KeyW'] || keys['ArrowUp']) newY -= moveSpeed;
    if (keys['KeyS'] || keys['ArrowDown']) newY += moveSpeed;
    if (keys['KeyA'] || keys['ArrowLeft']) newX -= moveSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) newX += moveSpeed;

    if (!isColliding(newX, player.y, player.size)) player.x = newX;
    if (!isColliding(player.x, newY, player.size)) player.y = newY;

    updateEnemyAI();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#7f8c8d';
    for (let obs of obstacles) ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

    if (enemy.hp > 0) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

        ctx.fillStyle = '#c0392b';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.size, 5);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.size * (enemy.hp / enemy.maxHp), 5);

        if (enemy.attacking) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.size + 10, enemy.size + 10);
        }
    }

    if (player.currentHp > 0) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);

        ctx.fillStyle = '#c0392b';
        ctx.fillRect(player.x, player.y - 10, player.size, 5);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(player.x, player.y - 10, player.size * (player.currentHp / currentStats.hp), 5);

        if (player.attacking) {
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 4;
            ctx.strokeRect(player.x - 5, player.y - 5, player.size + 10, player.size + 10);
        }
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

fetchHero();