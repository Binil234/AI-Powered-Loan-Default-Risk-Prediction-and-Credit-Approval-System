let DRIVERS = [];
let selectedDriver = null;

const searchEl = document.getElementById('driver-search');
const dropEl = document.getElementById('driver-dropdown');
const predictBtn = document.getElementById('predict-btn');

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
// DRIVER SELECT
// ------------------------------
async function selectDriver(name) {

  searchEl.value = name;
  dropEl.classList.add('hidden');

  try {
    const res = await fetch(`/driver_stats/${encodeURIComponent(name)}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    selectedDriver = data;

    // UI update
    document.getElementById('d-avatar').textContent = name.charAt(0);
    document.getElementById('d-name').textContent = name;
    document.getElementById('d-team').textContent = data.team;
    document.getElementById('driver-card').classList.remove('hidden');

    document.getElementById('s-driver').textContent = data.avg;
    document.getElementById('s-cons').textContent = data.cons;
    document.getElementById('s-team').textContent = data.team;
    document.getElementById('s-form').textContent = data.form;

    checkBtn();

  } catch (err) {
    alert("Failed to load driver stats");
  }
}

// ------------------------------
// VALIDATION (FIXED)
// ------------------------------
function checkBtn() {
  const g = parseFloat(document.getElementById('grid').value);

  // ONLY grid needed now
  const valid = selectedDriver && g >= 1 && g <= 20;

  predictBtn.disabled = !valid;
}

// 🔥 ADD INPUT LISTENER (YOU WERE MISSING THIS)
document.getElementById('grid').addEventListener('input', checkBtn);

function animateGauge(pct) {
  const arc = document.getElementById('gauge-arc');
  const txt = document.getElementById('gauge-txt');

  if (!arc || !txt) return;

  const total = 283;
  let cur = 0;
  const target = (pct / 100) * total;

  function step() {
    cur = Math.min(cur + target / 50, target);

    arc.setAttribute('stroke-dasharray', `${cur} ${total}`);
    txt.textContent = Math.round((cur / total) * 100) + '%';

    if (cur < target) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

predictBtn.addEventListener('click', async () => {

  if (!selectedDriver) {
    alert("Select a driver first");
    return;
  }

  const grid = parseFloat(document.getElementById('grid').value);

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grid: grid,
        driver_avg_pos: selectedDriver.avg,
        constructor_avg_pos: selectedDriver.cons
      })
    });

    const data = await res.json();

    console.log("Prediction:", data);

    if (data.error) {
      alert(data.error);
      return;
    }

    const pct = Math.round(data.probability * 100);
    const isPod = data.top3_prediction === 1;

    // ---------------- 🔥 SHOW RESULT FIRST ----------------
    document.getElementById('placeholder').classList.add('hidden');
    document.getElementById('result-card').classList.remove('hidden');

    // ---------------- TEXT ----------------
    document.getElementById('r-icon').textContent = isPod ? '🏆' : '🚫';
    document.getElementById('r-label').textContent =
      isPod ? 'Likely Podium Finish' : 'Unlikely Podium Finish';
    document.getElementById('r-sub').textContent =
      `${selectedDriver.name} — ${pct}% confidence`;

    // ---------------- GAUGE ----------------
    animateGauge(pct);

    // ---------------- PROGRESS BAR (FIXED) ----------------
    const bar = document.getElementById('bar-fill');

    if (bar) {
      bar.style.width = '0%'; // reset

      setTimeout(() => {
        bar.style.width = pct + '%';
      }, 120);
    }

  } catch (err) {
    console.error(err);
    alert("Prediction failed");
  }
});