/* Roi Ben Yaacov, portfolio
   Three jobs: the header takes the ink of the chapter under it, each section's
   parts arrive in order, and the settlement line computes for real. */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. entrances ---------- */
  const groups = new Map();
  document.querySelectorAll('.reveal').forEach((el) => {
    const section = el.closest('section, footer') || document.body;
    if (!groups.has(section)) groups.set(section, []);
    const list = groups.get(section);
    el.style.setProperty('--d', `${Math.min(list.length, 6) * 80}ms`);
    list.push(el);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  /* a looping clip is still motion: hold it on the poster frame when motion is off */
  if (reduced) {
    document.querySelectorAll('video[autoplay]').forEach((v) => {
      v.autoplay = false;
      v.removeAttribute('autoplay');
      v.pause();
      v.controls = true;
    });
  }

  /* ---------- 2. the header takes the chapter's ink ---------- */
  const topbar = document.getElementById('topbar');
  const fields = {
    hero: ['#ffffff', '#11163a'],
    bone: ['#15172b', '#eeedea'],
    pk: ['#ffffff', '#1a237e'],
    sh: ['#101a24', '#c6d1dc'],
    rc: ['#f4f0e4', '#12100a'],
    gold: ['#1c1708', '#c9a227'],
  };
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const setInk = () => {
    const y = window.scrollY + 44;
    let current = chapters[0];
    for (const c of chapters) if (c.offsetTop <= y) current = c;
    const [ink, bg] = fields[current.dataset.chapter] || fields.hero;
    topbar.style.setProperty('--topbar-ink', ink);
    topbar.style.setProperty('--topbar-bg', bg);
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setInk(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  setInk();

  /* ---------- 3. the live thing: settle a night ---------- */
  const sheet = document.getElementById('settle-players');
  const out = document.getElementById('settle-out');
  if (!sheet || !out) return;

  const num = (el) => {
    const m = String(el.value).match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : null;
  };

  const read = () =>
    [...sheet.querySelectorAll('.prow')].map((row) => {
      const name = row.querySelector('.p-name').value.trim();
      const bought = num(row.querySelector('.p-in'));
      const left = num(row.querySelector('.p-out'));
      if (!name || bought === null || left === null) return null;
      return { name, net: Math.round(left - bought) };
    }).filter(Boolean);

  /* The same greedy settlement the app runs: biggest debtor pays the biggest
     winner until one of them is clear. For n players it never needs more than
     n-1 payments, which is the shortest list anyone can produce by hand. */
  const settle = (players) => {
    const owe = players.filter((p) => p.net < 0).map((p) => ({ ...p })).sort((a, b) => a.net - b.net);
    const win = players.filter((p) => p.net > 0).map((p) => ({ ...p })).sort((a, b) => b.net - a.net);
    const payments = [];
    let i = 0;
    let j = 0;
    while (i < owe.length && j < win.length) {
      const amount = Math.min(-owe[i].net, win[j].net);
      if (amount > 0) payments.push({ from: owe[i].name, to: win[j].name, amount });
      owe[i].net += amount;
      win[j].net -= amount;
      if (owe[i].net === 0) i += 1;
      if (win[j].net === 0) j += 1;
    }
    return payments;
  };

  const shekel = (n) => '₪' + n.toLocaleString('en-US');

  const render = () => {
    const players = read();
    if (players.length < 2) {
      out.innerHTML = '<p class="settle-note">Two players at least, each with a name and both figures.</p>';
      return;
    }
    const off = players.reduce((sum, p) => sum + p.net, 0);
    const payments = settle(players);
    const rows = payments
      .map((p) => `<li><span class="who">${p.from} pays ${p.to}</span><span class="amt">${shekel(p.amount)}</span></li>`)
      .join('');
    const note = off !== 0
      ? `The table is off by ${shekel(Math.abs(off))}. Someone's buy-in or cash-out is wrong.`
      : payments.length === 0
        ? 'Everybody left with what they came with. Nothing to settle.'
        : `${players.length} players, ${payments.length} payment${payments.length === 1 ? '' : 's'}.`;
    out.innerHTML = `<ol class="settle-rows">${rows}</ol><p class="settle-note">${note}</p>`;
  };

  const relabel = () => {
    [...sheet.querySelectorAll('.prow')].forEach((row, i) => {
      const who = row.querySelector('.p-name').value.trim() || `player ${i + 1}`;
      row.querySelector('.p-name').setAttribute('aria-label', `Player ${i + 1} name`);
      row.querySelector('.p-in').setAttribute('aria-label', `What ${who} bought in for`);
      row.querySelector('.p-out').setAttribute('aria-label', `What ${who} left with`);
      row.querySelector('.p-del').setAttribute('aria-label', `Remove ${who}`);
    });
  };

  const addRow = (name = '', bought = '', left = '') => {
    const row = document.createElement('div');
    row.className = 'prow';
    row.innerHTML =
      '<input class="p-name" type="text" autocomplete="off" spellcheck="false" placeholder="Name">' +
      '<label class="p-money"><span class="cap" aria-hidden="true">Bought in</span><span class="shek" aria-hidden="true">₪</span><input class="p-in" type="text" inputmode="numeric" placeholder="0"></label>' +
      '<label class="p-money"><span class="cap" aria-hidden="true">Left with</span><span class="shek" aria-hidden="true">₪</span><input class="p-out" type="text" inputmode="numeric" placeholder="0"></label>' +
      '<button type="button" class="p-del">&times;</button>';
    row.querySelector('.p-name').value = name;
    row.querySelector('.p-in').value = bought;
    row.querySelector('.p-out').value = left;
    sheet.appendChild(row);
    return row;
  };

  const fill = (people) => {
    sheet.textContent = '';
    people.forEach(([name, bought, left]) => addRow(name, bought, left));
    relabel();
    render();
  };

  sheet.addEventListener('input', () => { relabel(); render(); });
  sheet.addEventListener('click', (e) => {
    const del = e.target.closest('.p-del');
    if (!del) return;
    if (sheet.querySelectorAll('.prow').length < 2) return;
    const next = del.closest('.prow').nextElementSibling || del.closest('.prow').previousElementSibling;
    del.closest('.prow').remove();
    (next ? next.querySelector('.p-name') : sheet).focus?.();
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    relabel();
    render();
  });

  document.getElementById('settle-add')?.addEventListener('click', () => {
    const row = addRow();
    relabel();
    render();
    row.querySelector('.p-name').focus();
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      const people = chip.dataset.night.split(',').map((part) => {
        const bits = part.trim().split(/\s+/);
        return [bits.slice(0, -2).join(' '), bits.at(-2), bits.at(-1)];
      });
      document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      fill(people);
    });
  });

  relabel();
  render();
})();
