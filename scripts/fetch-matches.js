const axios = require("axios");
const fs = require("fs");
const path = require("path");

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
    date: event.dateEvent || null,
    time: event.strTime || null,
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

async function fetchUpcomingMatches() {
  let allMatches = [];

  for (const league of LEAGUES) {
    const url = `${BASE_URL}/eventsnextleague.php?id=${league.id}`;

    try {
      const res = await axios.get(url);
      const events = res.data.events || [];

      const formatted = events.map(ev => formatMatch(ev, league.name));
      allMatches = allMatches.concat(formatted);

      console.log(`✅ ${league.name}: ${formatted.length} مباراة قادمة`);
    } catch (err) {
      console.error(`❌ فشل في جلب ${league.name}:`, err.message);
    }
  }

  const outputPath = path.resolve(__dirname, `../assets/data/upcoming-matches.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allMatches, null, 2), "utf-8");

  console.log(`✅ تم حفظ ${allMatches.length} مباراة في upcoming-matches.json`);
}

fetchUpcomingMatches();
