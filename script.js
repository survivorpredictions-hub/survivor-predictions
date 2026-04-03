document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PASSWORD = "Predictions6552";

  let isAdmin = false;
  let manualLock = localStorage.getItem("manualLock") === "true";
  let globalLockOnDate = localStorage.getItem("globalLockOnDate") || null;
  let winnerChartInstance = null;

  function el(id) {
    return document.getElementById(id);
  }

  function getEliminatedList() {
    return eliminatedByWeek.flatMap((week) => week.players);
  }

  function isEliminated(name) {
    return getEliminatedList().includes(name);
  }

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

  // Dense ranking: 3,3,3,2,2,1 => 1,1,1,2,2,3
  function renderStandings() {
    const body = el("standingsBody");
    if (!body) return;

    body.innerHTML = "";

    const sorted = getSortedPlayers();
    let previousScore = null;
    let displayedRank = 0;

    sorted.forEach((player) => {
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

  function renderUpdateMessage() {
    const msg = el("updateMessage");
    if (msg) msg.textContent = updateMessage;

    const input = el("updateInput");
    if (input) input.value = updateMessage;
  }

  function renderEliminatedByWeek() {
    const container = el("eliminatedByWeek");
    if (!container) return;

    container.innerHTML = "";

    [...eliminatedByWeek]
      .sort((a, b) => a.week - b.week)
      .forEach((week) => {
        container.innerHTML += `
          <div class="week-block">
            <strong>Week ${week.week}:</strong> ${week.players.length ? week.players.join(", ") : "None"}
          </div>
        `;
      });
  }

  function renderChart() {
    const canvas = el("winnerChart");
    if (!canvas || typeof Chart === "undefined") return;

    const counts = {};

    players.forEach((player) => {
      counts[player.winnerPick] = (counts[player.winnerPick] || 0) + 1;
    });

    if (winnerChartInstance) {
      winnerChartInstance.destroy();
    }

    winnerChartInstance = new Chart(canvas, {
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
            position: "bottom"
          }
        }
      }
    });
  }

  function populateDropdowns() {
    const addSelect = el("eliminatedSelect");
    const removeSelect = el("removeEliminatedSelect");
    if (!addSelect || !removeSelect) return;

    const eliminated = getEliminatedList();

    addSelect.innerHTML = `<option value="">Select</option>`;
    removeSelect.innerHTML = `<option value="">Select</option>`;

    allCastaways.forEach((name) => {
      if (eliminated.includes(name)) {
        removeSelect.innerHTML += `<option value="${name}">${name}</option>`;
      } else {
        addSelect.innerHTML += `<option value="${name}">${name}</option>`;
      }
    });
  }

  function populateWeekDropdown() {
    const weekSelect = el("weekSelect");
    if (!weekSelect) return;

    const currentValue = weekSelect.value;
    weekSelect.innerHTML = "";

    for (let i = 1; i <= 20; i += 1) {
      weekSelect.innerHTML += `<option value="${i}">Week ${i}</option>`;
    }

    if (currentValue) {
      weekSelect.value = currentValue;
    } else if (eliminatedByWeek.length > 0) {
      const latestWeek = Math.max(...eliminatedByWeek.map((w) => w.week));
      weekSelect.value = String(latestWeek);
    } else {
      weekSelect.value = "1";
    }
  }

  function addEliminated() {
    const eliminatedSelect = el("eliminatedSelect");
    const weekSelect = el("weekSelect");
    if (!eliminatedSelect || !weekSelect) return;

    const playerName = eliminatedSelect.value;
    const selectedWeek = parseInt(weekSelect.value, 10);

    if (!playerName) {
      alert("Select a player");
      return;
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
    const removeSelect = el("removeEliminatedSelect");
    if (!removeSelect) return;

    const playerName = removeSelect.value;
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
    const input = el("updateInput");
    if (!input) return;

    updateMessage = input.value || "";
    renderUpdateMessage();
  }

  function showAppDirectly() {
    const warningScreen = el("warningScreen");
    const app = el("app");
    if (warningScreen) warningScreen.classList.add("hidden");
    if (app) app.classList.remove("hidden");
  }

  function unlockEverything() {
    manualLock = false;
    globalLockOnDate = null;
    localStorage.removeItem("manualLock");
    localStorage.removeItem("globalLockOnDate");

    const lockDateInput = el("lockDateInput");
    if (lockDateInput) lockDateInput.value = "";

    const lockLoginBox = el("lockLoginBox");
    if (lockLoginBox) lockLoginBox.classList.add("hidden");

    applyLockState();
  }

  function doAdminLogin(passwordValue, fromLockedScreen = false) {
    if (passwordValue !== ADMIN_PASSWORD) {
      alert("Wrong password");
      return false;
    }

    isAdmin = true;

    const adminPanel = el("adminPanel");
    const adminLoginBtn = el("adminLoginBtn");
    const loginPopup = el("loginPopup");
    const lockLoginBox = el("lockLoginBox");
    const lockScreen = el("lockScreen");

    if (adminPanel) adminPanel.classList.remove("hidden");
    if (adminLoginBtn) adminLoginBtn.style.display = "none";
    if (loginPopup) loginPopup.classList.add("hidden");
    if (lockLoginBox) lockLoginBox.classList.add("hidden");

    unlockEverything();

    if (fromLockedScreen) {
      if (lockScreen) lockScreen.classList.add("hidden");
      showAppDirectly();
    }

    return true;
  }

  function setupLogin() {
    const adminLoginBtn = el("adminLoginBtn");
    const loginPopup = el("loginPopup");
    const loginSubmitBtn = el("loginSubmitBtn");
    const passwordInput = el("passwordInput");

    if (adminLoginBtn && loginPopup && passwordInput) {
      adminLoginBtn.onclick = () => {
        loginPopup.classList.remove("hidden");
        passwordInput.value = "";
        passwordInput.focus();
      };
    }

    if (loginSubmitBtn && passwordInput) {
      loginSubmitBtn.onclick = () => {
        doAdminLogin(passwordInput.value, false);
      };
    }

    const lockAdminBtn = el("lockAdminBtn");
    const lockLoginBox = el("lockLoginBox");
    const lockPasswordInput = el("lockPasswordInput");
    const lockLoginSubmitBtn = el("lockLoginSubmitBtn");

    if (lockAdminBtn && lockLoginBox && lockPasswordInput) {
      lockAdminBtn.onclick = () => {
        lockLoginBox.classList.remove("hidden");
        lockPasswordInput.value = "";
        lockPasswordInput.focus();
      };
    }

    if (lockLoginSubmitBtn && lockPasswordInput) {
      lockLoginSubmitBtn.onclick = () => {
        doAdminLogin(lockPasswordInput.value, true);
      };
    }
  }

  function setupLogout() {
    const logoutBtn = el("logoutBtn");
    const adminPanel = el("adminPanel");
    const adminLoginBtn = el("adminLoginBtn");

    if (!logoutBtn || !adminPanel || !adminLoginBtn) return;

    logoutBtn.onclick = () => {
      isAdmin = false;
      adminPanel.classList.add("hidden");
      adminLoginBtn.style.display = "inline-block";
    };
  }

  function isLocked() {
    if (manualLock) return true;

    if (globalLockOnDate) {
      return new Date() >= new Date(globalLockOnDate);
    }

    return false;
  }

  function applyLockState() {
    const lockScreen = el("lockScreen");
    const app = el("app");
    if (!lockScreen || !app) return;

    if (isLocked()) {
      lockScreen.classList.remove("hidden");
      app.classList.add("hidden");
    } else {
      lockScreen.classList.add("hidden");
    }
  }

  function setupLockControls() {
    const lockBtn = el("lockBtn");
    const unlockBtn = el("unlockBtn");
    const setDateLockBtn = el("setDateLockBtn");
    const lockDateInput = el("lockDateInput");

    if (lockBtn) {
      lockBtn.onclick = () => {
        manualLock = true;
        localStorage.setItem("manualLock", "true");
        applyLockState();
      };
    }

    if (unlockBtn) {
      unlockBtn.onclick = () => {
        unlockEverything();
      };
    }

    if (setDateLockBtn && lockDateInput) {
      setDateLockBtn.onclick = () => {
        const selectedDate = lockDateInput.value;
        if (!selectedDate) {
          alert("Pick a date");
          return;
        }

        globalLockOnDate = selectedDate;
        localStorage.setItem("globalLockOnDate", selectedDate);
        applyLockState();
      };
    }
  }

  function rerender() {
    renderStandings();
    renderUpdateMessage();
    renderEliminatedByWeek();
    renderChart();
    populateDropdowns();
    populateWeekDropdown();
  }

  function startApp() {
    const addEliminatedBtn = el("addEliminatedBtn");
    const removeEliminatedBtn = el("removeEliminatedBtn");
    const saveUpdateBtn = el("saveUpdateBtn");
    const continueBtn = el("continueBtn");
    const leaveBtn = el("leaveBtn");
    const warningScreen = el("warningScreen");
    const app = el("app");

    setupLogin();
    setupLogout();
    setupLockControls();

    if (addEliminatedBtn) addEliminatedBtn.onclick = addEliminated;
    if (removeEliminatedBtn) removeEliminatedBtn.onclick = removeEliminated;
    if (saveUpdateBtn) saveUpdateBtn.onclick = saveUpdate;

    rerender();
    applyLockState();

    if (isLocked()) return;

    if (warningScreen) {
      warningScreen.classList.remove("hidden");
    }

    if (continueBtn && warningScreen && app) {
      continueBtn.onclick = () => {
        warningScreen.classList.add("hidden");
        app.classList.remove("hidden");
      };
    }

    if (leaveBtn) {
      leaveBtn.onclick = () => {
        document.body.innerHTML = "";
      };
    }
  }

  try {
    startApp();
  } catch (error) {
    document.body.innerHTML = `
      <div style="padding:20px;font-family:Arial,sans-serif">
        <h2>Page error</h2>
        <p>${String(error.message || error)}</p>
      </div>
    `;
  }
});