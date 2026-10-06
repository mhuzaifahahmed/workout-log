// localStorage persistence layer. Single source of truth for session data on-device.

const KEYS = {
  sessions: "workoutlog.sessions",
  lastDay: "workoutlog.lastDay",
  lastDate: "workoutlog.lastDate",
};

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

const Store = {
  getSessions() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.sessions)) || [];
    } catch {
      return [];
    }
  },

  saveSessions(sessions) {
    localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
  },

  addSession({ day, date, exercises }) {
    const sessions = this.getSessions();
    const session = {
      id: uuid(),
      day,
      performedAt: new Date(`${date}T12:00:00`).toISOString(),
      date,
      exercises,
      synced: false,
      createdAt: new Date().toISOString(),
    };
    sessions.push(session);
    this.saveSessions(sessions);
    return session;
  },

  markSynced(ids) {
    const sessions = this.getSessions();
    const idSet = new Set(ids);
    for (const s of sessions) {
      if (idSet.has(s.id)) s.synced = true;
    }
    this.saveSessions(sessions);
  },

  getUnsynced() {
    return this.getSessions().filter((s) => !s.synced);
  },

  mergeRemote(remoteSessions) {
    const local = this.getSessions();
    const byId = new Map(local.map((s) => [s.id, s]));
    for (const r of remoteSessions) {
      if (!byId.has(r.id)) {
        byId.set(r.id, { ...r, synced: true });
      }
    }
    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(a.performedAt) - new Date(b.performedAt)
    );
    this.saveSessions(merged);
  },

  getLastSessionForDay(day) {
    const sessions = this.getSessions()
      .filter((s) => s.day === day)
      .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
    return sessions[0] || null;
  },

  getSessionsForExercise(exerciseName) {
    return this.getSessions()
      .filter((s) => s.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => new Date(a.performedAt) - new Date(b.performedAt));
  },

  getLastDay() {
    return localStorage.getItem(KEYS.lastDay) || null;
  },

  setLastDay(day) {
    localStorage.setItem(KEYS.lastDay, day);
  },

  getLastDate() {
    return localStorage.getItem(KEYS.lastDate) || todayISO();
  },

  setLastDate(date) {
    localStorage.setItem(KEYS.lastDate, date);
  },

  todayISO,
};
