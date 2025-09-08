const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUES = [
  { id: 4328, name: "الدوري الإنجليزي الممتاز" },
  { id: 4331, name: "الدوري الألماني" },
  { id: 4480, name: "دوري أبطال أوروبا" },
];

// ⚽ تنسيق المباراة
function formatMatch(event, leagueName) {
  return {
    id: event.idEvent,
    league: leagueName,
    date: event.dateEvent,
    time: event.strTime,
    home: {
      name: event.strHomeTeam,
      score: event.intHomeScore,
    },
    away: {
      name: event.strAwayTeam,
      score: event.intAwayScore,
    },
    status: event.strStatus,
  };
}

async function fetchMatchesForDate(dateStr) {
  let allMatches = [];

  for (const league of LEAGUES) {
    const url = `${BASE_URL}/eventsseason.php?id=${league.id}&s=2024-2025`;

    try {
      const res = await axios.get(url);
      const events = res.data.events || [];

      // فلترة حسب التاريخ المطلوب
      const filtered = events.filter(ev => ev.dateEvent === dateStr);
      const formatted = filtered.map(ev => formatMatch(ev, league.name));

      allMatches = allMatches.concat(formatted);
    } catch (err) {
      console.error(`❌ فشل في جلب ${league.name}:`, err.message);
    }
  }

  // حفظ النتائج
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
