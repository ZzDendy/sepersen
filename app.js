(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const store = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    write(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch { return false; }
    }
  };

  const todayKey = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const today = todayKey();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function buzz(ms) {
    try { if (ms && navigator.vibrate) navigator.vibrate(ms); } catch {}
  }

  let toastT;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("show"), 4000);
  }

  let revealTimers = [];
  function reveal(name) {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    const screen = document.querySelector(`[data-screen="${name}"]`);
    if (!screen) return;
    const items = screen.querySelectorAll(":scope > .hero, :scope > .card, :scope > .dark, :scope > p.sub");
    if (reduced.matches) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    items.forEach((el) => el.classList.remove("rv", "in"));
    requestAnimationFrame(() => {
      items.forEach((el, i) => {
        el.classList.add("rv");
        revealTimers.push(setTimeout(() => el.classList.add("in"), 40 + i * 60));
      });
    });
  }

  function go(name) {
    $$("nav.tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    $$("[data-screen]").forEach((s) => { s.hidden = s.dataset.screen !== name; });
    window.scrollTo({ top: 0 });
    if (name === "ringkas") paintSummary();
    reveal(name);
    const h = document.querySelector(`[data-screen="${name}"] h1`);
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  $$("nav.tabs button").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  reveal("home");

  const pad = (n) => String(n).padStart(2, "0");
  function keyOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function last7() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }
  function paintSummary() {
    const box = $("#sumWeek");
    const stats = $("#sumStats");
    const line = $("#sumLine");
    const bars = $("#sumBars");
    if (!box) return;
    const days = last7();
    const journals = store.read("sepersen-journals", []);
    const hasJ = new Set(journals.map((j) => j.date));
    const label = { segar: "Segar", tenang: "Tenang", biasa: "Biasa", lelah: "Lelah", berat: "Berat" };
    let cJ = 0, cW = 0, cB = 0, water = 0, waterDays = 0;
    const moods = {};
    box.innerHTML = "";
    if (bars) bars.innerHTML = "";
    const maxW = Math.max(1, ...days.map((d) => store.read("sepersen-water-" + keyOf(d), 0)));
    days.forEach((d) => {
      const k = keyOf(d);
      const day = store.read("sepersen-day-" + k, {});
      const w = store.read("sepersen-water-" + k, 0);
      const mood = day.mood ? (label[day.mood] || day.mood) : "-";
      const parts = [];
      if (day.win) { cW++; parts.push("win: " + day.win); }
      if (hasJ.has(k)) { cJ++; parts.push("jurnal ditulis"); }
      if (day.bengong) { cB++; parts.push("bengong"); }
      if (day.fokus) { parts.push("fokus"); }
      if (w > 0) { water += w; waterDays++; }
      if (day.mood) moods[day.mood] = (moods[day.mood] || 0) + 1;
      parts.push("air " + w + " gelas");
      parts.push("mood " + mood);
      if (bars) {
        const b = document.createElement("div");
        b.className = "bar" + (k === today ? " today" : "");
        const col = document.createElement("div");
        col.className = "col";
        const f = document.createElement("div");
        f.className = "fill";
        f.style.height = Math.round(w / maxW * 100) + "%";
        col.appendChild(f);
        const n = document.createElement("b");
        n.textContent = w;
        const dayName = document.createElement("span");
        dayName.textContent = d.toLocaleDateString("id-ID", { weekday: "short" });
        b.append(n, col, dayName);
        b.setAttribute("aria-label", dayName.textContent + " " + w + " gelas" + (k === today ? ", hari ini" : ""));
        bars.appendChild(b);
        requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transform = "scaleY(1)"; }));
      }
      const li = document.createElement("li");
      const t = document.createElement("time");
      t.textContent = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      const p = document.createElement("span");
      p.textContent = parts.join(" | ");
      li.append(t, p);
      box.appendChild(li);
    });
    const moodTop = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];
    stats.innerHTML = "";
    [cJ + " jurnal", cW + " win", cB + " bengong", (waterDays ? (water / waterDays).toFixed(1) : "0") + " rata air"].forEach((s) => {
      const el = document.createElement("span");
      el.textContent = s;
      stats.appendChild(el);
    });
    const bits = [];
    if (cJ) bits.push(cJ + " jurnal");
    if (cW) bits.push(cW + " win");
    if (cB) bits.push(cB + " bengong");
    line.textContent = bits.length
      ? "Minggu ini kamu catat " + bits.join(", ") + (moodTop ? ", mood tersering " + (label[moodTop[0]] || moodTop[0]) + "." : ".") + " Pelan pelan saja."
      : "Belum ada catatan minggu ini. Mulai dari win kecil hari ini.";
  }

  const hour = new Date().getHours();
  const part = hour < 11 ? "pagi" : hour < 15 ? "siang" : hour < 19 ? "sore" : "malam";
  $("#greet").textContent = "Selamat " + part + ", " +
    new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) + ".";

  const day = store.read("sepersen-day-" + today, {});

  const win = $("#win");
  if (day.win) { win.value = day.win; $("#winDone").hidden = false; }
  $("#winSave").addEventListener("click", () => {
    day.win = win.value.trim();
    $("#winDone").hidden = !day.win;
    toast(store.write("sepersen-day-" + today, day) ? "Win hari ini tersimpan." : "Penyimpanan diblokir, win tidak tersimpan.");
  });

  const moodBtns = $$("#moods .chip");
  moodBtns.forEach((b) => b.setAttribute("aria-pressed", String(day.mood === b.dataset.mood)));
  moodBtns.forEach((b) => b.addEventListener("click", () => {
    day.mood = b.dataset.mood;
    moodBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (store.write("sepersen-day-" + today, day)) toast("Energi dicatat: " + b.textContent + ".");
  }));

  [["mPagi", "pagi"], ["mSiang", "siang"], ["mMalam", "malam"]].forEach(([id, k]) => {
    const box = $("#" + id);
    const line = box.closest(".checkline");
    const paint = () => { if (line) line.classList.toggle("done", box.checked); };
    box.checked = !!(day.meals && day.meals[k]);
    paint();
    box.addEventListener("change", () => {
      day.meals = day.meals || {};
      day.meals[k] = box.checked;
      paint();
      store.write("sepersen-day-" + today, day);
    });
  });

  const settings = store.read("sepersen-settings", { pagi: "07:00", siang: "12:00", malam: "19:00", water: 8 });
  let waterCount = store.read("sepersen-water-" + today, 0);
  const waterN = $("#waterN");
  const waterBar = $("#waterBar");
  function paintWater(pop) {
    const pct = Math.min(1, waterCount / Number(settings.water || 8));
    waterN.textContent = waterCount;
    $("#waterT").textContent = "Target: " + settings.water + " gelas";
    if (waterBar) {
      waterBar.style.setProperty("--w", pct);
      waterBar.style.transform = "scaleX(" + pct + ")";
    }
    if (pop && !reduced.matches) {
      waterN.classList.remove("pop");
      requestAnimationFrame(() => requestAnimationFrame(() => waterN.classList.add("pop")));
    }
  }
  paintWater(false);
  $("#waterAdd").addEventListener("click", () => {
    waterCount += 1;
    if (!store.write("sepersen-water-" + today, waterCount)) toast("Penyimpanan diblokir.");
    paintWater(true);
    if (waterCount === Number(settings.water)) {
      toast("Target air hari ini tercapai. Pelan pelan saja.");
      buzz(15);
    }
  });

  function paintHist() {
    const list = store.read("sepersen-journals", []);
    const box = $("#hist");
    if (!list.length) {
      box.innerHTML = "<p class='sub'>Belum ada jurnal. Tulis yang pertama malam ini, cukup tiga kalimat.</p>";
      return;
    }
    box.innerHTML = "";
    list.slice(-7).reverse().forEach((j) => {
      const d = document.createElement("div");
      d.className = "hist";
      const t = document.createElement("time");
      t.textContent = j.date;
      d.appendChild(t);
      [j.a, j.b, j.c].forEach((p) => {
        const el = document.createElement("p");
        el.textContent = p;
        el.style.margin = "4px 0 0";
        d.appendChild(el);
      });
      box.appendChild(d);
    });
  }
  paintHist();
  $("#jSave").addEventListener("click", () => {
    const a = $("#j1").value.trim(), b = $("#j2").value.trim(), c = $("#j3").value.trim();
    if (!a && !b && !c) { toast("Isi satu kalimat dulu, yang lain boleh kosong."); return; }
    const list = store.read("sepersen-journals", []);
    list.push({ date: today, a, b, c });
    if (!store.write("sepersen-journals", list)) { toast("Penyimpanan diblokir, jurnal tidak tersimpan."); return; }
    $("#j1").value = $("#j2").value = $("#j3").value = "";
    $("#jDone").hidden = false;
    paintHist();
    toast("Jurnal tersimpan.");
    buzz(15);
  });

  [["rBangun", "rBangun"], ["rAir", "rAir"], ["rKasur", "rKasur"], ["rHp", "rHp"], ["rJurnal", "rJurnal"], ["rTidur", "rTidur"]].forEach(([id, k]) => {
    const box = $("#" + id);
    if (!box) return;
    const line = box.closest(".checkline");
    const paint = () => { if (line) line.classList.toggle("done", box.checked); };
    box.checked = !!(day.ritual && day.ritual[k]);
    paint();
    box.addEventListener("change", () => {
      day.ritual = day.ritual || {};
      day.ritual[k] = box.checked;
      paint();
      store.write("sepersen-day-" + today, day);
    });
  });

  // endAt dipakai agar timer tetap akurat saat layar sleep.
  const MODES = {
    bengong: { secs: 600, title: "Bengong 10 menit", sub: "Duduk diam, tatap tembok, tidak perlu melakukan apa pun. Timer jalan sendiri.", key: "bengong", done: "Selesai. Pelan pelan ambil HP." },
    fokus: { secs: 900, title: "Fokus 15 menit", sub: "Satu hal saja. HP diam, kerjakan sampai timer bunyi.", key: "fokus", done: "Fokus selesai. Istirahat sebentar." },
    rem: { secs: 600, title: "Rem scroll 10 menit", sub: "Niatkan buka HP 10 menit. Saat timer bunyi, berhenti dan taruh HP.", key: "rem", done: "Waktu habis. Berhenti scroll, pelan pelan taruh HP." }
  };
  let mode = "bengong";
  let TOTAL = MODES.bengong.secs;
  let left = TOTAL, tick = null, endAt = 0;
  const dark = document.querySelector('[data-screen="bengong"] .dark');
  const show = $("#tShow"), bS = $("#tStart"), bP = $("#tPause"), bE = $("#tEnd"), msg = $("#tMsg");
  const fmt = (s) => String(Math.floor(s / 60)) + ":" + String(s % 60).padStart(2, "0");
  function setMode(next, resetLeft) {
    mode = MODES[next] ? next : "bengong";
    TOTAL = MODES[mode].secs;
    if (resetLeft !== false) left = TOTAL;
    $$("#tSeg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === mode)));
    const title = $("#tTitle");
    if (title) title.textContent = MODES[mode].title;
    const sub = $("#tSub");
    if (sub) sub.textContent = MODES[mode].sub;
    draw();
  }
  $$("#tSeg button").forEach((b) => b.addEventListener("click", () => {
    if (tick) return;
    stopTick();
    setMode(b.dataset.t, true);
    bS.textContent = "Mulai";
    bS.hidden = false; bP.hidden = true; bE.hidden = true;
    msg.textContent = "";
  }));
  document.querySelectorAll('[data-go="fokus"]').forEach((b) => b.addEventListener("click", () => setMode("fokus", true)));

  function draw() { show.textContent = fmt(left); }
  function stopTick() {
    clearInterval(tick); tick = null;
    if (dark) dark.classList.remove("run");
  }
  function finish(early) {
    stopTick();
    const d = store.read("sepersen-day-" + today, {});
    d[MODES[mode].key] = true;
    store.write("sepersen-day-" + today, d);
    msg.textContent = early ? "Berhenti di tengah tidak apa apa. Besok coba lagi." : MODES[mode].done;
    bS.hidden = false; bP.hidden = true; bE.hidden = true;
    left = TOTAL; draw();
    if (!early) buzz(15);
  }
  bS.addEventListener("click", () => {
    endAt = Date.now() + left * 1000;
    msg.textContent = mode === "bengong" ? "Tidak perlu melakukan apa pun." : "Timer jalan. Pelan pelan saja.";
    bS.hidden = true; bP.hidden = false; bE.hidden = false;
    stopTick();
    if (dark) dark.classList.add("run");
    tick = setInterval(() => {
      left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      draw();
      if (left <= 0) finish(false);
    }, 250);
  });
  bP.addEventListener("click", () => {
    stopTick();
    left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    draw();
    msg.textContent = "Dijeda. Lanjutkan saat siap.";
    bS.hidden = false; bP.hidden = true;
    bS.textContent = "Lanjut";
  });
  bE.addEventListener("click", () => finish(true));
  setMode("bengong", true);
  bS.textContent = "Mulai bengong";

  $("#sPagi").value = settings.pagi; $("#sSiang").value = settings.siang;
  $("#sMalam").value = settings.malam; $("#sWater").value = settings.water;
  $("#sSave").addEventListener("click", () => {
    Object.assign(settings, { pagi: $("#sPagi").value, siang: $("#sSiang").value, malam: $("#sMalam").value, water: Number($("#sWater").value) || 8 });
    if (store.write("sepersen-settings", settings)) { paintWater(false); toast("Pengaturan tersimpan."); }
    else toast("Penyimpanan diblokir.");
  });

  const nState = $("#notifState");
  function paintNotif() {
    nState.textContent = Notification.permission === "granted"
      ? "Pengingat nyala. Bunyi saat Sepersen terbuka di HP."
      : "Pengingat mati. Nyalakan agar HP mengingatkan di jam makan.";
  }
  if ("Notification" in window) paintNotif();
  else nState.textContent = "Browser ini tidak mendukung pengingat.";
  $("#notif").addEventListener("click", async () => {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
    paintNotif();
  });

  // Pengingat hanya bunyi saat aplikasi terbuka, jadi cek tiap 30 detik.
  const said = store.read("sepersen-said-" + today, {});
  function check() {
    const now = new Date();
    const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const meals = [["pagi", settings.pagi, "Waktunya sarapan. Makan pelan pelan."], ["siang", settings.siang, "Waktunya makan siang."], ["malam", settings.malam, "Waktunya makan malam."] ];
    meals.forEach(([k, at, text]) => {
      if (hm === at && !said[k]) {
        said[k] = true;
        store.write("sepersen-said-" + today, said);
        toast(text);
        if (Notification.permission === "granted" && document.hidden) new Notification("Sepersen", { body: text });
      }
    });
  }
  setInterval(check, 30000);
  check();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
