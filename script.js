// ================= CONFIG =================
const ADMIN_PASSWORD = "Predictions6552";

let isAdmin = false;
let manualLock = false;
let lockOnDate = localStorage.getItem("lockOnDate") || null;

let winnerChartInstance = null;

// ================= HELPERS =================
function getEliminatedList() {
  return eliminatedByWeek.flatMap(w => w.players);
}

function isEliminated(name) {
  return getEliminatedList().includes(name);
}

// ================= SCORING =================
function calculateScore(player) {
  let score = 3;

  player.picks.forEach(p => {
    if (isEliminated(p)) score--;
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

// ================= TABLE =================
function renderStandings() {
  const body = document.getElementById("standingsBody");
  body.innerHTML = "";

  const sorted = getSortedPlayers();

  let prevScore = null;
  let rank = 0;

  sorted.forEach((p, i) => {
    const score = calculateScore(p);

    if (score !== prevScore) {
      rank = i + 1;
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

  eliminatedByWeek.forEach(w => {
    div.innerHTML += `
      <div class="week-block">
        <strong>Week ${w.week}:</strong> ${w.players.join(", ")}
      </div>
    `;
  });
}

// ================= CHART (CLEANER LEGEND) =================
function renderChart() {
  const counts = {};

  players.forEach(p => {
    counts[p.winnerPick] = (counts[p.winnerPick] || 0) + 1;
  });

  const ctx = document.getElementById("winnerChart");

  if (winnerChartInstance) {
    winnerChartInstance.destroy();
  }

  winnerChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [
          "#4f46e5",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#a855f7",
          "#14b8a6",
          "#eab308"
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom", // 👈 cleaner than side
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

// ================= DROPDOWNS =================
function populateDropdowns() {
  const add = document.getElementById("eliminatedSelect");
  const remove = document.getElementById("removeEliminatedSelect");

  const eliminated = getEliminatedList();
  const available = allCastaways.filter(p => !eliminated.includes(p));

  add.innerHTML = `<option value="">Select</option>`;
  available.forEach(p => {
    add.innerHTML += `<option value="${p}">${p}</option>`;
  });

  remove.innerHTML = `<option value="">Select</option>`;
  eliminated.forEach(p => {
    remove.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

// ================= ADMIN ACTIONS =================
function addEliminated() {
  const val = document.getElementById("eliminatedSelect").value;
  if (!val) return alert("Select a player");

  let last = eliminatedByWeek[eliminatedByWeek.length - 1];

  if (!last) {
    last = { week: 1, players: [] };
    eliminatedByWeek.push(last);
  }

  if (!last.players.includes(val)) {
    last.players.push(val);
  }

  rerender();
}

function removeEliminated() {
  const val = document.getElementById("removeEliminatedSelect").value;
  if (!val) return alert("Select a player");

  eliminatedByWeek.forEach(w => {
    w.players = w.players.filter(p => p !== val);
  });

  rerender();
}

function saveUpdate() {
  updateMessage = document.getElementById("updateInput").value;
  renderUpdateMessage();
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
      document.getElementById("adminLoginBtn").style.display = "none";
    } else {
      alert("Wrong password");
    }
  };
}

// ================= LOGOUT =================
function setupLogout() {
  document.getElementById("logoutBtn").onclick = () => {
    isAdmin = false;
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("adminLoginBtn").style.display = "inline-block";
  };
}

// ================= LOCK =================
function isLocked() {
  const now = new Date();

  if (manualLock) return true;

  if (lockOnDate) {
    if (now >= new Date(lockOnDate)) return true;
  }

  return false;
}

function setupLockControls() {
  document.getElementById("lockBtn").onclick = () => {
    manualLock = true;
    alert("Locked");
  };

  document.getElementById("unlockBtn").onclick = () => {
    manualLock = false;
    lockOnDate = null;
    localStorage.removeItem("lockOnDate");
    alert("Unlocked");
  };

  document.getElementById("setDateLockBtn").onclick = () => {
    const val = document.getElementById("lockDateInput").value;
    if (!val) return alert("Pick a date");

    lockOnDate = val;
    localStorage.setItem("lockOnDate", val);

    alert("Will lock ON " + val);
  };
}

// ================= CORE =================
function rerender() {
  renderStandings();
  renderUpdateMessage();
  renderEliminatedByWeek();
  renderChart();
  populateDropdowns();
}

// ================= START =================
function startApp() {
  setupLogin();
  setupLogout();
  setupLockControls();

  document.getElementById("addEliminatedBtn").onclick = addEliminated;
  document.getElementById("removeEliminatedBtn").onclick = removeEliminated;
  document.getElementById("saveUpdateBtn").onclick = saveUpdate;

  rerender();

  if (isLocked()) {
    document.getElementById("lockScreen").classList.remove("hidden");
    return;
  }

  document.getElementById("warningScreen").classList.remove("hidden");

  document.getElementById("continueBtn").onclick = () => {
    document.getElementById("warningScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  };
}

startApp();