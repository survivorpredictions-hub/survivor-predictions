document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PASSWORD = "Predictions6552";

  const safePlayers = typeof players !== "undefined" && Array.isArray(players) ? players : [];
  const safeAllCastaways =
    typeof allCastaways !== "undefined" && Array.isArray(allCastaways) ? allCastaways : [];
  const safeEliminatedByWeek =
    typeof eliminatedByWeek !== "undefined" && Array.isArray(eliminatedByWeek)
      ? eliminatedByWeek
      : [];
  let safeUpdateMessage =
    typeof updateMessage !== "undefined" && typeof updateMessage === "string"
      ? updateMessage
      : "Standings updated.";

  let isAdmin = false;
  let manualLock = localStorage.getItem("manualLock") === "true";
  let globalLockOnDate = localStorage.getItem("globalLockOnDate") || null;
  let winnerChartInstance = null;

  function el(id) {
    return document.getElementById(id);
  }

  function getEliminatedList() {
    return safeEliminatedByWeek.flatMap((week) =>
      Array.isArray(week.players) ? week.players : []
    );
  }

  function isEliminated(name) {
    return getEliminatedList().includes(name);
  }

  function calculateScore(player) {
    const picks = Array.isArray(player.picks) ? player.picks : [];
    let score = 3;

    picks.forEach((pick) => {
      if (isEliminated(pick)) score -= 1;
    });

    return Math.max(score, 0);
  }

  function getSortedPlayers() {
    return [...safePlayers].sort((a, b) => {
      const diff = calculateScore(b) - calculateScore(a);
      if (diff !== 0) return diff;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }

  function formatPick(pick) {
    return isEliminated(pick)
      ? `<span class="eliminated-name">${pick}</span>`
      : String(pick || "");
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

      const picks = Array.isArray(player.picks) ? player.picks : [];

      body.innerHTML += `
        <tr>
          <td>${displayedRank}</td>
          <td>${String(player.name || "")}</td>
          <td>${picks.map(formatPick).join(", ")}</td>
          <td>${formatPick(player.winnerPick)}</td>
          <td>${score}</td>
        </tr>
      `;

      previousScore = score;
    });
  }

  function renderUpdateMessage() {
    const topMessage = el("updateMessage");
    if (topMessage) topMessage.textContent = safeUpdateMessage;

    const input = el("updateInput");
    if (input) input.value = safeUpdateMessage;
  }

  function renderEliminatedByWeek() {
    const container = el("eliminatedByWeek");
    if (!container) return;

    container.innerHTML = "";

    const weeks = [...safeEliminatedByWeek].sort((a, b) => a.week - b.week);

    weeks.forEach((week) => {
      const playersForWeek = Array.isArray(week.players) ? week.players : [];
      container.innerHTML += `
        <div class="week-block">
          <strong>Week ${week.week}:</strong> ${
            playersForWeek.length ? playersForWeek.join(", ") : "None"
          }
        </div>
      `;
    });
  }

  function renderChart() {
    const canvas = el("winnerChart");
    if (!canvas) return;
    if (typeof Chart === "undefined") return;

    const counts = {};

    safePlayers.forEach((player) => {
      const winner = String(player.winnerPick || "");
      if (!winner) return;
      counts[winner] = (counts[winner] || 0) + 1;
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

    safeAllCastaways.forEach((name) => {
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
    } else if (safeEliminatedByWeek.length > 0) {
      const latestWeek = Math.max(...safeEliminatedByWeek.map((w) => w.week));
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

    let weekObject = safeEliminatedByWeek.find((week) => week.week === selectedWeek);

    if (!weekObject) {
      weekObject = { week: selectedWeek, players: [] };
      safeEliminatedByWeek.push(weekObject);
    }

    if (!weekObject.players.includes(playerName)) {
      weekObject.players.push(playerName);
    }

    safeEliminatedByWeek.sort((a, b) => a.week - b.week);
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

    safeEliminatedByWeek.forEach((week) => {
      week.players = week.players.filter((player) => player !== playerName);
    });

    rerender();
  }

  function saveUpdate() {
    const input = el("updateInput");
    if (!input) return;

    safeUpdateMessage = input.value || "";
    renderUpdateMessage();
  }

  function setupLogin() {
    const adminLoginBtn = el("adminLoginBtn");
    const loginPopup = el("loginPopup");
    const loginSubmitBtn = el("loginSubmitBtn");
    const passwordInput = el("passwordInput");
    const adminPanel = el("adminPanel");

    if (!adminLoginBtn || !loginPopup || !loginSubmitBtn || !passwordInput || !adminPanel) {
      return;
    }

    adminLoginBtn.onclick = () => {
      loginPopup.classList.remove("hidden");
      passwordInput.value = "";
      passwordInput.focus();
    };

    loginSubmitBtn.onclick = () => {
      if (passwordInput.value === ADMIN_PASSWORD) {
        isAdmin = true;
        loginPopup.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        adminLoginBtn.style.display = "none";
      } else {
        alert("Wrong password");
      }
    };
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
        manualLock = false;
        globalLockOnDate = null;
        localStorage.removeItem("manualLock");
        localStorage.removeItem("globalLockOnDate");
        if (lockDateInput) lockDateInput.value = "";
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