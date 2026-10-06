// Background sync to Supabase. Never blocks the save path — fire-and-forget.
// Offline-first: localStorage is always correct first; this just backs it up to the cloud.

const Sync = (() => {
  let client = null;
  let syncing = false;
  const listeners = new Set();

  function enabled() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  function getClient() {
    if (!enabled()) return null;
    if (!client) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return client;
  }

  function onStatusChange(fn) {
    listeners.add(fn);
  }

  function emit(status) {
    for (const fn of listeners) fn(status);
  }

  async function pushUnsynced() {
    if (!enabled() || syncing) return;
    const unsynced = Store.getUnsynced();
    if (unsynced.length === 0) return;
    syncing = true;
    emit("syncing");
    try {
      const sb = getClient();
      const rows = unsynced.map((s) => ({
        id: s.id,
        day: s.day,
        performed_at: s.performedAt,
        exercises: s.exercises,
      }));
      const { error } = await sb.from("sessions").upsert(rows, { onConflict: "id" });
      if (error) throw error;
      Store.markSynced(unsynced.map((s) => s.id));
      emit("synced");
    } catch (err) {
      console.warn("Sync push failed (will retry later):", err.message || err);
      emit("error");
    } finally {
      syncing = false;
    }
  }

  async function pullRemote() {
    if (!enabled()) return;
    try {
      const sb = getClient();
      const { data, error } = await sb.from("sessions").select("*");
      if (error) throw error;
      const remote = (data || []).map((r) => ({
        id: r.id,
        day: r.day,
        performedAt: r.performed_at,
        date: r.performed_at.slice(0, 10),
        exercises: r.exercises,
        createdAt: r.created_at,
      }));
      Store.mergeRemote(remote);
      emit("pulled");
    } catch (err) {
      console.warn("Sync pull failed:", err.message || err);
    }
  }

  async function init() {
    if (!enabled()) return;
    await pullRemote();
    await pushUnsynced();
  }

  window.addEventListener("online", () => pushUnsynced());

  return { enabled, pushUnsynced, pullRemote, init, onStatusChange };
})();
