// ===== SÄSONGSINSTÄLLNINGAR =====
// Ändra dessa två värden inför en ny säsong.
const season = {
  startWeek: 34,
  startYear: 2026,
  rounds: 36
};

// Namnen kan ändras när ni vill.
const playerNames = [
  "Spelare 1",
  "Spelare 2",
  "Spelare 3",
  "Spelare 4",
  "Spelare 5",
  "Spelare 6"
];

// ===== RESULTAT =====
// Fyll i resultaten i kronologisk ordning.
// Varje tal är antal rätt på Stryktipset (0–13).
// null = omgången är ännu inte spelad.
//
// Spelaren räknas ut automatiskt:
// Omgång 1 = Spelare 1
// Omgång 2 = Spelare 2
// ...
// Omgång 6 = Spelare 6
// Omgång 7 = Spelare 1
// osv.

const results = [
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  null, null, null, null, null, null
];
