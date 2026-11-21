import { esc, markSvg } from './mark';

/*
 * Abstract Ditto screens (brief v2.2, 4.3 point 2): the layout and labels of a real Ditto screen, simplified, with
 * invented data. A recruiter should be able to tell which screen it is and what it does. Styles: styles/screens.css.
 * They're pictures, so they're hidden from assistive tech; each carries a plain-language label instead.
 */

const initials = (n: string) => n.split(' ').map((w) => w[0]).join('');
const av = (name: string, hue: number) => `<span class="scr-av" style="--hue:${hue}">${esc(initials(name))}</span>`;

const NAV = ['Candidates', 'Jobs', 'Clients', 'Placements', 'Reports'];

function frame(active: string, label: string, body: string) {
  return `<figure class="scr" role="img" aria-label="${esc(label)}">
    <div class="scr__side" aria-hidden="true">
      <span class="scr__logo">${markSvg('scr__mark')}</span>
      <ul>${NAV.map((n) => `<li${n === active ? ' class="is-on"' : ''}><i></i><span>${n}</span></li>`).join('')}</ul>
    </div>
    <div class="scr__main" aria-hidden="true">${body}</div>
  </figure>`;
}

const SEARCH = [
  { name: 'Amara Okafor', role: 'Financial Manager, retail group', match: 96, hue: 205 },
  { name: 'Sipho Nkosi', role: 'Finance Lead, FMCG', match: 91, hue: 160 },
  { name: 'Claire Jacobs', role: 'Senior Financial Accountant, retail', match: 88, hue: 265 },
  { name: 'Naledi Dlamini', role: 'Group Accountant, retail', match: 84, hue: 330 },
];

/** Source: Scout's ranked results for a pasted job spec. */
export function sourceScreen() {
  return frame(
    'Candidates',
    'A Ditto search screen: a job spec searched by Scout, with candidates from your own database ranked by match.',
    `<div class="scr__head"><p class="scr__title">Candidates</p><p class="scr__meta scr__meta--blue">14 match this brief</p></div>
    <div class="scr-search"><span class="scr-search__scout">Scout</span><span class="scr-search__q"><b>Financial Manager</b><b>Cape Town</b><b>CA(SA)</b><b>5+ years retail</b></span></div>
    <ul class="scr-list">${SEARCH.map(
      (p, i) => `<li class="scr-row">${av(p.name, p.hue)}<span class="scr-row__who"><b>${esc(p.name)}</b><span>${esc(p.role)}</span>${
        i === 0 ? '<em>AI summary: 8 years in retail finance, led month-end for 40 stores.</em>' : ''
      }</span><span class="scr-match"><i style="--w:${p.match}%"></i><b>${p.match}%</b></span></li>`,
    ).join('')}</ul>`,
  );
}

const BOARD: { stage: string; cards: { name: string; hue: number; note?: string; hot?: boolean }[] }[] = [
  { stage: 'Applied', cards: [{ name: 'Lindiwe Khumalo', hue: 40 }, { name: 'Ryan Peters', hue: 190 }, { name: 'Zanele Mthembu', hue: 300 }] },
  { stage: 'Screening', cards: [{ name: 'Kagiso Molefe', hue: 120, note: 'Scored 92' }, { name: 'Anika Botha', hue: 15 }] },
  { stage: 'Interview', cards: [{ name: 'Thabo Mokoena', hue: 28, note: 'Thu 10:00', hot: true }, { name: 'Megan Smith', hue: 250 }] },
  { stage: 'Offer', cards: [{ name: 'Sizwe Ndlovu', hue: 95, note: 'Offer sent' }] },
];

/** Engage: the pipeline board for one job, with the day's email and calendar beside it. */
export function engageScreen() {
  return frame(
    'Jobs',
    'A Ditto pipeline board: candidates for one job in columns from Applied to Offer, with interviews and emails on the same screen.',
    `<div class="scr__head"><p class="scr__title">Operations Manager</p><p class="scr__meta">Kestrel Logistics · <span class="scr-pill">Open</span></p></div>
    <div class="scr-board">${BOARD.map(
      (c) => `<div class="scr-col"><p>${esc(c.stage)} <b>${c.cards.length}</b></p><ul>${c.cards
        .map(
          (k) => `<li class="scr-card${k.hot ? ' is-hot' : ''}">${av(k.name, k.hue)}<span><b>${esc(k.name)}</b>${k.note ? `<em>${esc(k.note)}</em>` : ''}</span></li>`,
        )
        .join('')}</ul></div>`,
    ).join('')}</div>
    <ul class="scr-feed">
      <li><span class="scr-feed__dot"></span><b>Interview</b> Thabo Mokoena · Thursday 10:00 · in your calendar</li>
      <li><span class="scr-feed__dot scr-feed__dot--mail"></span><b>Email</b> Megan Smith replied · logged on her timeline</li>
    </ul>`,
  );
}

const TEAM = [
  { who: 'Jane', done: 4, target: 5 },
  { who: 'Marcus', done: 3, target: 4 },
  { who: 'Lerato', done: 2, target: 4 },
];

/** Place: placements, fees and targets, per recruiter and for the team. */
export function placeScreen() {
  return frame(
    'Reports',
    'A Ditto placements report: placements and fees this month, with each recruiter measured against their target.',
    `<div class="scr__head"><p class="scr__title">Placements and targets</p><p class="scr__meta">This month · team</p></div>
    <div class="scr-kpis"><div><p>Placements</p><b>9</b></div><div><p>Approved fees</p><b>R1,314,000</b></div><div><p>Team target</p><b>69%</b></div></div>
    <ul class="scr-targets">${TEAM.map(
      (r) => `<li><span class="scr-targets__who">${esc(r.who)}</span><span class="scr-targets__track"><i style="--w:${(r.done / r.target) * 100}%"></i></span><span class="scr-targets__val">${r.done} of ${r.target}</span></li>`,
    ).join('')}</ul>
    <div class="scr-placed">${av('Priya Naidoo', 18)}<span><b>Priya Naidoo</b> · Senior Product Designer · Lumen Pay</span><span class="scr-pill">Placed</span></div>`,
  );
}

export const SCREENS = { source: sourceScreen, engage: engageScreen, place: placeScreen };
