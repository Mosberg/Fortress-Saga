// Wandering merchant timing from data/merchants.json: fixed UTC spawn hours, fixed duration.
window.MerchantClock = {
  // Returns { live, start, end, next } for the given time.
  state(schedule, now = new Date()) {
    const durationMs = schedule.duration_minutes * 60000;
    const hours = [...schedule.spawn_hours_utc].sort((a, b) => a - b);
    const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    // Spawns from yesterday through tomorrow cover every window that can touch "now".
    const spawns = [-1, 0, 1].flatMap((d) => hours.map((h) => day + d * 86400000 + h * 3600000));
    const t = now.getTime();
    const current = spawns.find((s) => t >= s && t < s + durationMs);
    const next = spawns.find((s) => s > t);
    return {
      live: current !== undefined,
      start: current !== undefined ? new Date(current) : null,
      end: current !== undefined ? new Date(current + durationMs) : null,
      next: new Date(next),
    };
  },

  formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  },

  localTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  // Renders a live countdown into el and keeps it ticking.
  mount(el, schedule) {
    const tick = () => {
      const st = this.state(schedule);
      const now = Date.now();
      el.innerHTML = st.live
        ? `<div class="muted">Merchants are out now, until ${this.localTime(st.end)} your time</div>
           <div class="countdown live">${this.formatDuration(st.end - now)} left</div>`
        : `<div class="muted">Next merchants at ${this.localTime(st.next)} your time (${String(st.next.getUTCHours()).padStart(2, '0')}:00 UTC)</div>
           <div class="countdown">${this.formatDuration(st.next - now)}</div>`;
    };
    tick();
    return setInterval(tick, 1000);
  },
};
