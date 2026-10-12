const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const serverName = document.getElementById('serverName');
const currentPlayers = document.getElementById('currentPlayers');
const maxPlayers = document.getElementById('maxPlayers');
const progressFill = document.getElementById('progressFill');
const gamemode = document.getElementById('gamemode');
const language = document.getElementById('language');
const address = document.getElementById('address');
const password = document.getElementById('password');
const lastUpdate = document.getElementById('lastUpdate');
const refreshBtn = document.getElementById('refreshBtn');

let isFetching = false;

// Kilau kaca yang mengikuti kursor di kartu utama
const card = document.getElementById('card');
card.addEventListener('pointermove', (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  card.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
card.addEventListener('pointerleave', () => {
  card.style.setProperty('--mx', '50%');
  card.style.setProperty('--my', '0%');
});

function updateUI(data, success) {
  const online = success && data.online !== false;
  statusDot.className = 'status-dot ' + (online ? 'online' : 'offline');
  statusText.textContent = online ? 'Online' : 'Offline';
  document.body.classList.toggle('is-offline', !online);

  serverName.textContent = data.hostname || 'Unknown Server';
  currentPlayers.textContent = data.players ?? 0;
  maxPlayers.textContent = data.maxplayers ?? 0;

  const percent = data.maxplayers > 0
    ? Math.min(100, (data.players / data.maxplayers) * 100)
    : 0;
  progressFill.style.width = percent + '%';

  gamemode.textContent = data.gamemode || '-';
  language.textContent = data.language || '-';
  address.textContent = data.address || '149.248.204.196:7011';
  password.textContent = data.passworded ? 'Yes' : 'No';
  password.style.color = data.passworded ? 'var(--red)' : 'var(--green)';

  const now = new Date();
  lastUpdate.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
}

async function fetchServer() {
  if (isFetching) return;
  isFetching = true;
  refreshBtn.classList.add('loading');
  refreshBtn.textContent = 'Loading...';

  try {
    const res = await fetch('/api/server');
    const json = await res.json();

    if (json.success) {
      updateUI(json.data, true);
    } else {
      updateUI(json.data || {}, false);
    }
  } catch (err) {
    console.error(err);
    updateUI({
      hostname: 'Connection Error',
      players: 0,
      maxplayers: 0,
      gamemode: '-',
      language: '-',
      passworded: false,
      address: '149.248.204.196:7011'
    }, false);
  } finally {
    isFetching = false;
    refreshBtn.classList.remove('loading');
    refreshBtn.textContent = 'Refresh';
  }
}

// Initial load + auto refresh every 15 seconds
fetchServer();
setInterval(fetchServer, 15000);
