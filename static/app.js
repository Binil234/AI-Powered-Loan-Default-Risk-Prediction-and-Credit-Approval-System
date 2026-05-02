let DRIVERS = [];
let selectedDriver = null;

const searchEl = document.getElementById('driver-search');
const dropEl = document.getElementById('driver-dropdown');

// ------------------------------
// LOAD DRIVERS
// ------------------------------
fetch("/drivers")
  .then(res => res.json())
  .then(data => {
    DRIVERS = data;
    renderDropdown();
  });

// ------------------------------
// DROPDOWN
// ------------------------------
function renderDropdown(filter = '') {
  const list = filter
    ? DRIVERS.filter(name => name.toLowerCase().includes(filter.toLowerCase()))
    : DRIVERS;

  dropEl.innerHTML = list.map(name => `
    <div class="dd-item" data-name="${name}">
      <div class="dd-avatar">${name.charAt(0)}</div>
      <div class="dd-name">${name}</div>
    </div>
  `).join('');

  dropEl.querySelectorAll('.dd-item').forEach(el => {
    el.addEventListener('click', () => selectDriver(el.dataset.name));
  });
}

searchEl.addEventListener('focus', () => {
  renderDropdown(searchEl.value);
  dropEl.classList.remove('hidden');
});

searchEl.addEventListener('input', () => {
  renderDropdown(searchEl.value);
  dropEl.classList.remove('hidden');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) dropEl.classList.add('hidden');
});

// ------------------------------
// DRIVER SELECT (REAL DATA)
// ------------------------------
async function selectDriver(name) {

  searchEl.value = name;
  dropEl.classList.add('hidden');

  const res = await fetch(`/driver_stats/${encodeURIComponent(name)}`);
  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  selectedDriver = data;

  document.getElementById('d-avatar').textContent = name.charAt(0);
  document.getElementById('d-name').textContent = name;
  document.getElementById('d-team').textContent = data.team;
  document.getElementById('driver-card').classList.remove('hidden');

  document.getElementById('s-driver').textContent = data.avg;
  document.getElementById('s-cons').textContent = data.cons;
  document.getElementById('s-team').textContent = data.team;
  document.getElementById('s-form').textContent = data.form;

  checkBtn();
}

// ------------------------------
// VALIDATION
// ------------------------------
function checkBtn() {
  const g = parseFloat(document.getElementById('grid').value);
  const q = parseFloat(document.getElementById('quali').value);

  document.getElementById('predict-btn').disabled =
    !(selectedDriver && g >= 1 && g <= 20 && q >= 1 && q <= 20);
}

// ------------------------------
// PREDICT
// ------------------------------
document.getElementById('predict-btn').addEventListener('click', async () => {

  const grid = parseFloat(document.getElementById('grid').value);

  const res = await fetch('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grid,
      driver_avg_pos: selectedDriver.avg,
      constructor_avg_pos: selectedDriver.cons
    })
  });

  const data = await res.json();

  const pct = Math.round(data.probability * 100);
  const isPod = data.top3_prediction === 1;

  document.getElementById('r-label').textContent =
    isPod ? 'Likely Podium Finish' : 'Unlikely Podium Finish';

  document.getElementById('r-sub').textContent =
    `${selectedDriver.name} — ${pct}%`;
});