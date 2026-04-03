// ================= CONFIG =================
const ADMIN_PASSWORD = "Predictions6552";

// 🔥 GLOBAL LOCK (THIS CONTROLS EVERYONE)
let globalLockOnDate = null; 
// example: "2026-04-03"

// 🔥 LOCAL TEST LOCK (ONLY YOUR DEVICE)
let manualLock = false;

let isAdmin = false;
let winnerChartInstance = null;

// ================= HELPERS =================
function getEliminatedList() {
  return eliminatedByWeek.flatMap((w) => w.players);
}

function isEliminated(name) {
  return getEliminatedList().includes(name);
}

// ================= SCORING =================
function calculateScore(player) {
  let score = 3;

  player.picks.forEach((pick) => {
    if (isEliminated(pick)) score--;
  });

  return Math.max(score, 0);
}

function getSortedPlayers() {
  return [...players].sort((a, b) => {
    const diff = calculateScore(b) - calculateScore(a);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

function formatPick(pick) {
  return isEliminated(pick)
    ? `<span class="eliminated-name">${pick}</span>`
    : pick;
}

// ================= RANKING =================
function renderStandings() {
  const body = document.getElementById("standingsBody");
  body.innerHTML = "";

  const sorted = getSortedPlayers();

  let prevScore = null;
  let rank = 0;

  sorted.forEach((p) => {
    const score = calculateScore(p);

    if (score !== prevScore) {
      rank++;
    }

    body.innerHTML += `
      <tr>
        <td>${rank}</td>
        <td>${p.name}</td>
        <td>${p.picks.map(formatPick).join(", ")}</td>
        <td>${formatPick(p.winnerPick)}</td>
        <td>${score}</td>
      </tr>
    `;

    prevScore = score;
  });
}

// ================= UPDATE =================
function renderUpdateMessage() {
  document.getElementById("updateMessage").textContent = updateMessage;
}

// ================= ELIMINATED =================
function renderEliminatedByWeek() {
  const div = document.getElementById("eliminatedByWeek");
  div.innerHTML = "";

  eliminatedByWeek
    .sort((a, b) => a.week - b.week)
    .forEach((week) => {
      div.innerHTML += `
        <div>
          <strong>Week ${week.week}:</strong> 
          ${week.players.join(", ") || "None"}
        </div>
      `;
    });
}

// ================= CHART =================
function renderChart() {
  const counts = {};

  players.forEach((p) => {
    counts[p.winnerPick] = (counts[p.winnerPick] || 0) + 1;
  });

  const ctx = document.getElementById("winnerChart");

  if (winnerChartInstance) winnerChartInstance.destroy();

  winnerChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts)
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// ================= DROPDOWNS =================
function populateDropdowns() {
  const add = document.getElementById("eliminatedSelect");
  const remove = document.getElementById("removeEliminatedSelect");

  if (!add || !remove) return;

  const eliminated = getEliminatedList();

  add.innerHTML = `<option value="">Select</option>`;
  remove.innerHTML = `<option value="">Select</option>`;

  allCastaways.forEach((p) => {
    if (!eliminated.includes(p)) {
      add.innerHTML += `<option>${p}</option>`;
    } else {
      remove.innerHTML += `<option>${p}</option>`;
    }
  });
}

function populateWeekDropdown() {
  const weekSelect = document.getElementById("weekSelect");
  if (!weekSelect) return;

  weekSelect.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
    weekSelect.innerHTML += `<option value="${i}">Week ${i}</option>`;
  }
}

// ================= ADMIN =================
function addEliminated() {
  const player = document.getElementById("eliminatedSelect").value;
  const week = parseInt(document.getElementById("weekSelect").value);

  if (!player) return alert("Select player");

  let w = eliminatedByWeek.find(x => x.week === week);

  if (!w) {
    w = { week, players: [] };
    eliminatedByWeek.push(w);
  }

  if (!w.players.includes(player)) {
    w.players.push(player);
  }

  rerender();
}

function removeEliminated() {
  const player = document.getElementById("removeEliminatedSelect").value;

  eliminatedByWeek.forEach(w => {
    w.players = w.players.filter(p => p !== player);
  });

  rerender();
}

// ================= LOGIN =================
function setupLogin() {
  document.getElementById("adminLoginBtn").onclick = () => {
    document.getElementById("loginPopup").classList.remove("hidden");
  };

  document.getElementById("loginSubmitBtn").onclick = () => {
    const val = document.getElementById("passwordInput").value;

    if (val === ADMIN_PASSWORD) {
      isAdmin = true;
      document.getElementById("loginPopup").classList.add("hidden");
      document.getElementById("adminPanel").classList.remove("hidden");
    } else {
      alert("Wrong password");
    }
  };
}

// ================= LOCK =================
function isLocked() {
  const now = new Date();

  // manual lock (YOU ONLY)
  if (manualLock) return true;

  // global lock (EVERYONE)
  if (globalLockOnDate) {
    return now >= new Date(globalLockOnDate);
  }

  return false;
}

function applyLock() {
  const lock = document.getElementById("lockScreen");
  const app = document.getElementById("app");

  if (isLocked()) {
    lock.classList.remove("hidden");
    app.classList.add("hidden");
  } else {
    lock.classList.add("hidden");
  }
}

function setupLockControls() {
  document.getElementById("lockBtn").onclick = () => {
    manualLock = true;
    applyLock();
  };

  document.getElementById("unlockBtn").onclick = () => {
    manualLock = false;
    globalLockOnDate = null;
    applyLock();
  };

  document.getElementById("setDateLockBtn").onclick = () => {
    const val = document.getElementById("lockDateInput").value;

    if (!val) return alert("Pick date");

    globalLockOnDate = val;
    applyLock();

    alert("GLOBAL LOCK set. Upload files to GitHub to apply for everyone.");
  };
}

// ================= CORE =================
function rerender() {
  renderStandings();
  renderUpdateMessage();
  renderEliminatedByWeek();
  renderChart();
  populateDropdowns();
  populateWeekDropdown();
}

// ================= START =================
function startApp() {
  setupLogin();
  setupLockControls();

  document.getElementById("addEliminatedBtn").onclick = addEliminated;
  document.getElementById("removeEliminatedBtn").onclick = removeEliminated;

  rerender();

  applyLock();
}

startApp();