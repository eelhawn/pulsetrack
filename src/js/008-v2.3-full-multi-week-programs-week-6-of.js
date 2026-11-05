
    /* =====================================================================
     * PulseTrack 2.3 — full multi-week programs (Week 6 of 12), week headers,
     * jump to week, rest days that never block "Up next".
     * ===================================================================== */
    ApplicationUI.prototype._daysWeekRowV2 = ApplicationUI.prototype.renderDaysWeekRow;

    Object.assign(ApplicationUI.prototype, {
      /** Week number of a day in a week-by-week program ("week" field, or a title starting "Week 6"). */
      dayWeek(prog, day) {
        if (!day) return 0;
        const w = parseInt(day.week, 10);
        if (w > 0) return w;
        const m = String(day.title || "").match(/^\s*Week\s+(\d+)\b/i);
        return m ? parseInt(m[1], 10) : 0;
      },
      /** Number of weeks when every day belongs to a week (e.g. 12), else 0. */
      progWeeks(prog) {
        const days = (prog && prog.days) || [];
        if (days.length < 8 || (prog && prog.id === FREESTYLE_ID)) return 0;
        if (prog._wk && prog._wk.n === days.length) return prog._wk.w;
        let max = 0;
        for (const d of days) { const w = this.dayWeek(prog, d); if (!w) { max = 0; break; } if (w > max) max = w; }
        const res = max > 1 ? max : 0;
        Object.defineProperty(prog, "_wk", { value: { n: days.length, w: res }, configurable: true, enumerable: false, writable: true });
        return res;
      },
      shortDayTitle(prog, day) {
        if (!day) return "";
        const t = day.title || ("Day " + day.dayNumber);
        return this.progWeeks(prog) ? t.replace(/^\s*Week\s+\d+\s*[·:,\-–]\s*/i, "") : t;
      },
      weekBadge(prog, day) {
        if (!prog || !day) return "";
        if (prog.id === FREESTYLE_ID) return "Freestyle";
        const W = this.progWeeks(prog), w = W ? this.dayWeek(prog, day) : 0;
        if (w) return `Week ${w} of ${W} · Day ${day.dayNumber}`;
        return `Week ${this.getProgState(prog).week} · Day ${day.dayNumber || "?"}`;
      },
      upNextText(prog, day) {
        if (!day) return "";
        const W = this.progWeeks(prog), w = W ? this.dayWeek(prog, day) : 0;
        return `Up next: ${w ? `Week ${w} of ${W}` : `Week ${this.getProgState(prog).week}`} · ${this.shortDayTitle(prog, day)}`;
      },

      /* ------------------------------------------- progression with rest days */
      isRestDay(day) { return !day || !(day.exercises || []).length; },
      nextDayOf(prog) {
        const days = (prog && prog.days) || [];
        if (!days.length) return null;
        const st = this.getProgState(prog);
        return days.find(d => !st.done.includes(d.dayNumber) && !this.isRestDay(d))
          || days.find(d => !st.done.includes(d.dayNumber))
          || days.find(d => !this.isRestDay(d)) || days[0];
      },
      markDayDone(prog, dayNumber) {
        if (!prog || prog.id === FREESTYLE_ID) return;
        const st = this.getProgState(prog);
        const days = prog.days || [];
        if (!st.done.includes(dayNumber)) st.done.push(dayNumber);
        // Rest days before this one have been taken
        const idx = days.findIndex(d => d.dayNumber === dayNumber);
        days.slice(0, Math.max(0, idx)).forEach(d => { if (this.isRestDay(d) && !st.done.includes(d.dayNumber)) st.done.push(d.dayNumber); });
        const work = days.filter(d => !this.isRestDay(d)).map(d => d.dayNumber);
        const need = work.length ? work : days.map(d => d.dayNumber);
        if (need.length && need.every(n => st.done.includes(n))) { st.week += 1; st.done = []; }
        this.saveProgState();
      },
      jumpToWeek(prog, week) {
        const st = this.getProgState(prog);
        st.done = (prog.days || []).filter(d => this.dayWeek(prog, d) < week).map(d => d.dayNumber);
        this.saveProgState();
        this.activeProgram = prog;
        this.activeDay = this.nextDayOf(prog);
        if (this.activeDay) AppStateMemory.saveActive(prog.id, this.activeDay.dayNumber);
        this.updateDrawerStatus();
      },
      renderDaysWeekRow() {
        const prog = this.activeProgram;
        const W = this.progWeeks(prog);
        if (!W) return this._daysWeekRowV2.call(this);
        const row = document.getElementById("days-week-row");
        if (!row) return;
        row.classList.remove("hidden");
        const st = this.getProgState(prog);
        const next = this.nextDayOf(prog);
        const cur = this.dayWeek(prog, next) || 1;
        const work = (prog.days || []).filter(d => !this.isRestDay(d));
        const doneW = work.filter(d => st.done.includes(d.dayNumber)).length;
        row.innerHTML = `
          <div class="text-xs text-zinc-400 min-w-0"><span class="font-black text-white">Week ${cur} of ${W}</span> · ${doneW}/${work.length} workouts done${st.week > 1 ? ` · round ${st.week}` : ""}</div>
          <button id="btn-set-week" class="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 tap-active">Jump to week</button>`;
        document.getElementById("btn-set-week").addEventListener("click", async () => {
          const v = parseInt(await PT.prompt(`Jump to which week (1–${W})? Earlier weeks will be marked as done.`, cur), 10);
          if (!(v >= 1 && v <= W)) return;
          this.jumpToWeek(prog, v);
          this.renderDaysView();
          this.toast(`Jumped to week ${v}`);
        });
      },
      /** Called after the day cards are drawn: week headers, slimmer rest days, scroll to "Up next". */
      decorateDaysList() {
        const prog = this.activeProgram;
        const W = this.progWeeks(prog);
        const list = this.dom.daysList;
        if (!W || !list) return;
        const next = this.nextDayOf(prog);
        let last = 0;
        [...list.children].forEach(card => {
          const dn = parseInt(card.dataset.day, 10);
          const day = (prog.days || []).find(d => d.dayNumber === dn);
          if (!day) return;
          const w = this.dayWeek(prog, day);
          if (w !== last) {
            last = w;
            const hd = document.createElement("div");
            hd.className = "pt-3 pb-0.5 px-1 flex items-baseline justify-between";
            hd.dataset.weekHeader = w;
            const days = (prog.days || []).filter(d => this.dayWeek(prog, d) === w);
            const st = this.getProgState(prog);
            const done = days.filter(d => !this.isRestDay(d) && st.done.includes(d.dayNumber)).length;
            const total = days.filter(d => !this.isRestDay(d)).length;
            hd.innerHTML = `<span class="text-xs font-black uppercase tracking-widest ${w === this.dayWeek(prog, next) ? "text-emerald-400" : "text-zinc-400"}">Week ${w}</span><span class="text-[10px] text-zinc-500 font-mono">${done}/${total} done</span>`;
            list.insertBefore(hd, card);
          }
          if (this.isRestDay(day)) {
            card.className = "bg-zinc-900/50 border border-zinc-800/70 rounded-xl px-4 py-2.5 tap-active cursor-pointer flex items-center justify-between";
            const sub = card.querySelector(".text-xs.text-zinc-400");
            if (sub) sub.remove();
            const lab = card.querySelector(".uppercase");
            if (lab) lab.remove();
            const h4 = card.querySelector("h4");
            if (h4) h4.className = "text-xs font-semibold text-zinc-400";
          }
        });
        const el = next && list.querySelector(`[data-day="${next.dayNumber}"]`);
        if (el && el.scrollIntoView) requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
      }
    });
  