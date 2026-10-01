function isPlayed(score) {
  return Number.isInteger(score);
}

function playerForRound(roundIndex) {
  return roundIndex % playerNames.length;
}

function isoWeeksInYear(year) {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return getISOWeek(dec28).week;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));

  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    year: d.getUTCFullYear(),
    week
  };
}

function isoWeekToMonday(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;

  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const result = new Date(mondayWeek1);
  result.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);

  return result;
}

function addWeeksToISO(startYear, startWeek, weeksToAdd) {
  const monday = isoWeekToMonday(startYear, startWeek);
  monday.setUTCDate(monday.getUTCDate() + weeksToAdd * 7);
  return getISOWeek(monday);
}

function getRoundSchedule() {
  return Array.from({ length: season.rounds }, (_, roundIndex) => {
    const iso = addWeeksToISO(
      season.startYear,
      season.startWeek,
      roundIndex
    );

    return {
      round: roundIndex + 1,
      week: iso.week,
      year: iso.year,
      playerIndex: playerForRound(roundIndex),
      playerName: playerNames[playerForRound(roundIndex)],
      score: results[roundIndex] ?? null
    };
  });
}

function buildPlayerStats(schedule) {
  return playerNames.map((name, playerIndex) => {
    const playerRounds = schedule.filter(round =>
      round.playerIndex === playerIndex
    );

    const played = playerRounds.filter(round => isPlayed(round.score));
    const total = played.reduce((sum, round) => sum + round.score, 0);
    const average = played.length ? total / played.length : null;
    const best = played.length
      ? Math.max(...played.map(round => round.score))
      : null;

    return {
      name,
      playerIndex,
      played: played.length,
      total,
      average,
      best
    };
  });
}

function getRanking(stats) {
  return [...stats].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;

    if ((b.average ?? -1) !== (a.average ?? -1)) {
      return (b.average ?? -1) - (a.average ?? -1);
    }

    return a.playerIndex - b.playerIndex;
  });
}

function renderStandings(ranking) {
  const tbody = document.getElementById("standingsBody");
  tbody.innerHTML = "";

  ranking.forEach((player, index) => {
    const row = document.createElement("tr");
    const rankClass = index === 0 ? "rank rank--top" : "rank";

    row.innerHTML = `
      <td class="${rankClass}">${index + 1}</td>
      <td class="player-name">${player.name}</td>
      <td>${player.played}/6</td>
      <td class="total">${player.total}</td>
      <td>${player.average === null ? "–" : player.average.toFixed(2)}</td>
      <td>${player.best ?? "–"}</td>
    `;

    tbody.appendChild(row);
  });
}

function renderRounds(schedule) {
  const tbody = document.getElementById("roundsBody");
  tbody.innerHTML = "";

  const nextIndex = schedule.findIndex(round => !isPlayed(round.score));

  schedule.forEach((round, index) => {
    const row = document.createElement("tr");

    let statusText = "Kommande";
    let statusClass = "status status--upcoming";

    if (isPlayed(round.score)) {
      statusText = "Spelad";
      statusClass = "status status--played";
    } else if (index === nextIndex) {
      statusText = "Nästa";
      statusClass = "status status--next";
      row.classList.add("next-round");
    }

    row.innerHTML = `
      <td>${round.round}</td>
      <td>v.${round.week}</td>
      <td>${round.year}</td>
      <td class="player-name">${round.playerName}</td>
      <td class="${isPlayed(round.score) ? "" : "score-empty"}">
        ${isPlayed(round.score) ? round.score : "–"}
      </td>
      <td><span class="${statusClass}">${statusText}</span></td>
    `;

    tbody.appendChild(row);
  });
}

function renderSummary(schedule, ranking) {
  const playedRounds = schedule.filter(round => isPlayed(round.score));
  const nextRound = schedule.find(round => !isPlayed(round.score));
  const leader = ranking.find(player => player.played > 0);

  if (leader) {
    document.getElementById("leaderName").textContent = leader.name;
    document.getElementById("leaderScore").textContent =
      `${leader.total} poäng`;
  } else {
    document.getElementById("leaderName").textContent = "Ingen ännu";
    document.getElementById("leaderScore").textContent = "0 poäng";
  }

  if (nextRound) {
    document.getElementById("nextPlayer").textContent =
      nextRound.playerName;
    document.getElementById("nextRound").textContent =
      `Omgång ${nextRound.round} · v.${nextRound.week} ${nextRound.year}`;
  } else {
    document.getElementById("nextPlayer").textContent = "Klart!";
    document.getElementById("nextRound").textContent =
      "Alla omgångar spelade";
  }

  if (playedRounds.length) {
    const best = playedRounds.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    document.getElementById("bestRound").textContent =
      `${best.score} rätt`;
    document.getElementById("bestRoundPlayer").textContent =
      `${best.playerName}, v.${best.week} ${best.year}`;
  } else {
    document.getElementById("bestRound").textContent = "–";
    document.getElementById("bestRoundPlayer").textContent =
      "Ingen ännu";
  }

  const first = schedule[0];
  const last = schedule[schedule.length - 1];

  const seasonName =
    first.year === last.year
      ? `${first.year}`
      : `${first.year}/${last.year}`;

  document.getElementById("seasonLabel").textContent =
    `Stryktipset ${seasonName}`;
  document.getElementById("seasonRange").textContent = seasonName;
  document.getElementById("seasonWeeks").textContent =
    `v.${first.week} ${first.year} – v.${last.week} ${last.year}`;
  document.getElementById("footerSeason").textContent = seasonName;
}

function validateData() {
  if (!Number.isInteger(season.startWeek) || season.startWeek < 1 || season.startWeek > 53) {
    console.warn("Ogiltig startWeek:", season.startWeek);
  }

  if (!Number.isInteger(season.startYear)) {
    console.warn("Ogiltigt startYear:", season.startYear);
  }

  if (season.startWeek > isoWeeksInYear(season.startYear)) {
    console.warn(
      `År ${season.startYear} har inte vecka ${season.startWeek}.`
    );
  }

  if (results.length < season.rounds) {
    console.warn(
      `results innehåller ${results.length} värden men season.rounds är ${season.rounds}.`
    );
  }

  results.forEach((score, index) => {
    if (
      score !== null &&
      (!Number.isInteger(score) || score < 0 || score > 13)
    ) {
      console.warn(`Ogiltigt resultat i omgång ${index + 1}:`, score);
    }
  });
}

function init() {
  validateData();

  const schedule = getRoundSchedule();
  const stats = buildPlayerStats(schedule);
  const ranking = getRanking(stats);

  renderStandings(ranking);
  renderRounds(schedule);
  renderSummary(schedule, ranking);
}

init();
