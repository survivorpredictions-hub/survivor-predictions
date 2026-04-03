// ================= CONFIG =================
const ADMIN_PASSWORD = "Predictions6552";

// IMPORTANT:
// For GitHub Pages, this is the lock that works for EVERYONE.
// Set to null for no scheduled lock.
// Example: "2026-03-08"
let globalLockOnDate = null;

// Manual lock is only for your current browser while testing locally/live.
// It will NOT lock the site for everyone on GitHub Pages.
let manualLock = false;
let isAdmin = false;

let winnerChartInstance = null;

// ================= HELPERS =================
function getEliminatedList() {
  return eliminatedByWeek.flatMap((week) => week.players);
}

function isEliminated(name) {
  return getEliminatedList().includes(name);
}

// ================= SCORING =================
function calculateScore(player) {
  let score = 3;

  player.picks.forEach((pick) => {
    if (isEliminated(pick)) {
      score -= 1;
    }
  });

  return Math.max(score, 0);
}

function getSortedPlayers() {
  return [...players].sort((a, b) => {
    const scoreDifference = calculateScore(b) - calculateScore(a);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return a.name.localeCompare(b.name);
  });
}

function formatPick(pick) {
  if (isEliminated(pick)) {
    return `<span class="eliminated-name">${pick}</span>`;
  }

  return pick;
}

// ================= TABLE =================
// Dense ranking:
// 3,3,3,2,2,1 becomes 1,1,1,2,2,3
function renderStandings() {
  const body = document.getElementById("standingsBody");
  body.innerHTML = "";

  const sortedPlayers = getSortedPlayers();

  let previousScore = null;
  let displayedRank = 0;

  sortedPlayers.forEach((player) => {
    const score = calculateScore(player);

    if (score !== previousScore) {
      displayedRank += 1;
    }

    body.innerHTML += `
      <tr>
        <td>${displayedRank}</td>
        <td>${player.name}</td>
        <td>${player.picks.map(formatPick).join(", ")}</td>
        <td>${formatPick(player.winnerPick)}</td>
        <td>${score}</td>
      </tr>
    `;

    previousScore = score;
  });
}

// ================= UPDATE =================
function renderUpdateMessage() {
  document.getElementById("updateMessage").textContent = updateMessage;

  const updateInput = document.getElementById("updateInput");
  if (updateInput) {
    updateInput.value = updateMessage;
  }
}

// ================= ELIMINATED =================
function renderEliminatedByWeek() {
  const div = document.getElementById("eliminatedByWeek");
  div.innerHTML = "";

  const sortedWeeks = [...eliminatedByWeek].sort((a, b) => a.week - b.week);

  sortedWeeks.forEach((week) => {
    div.innerHTML += `
      <div class="week-block">
        <strong>Week ${week.week}:</strong> ${
          week.players.length ? week.players.join(", ") : "No eliminations yet"
        }
      </div>
    `;
  });
}

// ================= CHART =================
function renderChart() {
  const counts = {};

  players.forEach((player) => {
    counts[player.winnerPick] = (counts[player.winnerPick] || 0) + 1;
  });

  const ctx = document.getElementById("winnerChart");

  if (winnerChartInstance) {
    winnerChartInstance.destroy();
  }

  winnerChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            "#4f46e5",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#3b82f6",
            "#a855f7",
            "#14b8a6",
            "#eab308",
            "#f97316",
            "#06b6d4",
            "#84cc16",
            "#ec4899"
          ]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 14
          }
        }
      }
    }
  });
}

// ================= DROPDOWNS =================
function populateDropdowns() {
  const eliminatedSelect = document.getElementById("eliminatedSelect");
  const removeEliminatedSelect = document.getElementById("removeEliminatedSelect");

  if (!eliminatedSelect || !removeEliminatedSelect) return;

  const eliminatedPlayers = getEliminatedList();
  const availablePlayers = allCastaways.filter(
    (player) => !eliminatedPlayers.includes(player)
  );

  eliminatedSelect.innerHTML = `<option value="">Select</option>`;
  availablePlayers.forEach((player) => {
    eliminatedSelect.innerHTML += `<option value="${player}">${player}</option>`;
  });

  removeEliminatedSelect.innerHTML = `<option value="">Select</option>`;
  eliminatedPlayers.forEach((player) => {
    removeEliminatedSelect.innerHTML += `<option value="${player}">${player}</option>`;
  });
}

function populateWeekDropdown() {
  const weekSelect = document.getElementById("weekSelect");
  if (!weekSelect) return;

  const existingValue = weekSelect.value;
  weekSelect.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
    weekSelect.innerHTML += `<option value="${i}">Week ${i}</option>`;
  }

  if (existingValue) {
    weekSelect.value = existingValue;
  } else if (eliminatedByWeek.length > 0) {
    const latestWeek = Math.max(...eliminatedByWeek.map((w) => w.week));
    weekSelect.value = String(latestWeek);
  } else {
    weekSelect.value = "1";
  }
}

// ================= ADMIN ACTIONS =================
function addEliminated() {
  const playerName = document.getElementById("eliminatedSelect").value;
  const weekSelect = document.getElementById("weekSelect");

  if (!playerName) {
    alert("Select a player");
    return;
  }

  let selectedWeek = 1;

  if (weekSelect) {
    selectedWeek = parseInt(weekSelect.value, 10);
  }

  let weekObject = eliminatedByWeek.find((week) => week.week === selectedWeek);

  if (!weekObject) {
    weekObject = { week: selectedWeek, players: [] };
    eliminatedByWeek.push(weekObject);
  }

  if (!weekObject.players.includes(playerName)) {
    weekObject.players.push(playerName);
  }

  eliminatedByWeek.sort((a, b) => a.week - b.week);

  rerender();
}

function removeEliminated() {
  const playerName = document.getElementById("removeEliminatedSelect").value;

  if (!playerName) {
    alert("Select a player");
    return;
  }

  eliminatedByWeek.forEach((week) => {
    week.players = week.players.filter((player) => player !== playerName);
  });

  rerender();
}

function saveUpdate() {
  const updateInput = document.getElementById("updateInput");

  if (!updateInput) return;

  updateMessage = updateInput.value;
  renderUpdateMessage();
}

// ================= LOGIN =================
function setupLogin() {
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const loginPopup = document.getElementById("loginPopup");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const passwordInput = document.getElementById("passwordInput");

  if (!adminLoginBtn || !loginPopup || !loginSubmitBtn || !passwordInput) return;

  adminLoginBtn.onclick = () => {
    loginPopup.classList.remove("hidden");
    passwordInput.value = "";
    passwordInput.focus();
  };

  loginSubmitBtn.onclick = () => {
    const enteredPassword = passwordInput.value;

    if (enteredPassword === ADMIN_PASSWORD) {
      isAdmin = true;
      loginPopup.classList.add("hidden");
      document.getElementById("adminPanel").classList.remove("hidden");
      adminLoginBtn.style.display = "none";
    } else {
      alert("Wrong password");
    }
  };
}

// ================= LOGOUT =================
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.onclick = () => {
    isAdmin = false;
    document.getElementById("adminPanel").classList.add("hidden");
    document.getElementById("adminLoginBtn").style.display = "inline-block";
  };
}

// ================= LOCK =================
function isLocked() {
  const now = new Date();

  if (manualLock) {
    return true;
  }

  if (globalLockOnDate) {
    const lockDate = new Date(globalLockOnDate);
    if (now >= lockDate) {
      return true;
    }
  }

  return false;
}

function applyLockState() {
  const lockScreen = document.getElementById("lockScreen");
  const app = document.getElementById("app");

  if (!lockScreen || !app) return;

  if (isLocked()) {
    lockScreen.classList.remove("hidden");
    app.classList.add("hidden");
  } else {
    lockScreen.classList.add("hidden");
  }
}

function setupLockControls() {
  const lockBtn = document.getElementById("lockBtn");
  const unlockBtn = document.getElementById("unlockBtn");
  const setDateLockBtn = document.getElementById("setDateLockBtn");
  const lockDateInput = document.getElementById("lockDateInput");

  if (lockBtn) {
    lockBtn.onclick = () => {
      manualLock = true;
      applyLockState();
    };
  }

  if (unlockBtn) {
    unlockBtn.onclick = () => {
      manualLock = false;
      globalLockOnDate = null;

      if (lockDateInput) {
        lockDateInput.value = "";
      }

      applyLockState();
    };
  }

  if (setDateLockBtn && lockDateInput) {
    setDateLockBtn.onclick = () => {
      const selectedDate = lockDateInput.value;

      if (!selectedDate) {
        alert("Pick a date");
        return;
      }

      // This changes it only in the current loaded code.
      // For GitHub Pages, you must upload/commit the changed file for everyone to get it.
      globalLockOnDate = selectedDate;
      applyLockState();
      alert("Will lock ON " + selectedDate + ". Upload/commit your updated files to GitHub for the live site to use it.");
    };
  }
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
  setupLogout();
  setupLockControls();

  const addEliminatedBtn = document.getElementById("addEliminatedBtn");
  const removeEliminatedBtn = document.getElementById("removeEliminatedBtn");
  const saveUpdateBtn = document.getElementById("saveUpdateBtn");
  const continueBtn = document.getElementById("continueBtn");
  const leaveBtn = document.getElementById("leaveBtn");

  if (addEliminatedBtn) addEliminatedBtn.onclick = addEliminated;
  if (removeEliminatedBtn) removeEliminatedBtn.onclick = removeEliminated;
  if (saveUpdateBtn) saveUpdateBtn.onclick = saveUpdate;

  rerender();

  applyLockState();
  if (isLocked()) return;

  document.getElementById("warningScreen").classList.remove("hidden");

  if (continueBtn) {
    continueBtn.onclick = () => {
      document.getElementById("warningScreen").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");
    };
  }

  if (leaveBtn) {
    leaveBtn.onclick = () => {
      document.body.innerHTML = "";
    };
  }
}

startApp();