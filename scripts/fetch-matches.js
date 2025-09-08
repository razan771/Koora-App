const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUES = [
  { id: 4328, name: "English Premier League" },
  { id: 4331, name: "German Bundesliga" },
  { id: 4480, name: "UEFA Champions League" },
];

// ⚽ تنسيق المباراة
function formatMatch(event, leagueName) {
  return {
    id: Number(event.idEvent),
    league: leagueName,
    time: event.dateEvent && event.strTime ? `${event.dateEvent} ${event.strTime}` : event.dateEvent || "",
    home: {
      name: event.strHomeTeam,
      logo: event.strHomeTeamBadge || null,
      country_name: null,
      country_flag: null,
    },
    away: {
      name: event.strAwayTeam,
      logo: event.strAwayTeamBadge || null,
      country_name: null,
      country_flag: null,
    },
  };
}

async function fetchMatchesForDate(dateStr) {
  let allMatches = [];

  for (const league of LEAGUES) {
    const url = `${BASE_URL}/eventsday.php?d=${dateStr}&l=${encodeURIComponent(league.name)}`;

    try {
      const res = await axios.get(url);
      const events = res.data.events || [];

      const formatted = events.map(ev => formatMatch(ev, league.name));
      allMatches = allMatches.concat(formatted);

      console.log(`✅ ${league.name}: ${formatted.length} مباراة`);
    } catch (err) {
      console.error(`❌ فشل في جلب ${league.name}:`, err.message);
    }
  }

  const outputPath = path.resolve(__dirname, `../assets/data/matches-${dateStr}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allMatches, null, 2), "utf-8");

  console.log(`✅ تم حفظ مباريات ${dateStr}: ${allMatches.length} مباراة`);
}

async function fetchTodayAndYesterday() {
  const today = moment().format("YYYY-MM-DD");
  const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

  await fetchMatchesForDate(today);
  await fetchMatchesForDate(yesterday);
}

fetchTodayAndYesterday();
