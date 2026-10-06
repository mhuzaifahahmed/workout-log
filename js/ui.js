// Rendering + motion. All animation restricted to transform/opacity for guaranteed 60fps.

const UI = (() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = {
    daySelect: document.getElementById("daySelect"),
    dateInput: document.getElementById("dateInput"),
    dateDisplay: document.getElementById("dateDisplay"),
    dayNote: document.getElementById("dayNote"),
    exerciseList: document.getElementById("exerciseList"),
    logForm: document.getElementById("logForm"),
    saveBtn: document.getElementById("saveBtn"),
    syncDot: document.getElementById("syncDot"),
    toast: document.getElementById("toast"),
    logView: document.getElementById("logView"),
    historyView: document.getElementById("historyView"),
    sessionList: document.getElementById("sessionList"),
    exerciseSelect: document.getElementById("exerciseSelect"),
    exerciseHistoryList: document.getElementById("exerciseHistoryList"),
    progressChart: document.getElementById("progressChart"),
  };

  function populateDaySelect() {
    el.daySelect.innerHTML = DAY_ORDER.map((d) => `<option value="${d}">${d}</option>`).join("");
  }

  function populateExerciseSelect() {
    const names = [];
    const seen = new Set();
    for (const day of DAY_ORDER) {
      for (const ex of PLAN[day].exercises) {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          names.push(ex.name);
        }
      }
    }
    el.exerciseSelect.innerHTML = names.map((n) => `<option value="${n}">${n}</option>`).join("");
  }

  function renderDayNote(day) {
    const subtitle = PLAN[day].subtitle;
    el.dayNote.textContent = subtitle || "";
  }

  function renderExerciseForm(day) {
    const plan = PLAN[day];
    const lastSession = Store.getLastSessionForDay(day);
    const lastByName = new Map();
    if (lastSession) {
      for (const ex of lastSession.exercises) lastByName.set(ex.name, ex.sets);
    }

    el.exerciseList.innerHTML = "";
    const cards = [];

    plan.exercises.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.dataset.exercise = ex.name;

      const prevSets = lastByName.get(ex.name) || [];

      let rowsHtml = "";
      for (let i = 0; i < ex.sets; i++) {
        const prev = prevSets[i];
        const weightVal = prev && prev.weight != null ? prev.weight : "";
        rowsHtml += `
          <div class="set-row">
            <span class="set-row__label">${i + 1}</span>
            <input type="number" inputmode="decimal" step="0.5" min="0"
              class="weight-input" placeholder="kg" value="${weightVal}" />
            <input type="number" inputmode="numeric" step="1" min="0"
              class="reps-input" placeholder="${ex.repTarget}" />
          </div>`;
      }

      card.innerHTML = `
        <div class="exercise-card__header">
          <span class="exercise-card__name">${ex.name}</span>
          <span class="exercise-card__target">${ex.repTarget}</span>
        </div>
        <div class="exercise-card__note">${ex.note || ""}</div>
        <div class="set-rows">${rowsHtml}</div>
      `;
      el.exerciseList.appendChild(card);
      cards.push(card);
    });

    if (!reduceMotion && window.gsap) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", stagger: 0.045 }
      );
    }
  }

  function collectFormData() {
    const cards = el.exerciseList.querySelectorAll(".exercise-card");
    const exercises = [];
    cards.forEach((card) => {
      const name = card.dataset.exercise;
      const rows = card.querySelectorAll(".set-row");
      const sets = [];
      rows.forEach((row) => {
        const weight = row.querySelector(".weight-input").value;
        const reps = row.querySelector(".reps-input").value;
        sets.push({
          weight: weight === "" ? null : parseFloat(weight),
          reps: reps === "" ? null : parseInt(reps, 10),
        });
      });
      exercises.push({ name, sets });
    });
    return exercises;
  }

  function showToast(msg) {
    el.toast.textContent = msg;
    if (reduceMotion || !window.gsap) {
      el.toast.style.opacity = 1;
      setTimeout(() => (el.toast.style.opacity = 0), 1600);
      return;
    }
    gsap.timeline()
      .set(el.toast, { y: 20, opacity: 0 })
      .to(el.toast, { y: 0, opacity: 1, duration: 0.28, ease: "back.out(1.7)" })
      .to(el.toast, { opacity: 0, y: 10, duration: 0.25, ease: "power1.in", delay: 1.2 });
  }

  function setSyncStatus(status) {
    el.syncDot.dataset.status = status;
  }

  function switchView(name) {
    const showingLog = name === "log";
    const incoming = showingLog ? el.logView : el.historyView;
    const outgoing = showingLog ? el.historyView : el.logView;

    document.querySelectorAll(".tabbar__btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.nav === name);
    });

    if (reduceMotion || !window.gsap) {
      outgoing.classList.add("view--hidden");
      incoming.classList.remove("view--hidden");
      return;
    }

    gsap.to(outgoing, {
      opacity: 0,
      x: showingLog ? 16 : -16,
      duration: 0.16,
      ease: "power1.in",
      onComplete: () => {
        outgoing.classList.add("view--hidden");
        incoming.classList.remove("view--hidden");
        gsap.fromTo(
          incoming,
          { opacity: 0, x: showingLog ? -16 : 16 },
          { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }
        );
      },
    });
  }

  function formatDate(iso) {
    // dd/mm/yyyy, derived from calendar fields directly (no Date() parsing, no timezone drift)
    const datePart = iso.slice(0, 10); // "yyyy-mm-dd" whether iso has a time component or not
    const [y, m, d] = datePart.split("-");
    return `${d}/${m}/${y}`;
  }

  function updateDateDisplay() {
    const val = el.dateInput.value; // native value is always "yyyy-mm-dd"
    el.dateDisplay.textContent = val ? formatDate(val) : "";
  }

  function renderSessionList() {
    const sessions = Store.getSessions().sort(
      (a, b) => new Date(b.performedAt) - new Date(a.performedAt)
    );
    if (sessions.length === 0) {
      el.sessionList.innerHTML = `<div class="empty-state">No sessions logged yet.</div>`;
      return;
    }
    el.sessionList.innerHTML = "";
    const cards = [];
    for (const s of sessions) {
      const card = document.createElement("div");
      card.className = "session-card";
      const exLines = s.exercises
        .map((ex) => {
          const sets = ex.sets
            .filter((st) => st.weight != null || st.reps != null)
            .map((st) => `${st.weight ?? "-"}×${st.reps ?? "-"}`)
            .join(", ");
          return `<div class="session-card__ex"><span class="session-card__ex-name">${ex.name}</span><span>${sets || "—"}</span></div>`;
        })
        .join("");
      card.innerHTML = `
        <div class="session-card__top">
          <span class="session-card__day">${s.day}</span>
          <span class="session-card__date">${formatDate(s.performedAt)}</span>
        </div>
        ${exLines}
        <div class="sync-pill">${s.synced ? "✓ synced" : "pending sync"}</div>
      `;
      el.sessionList.appendChild(card);
      cards.push(card);
    }
    if (!reduceMotion && window.gsap) {
      gsap.fromTo(cards, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" });
    }
  }

  function renderExerciseHistory(name) {
    const sessions = Store.getSessionsForExercise(name);
    const points = sessions.map((s) => {
      const ex = s.exercises.find((e) => e.name === name);
      const topWeight = Math.max(0, ...ex.sets.map((st) => st.weight || 0));
      return { date: s.performedAt, topWeight, sets: ex.sets };
    });

    drawChart(points);

    if (points.length === 0) {
      el.exerciseHistoryList.innerHTML = `<div class="empty-state">No history for this exercise yet.</div>`;
      return;
    }
    el.exerciseHistoryList.innerHTML = points
      .slice()
      .reverse()
      .map((p) => {
        const setsStr = p.sets.map((s) => `${s.weight ?? "-"}×${s.reps ?? "-"}`).join(", ");
        return `<div class="exercise-history-row"><span class="exercise-history-row__date">${formatDate(p.date)}</span><span>${setsStr}</span></div>`;
      })
      .join("");
  }

  function drawChart(points) {
    const canvas = el.progressChart;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (points.length === 0) {
      ctx.fillStyle = "#686e7a";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data yet", w / 2, h / 2);
      return;
    }

    const pad = 30;
    const weights = points.map((p) => p.topWeight);
    const max = Math.max(...weights, 1);
    const min = Math.min(...weights, 0);
    const range = max - min || 1;

    const xStep = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
    const coords = points.map((p, i) => ({
      x: pad + i * xStep,
      y: h - pad - ((p.topWeight - min) / range) * (h - pad * 2),
    }));

    ctx.strokeStyle = "#2a2e37";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    ctx.strokeStyle = "#63b38a";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    coords.forEach((c, i) => (i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
    ctx.stroke();

    ctx.fillStyle = "#63b38a";
    coords.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#9aa0ab";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${max}kg`, 4, pad - 6);
    ctx.fillText(`${min}kg`, 4, h - pad + 14);
  }

  return {
    el,
    populateDaySelect,
    populateExerciseSelect,
    renderDayNote,
    renderExerciseForm,
    collectFormData,
    showToast,
    setSyncStatus,
    switchView,
    renderSessionList,
    renderExerciseHistory,
    updateDateDisplay,
  };
})();
