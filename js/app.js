(function () {
  const { el } = UI;

  function currentDay() {
    return el.daySelect.value;
  }

  function loadDayForm() {
    const day = currentDay();
    Store.setLastDay(day);
    UI.renderDayNote(day);
    UI.renderExerciseForm(day);
  }

  function init() {
    UI.populateDaySelect();
    UI.populateExerciseSelect();

    // Restore sticky day + date selection
    const lastDay = Store.getLastDay();
    el.daySelect.value = lastDay && DAY_ORDER.includes(lastDay) ? lastDay : DAY_ORDER[0];
    el.dateInput.value = Store.getLastDate();
    UI.updateDateDisplay();

    loadDayForm();

    el.daySelect.addEventListener("change", loadDayForm);
    el.dateInput.addEventListener("change", () => {
      Store.setLastDate(el.dateInput.value);
      UI.updateDateDisplay();
    });

    el.logForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const day = currentDay();
      const date = el.dateInput.value || Store.todayISO();
      const exercises = UI.collectFormData();

      Store.setLastDay(day);
      Store.setLastDate(date);
      Store.addSession({ day, date, exercises });

      UI.showToast("Saved ✓");
      Sync.pushUnsynced().then(() => UI.setSyncStatus(navigator.onLine ? "synced" : "offline"));
    });

    document.querySelectorAll(".tabbar__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.nav;
        UI.switchView(target);
        if (target === "history") UI.renderSessionList();
      });
    });

    document.querySelectorAll(".history-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".history-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        const mode = tab.dataset.mode;
        document.getElementById("historyByDate").classList.toggle("history-panel--hidden", mode !== "date");
        document.getElementById("historyByExercise").classList.toggle("history-panel--hidden", mode !== "exercise");
        if (mode === "date") UI.renderSessionList();
        else UI.renderExerciseHistory(el.exerciseSelect.value);
      });
    });

    el.exerciseSelect.addEventListener("change", () => {
      UI.renderExerciseHistory(el.exerciseSelect.value);
    });

    UI.setSyncStatus(Sync.enabled() ? (navigator.onLine ? "syncing" : "offline") : "idle");
    Sync.onStatusChange((status) => UI.setSyncStatus(status));
    Sync.init().then(() => {
      loadDayForm(); // reflect any pulled remote data for the current day
    });

    window.addEventListener("online", () => UI.setSyncStatus("syncing"));
    window.addEventListener("offline", () => UI.setSyncStatus("offline"));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW registration failed:", err));
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
